import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Heart,
  CalendarHeart,
  ChevronDown,
  Download,
  ExternalLink,
} from "lucide-react";
import { useSettings } from "@/lib/store";
import { useState, useEffect, useMemo } from "react";
import heroImg from "@/assets/hero.jpg";
import engagementImg from "@/assets/engagement.jpg";
import weddingImg from "@/assets/wedding.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Our Wedding Story — A Cinematic Album" },
      {
        name: "description",
        content:
          "Two hearts, one journey, a lifetime together. Step into our digital wedding album.",
      },
      { property: "og:title", content: "Our Wedding Story" },
      {
        property: "og:description",
        content: "Two hearts, one journey, a lifetime together.",
      },
    ],
  }),
  component: Index,
});

function getImageUrl(urlOrId: string) {
  if (!urlOrId) return "";
  if (urlOrId.startsWith("http")) {
    const match =
      urlOrId.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || urlOrId.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match) {
      return `https://lh3.googleusercontent.com/d/${match[1]}=w1920`;
    }
    return urlOrId;
  }
  if (urlOrId.length > 20 && !urlOrId.includes("/") && !urlOrId.includes(".")) {
    return `https://lh3.googleusercontent.com/d/${urlOrId}=w1920`;
  }
  return urlOrId;
}

function Index() {
  const {
    brideName,
    groomName,
    weddingDate,
    subtitle,
    heroImage,
    engagementHeroImage,
    kalupidithalHeroImage,
    weddingHeroImage,
    receptionHeroImage,
    saveTheDate,
  } = useSettings();
  const [calendarMenuOpen, setCalendarMenuOpen] = useState(false);

  const date = new Date(weddingDate);
  const formatted = isNaN(date.getTime())
    ? weddingDate
    : date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  const bg = getImageUrl(heroImage) || heroImg;

  // --- Countdown Logic ---
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  const eventTime = saveTheDate?.time || "10:30 AM";

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(`${weddingDate}T${convertTo24Hour(eventTime)}`);
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [weddingDate, eventTime]);

  function convertTo24Hour(timeStr: string): string {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return "12:00";
    let h = parseInt(match[1]);
    const m = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && h < 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${m}:00`;
  }

  const getGCalFormattedDates = () => {
    const start = new Date(date);
    if (isNaN(start.getTime())) return { start: "", end: "" };
    const time24 = convertTo24Hour(eventTime);
    const [hours, minutes] = time24.split(":");
    start.setHours(parseInt(hours), parseInt(minutes), 0);

    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000); // 4 hour duration
    const toISOStr = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    return { start: toISOStr(start), end: toISOStr(end) };
  };

  const googleCalendarUrl = useMemo(() => {
    if (isNaN(date.getTime())) return "";
    const dates = getGCalFormattedDates();
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Wedding+of+${encodeURIComponent(brideName)}+%26+${encodeURIComponent(groomName)}&dates=${dates.start}/${dates.end}&details=${encodeURIComponent(saveTheDate?.description || "")}&location=${encodeURIComponent(saveTheDate?.venueName || "")}+%2C+${encodeURIComponent(saveTheDate?.venueAddress || "")}`;
  }, [brideName, groomName, date, eventTime, saveTheDate]);

  const yahooCalendarUrl = useMemo(() => {
    if (isNaN(date.getTime())) return "";
    const dates = getGCalFormattedDates();
    return `https://calendar.yahoo.com/?v=60&view=d&type=20&title=Wedding+of+${encodeURIComponent(brideName)}+%26+${encodeURIComponent(groomName)}&st=${dates.start}&et=${dates.end}&desc=${encodeURIComponent(saveTheDate?.description || "")}&in_loc=${encodeURIComponent(saveTheDate?.venueName || "")}+%2C+${encodeURIComponent(saveTheDate?.venueAddress || "")}`;
  }, [brideName, groomName, date, eventTime, saveTheDate]);

  const outlookCalendarUrl = useMemo(() => {
    if (isNaN(date.getTime())) return "";
    const dates = getGCalFormattedDates();
    return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=Wedding+of+${encodeURIComponent(brideName)}+%26+${encodeURIComponent(groomName)}&startdt=${dates.start}&enddt=${dates.end}&body=${encodeURIComponent(saveTheDate?.description || "")}&location=${encodeURIComponent(saveTheDate?.venueName || "")}+%2C+${encodeURIComponent(saveTheDate?.venueAddress || "")}`;
  }, [brideName, groomName, date, eventTime, saveTheDate]);

  const handleDownloadICS = () => {
    if (isNaN(date.getTime())) return;
    const dates = getGCalFormattedDates();

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Our Wedding Album//Save the Date//EN",
      "BEGIN:VEVENT",
      `UID:wedding-event-${date.getTime()}`,
      `DTSTART:${dates.start}`,
      `DTEND:${dates.end}`,
      `SUMMARY:Wedding of ${brideName} & ${groomName}`,
      `DESCRIPTION:${saveTheDate?.description || ""}`,
      `LOCATION:${saveTheDate?.venueName || ""}\\, ${saveTheDate?.venueAddress || ""}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `save-the-date.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCalendarMenuOpen(false);
  };

  return (
    <>
      {/* HERO */}
      <section className="relative grid min-h-svh place-items-center overflow-hidden text-center">
        <div className="absolute inset-0 -z-10">
          <img
            src={bg}
            alt=""
            className="animate-ken-burns h-full w-full object-cover"
            width={1920}
            height={1280}
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/35 via-black/15 to-background" />
        </div>
        <div className="relative px-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xs tracking-[0.5em] uppercase text-white/90"
          >
            We invite you to our forever
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.9 }}
            className="font-script mt-5 text-7xl text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.4)] sm:text-9xl"
          >
            {brideName} &amp; {groomName}
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="bg-white/70 mx-auto mt-6 h-px w-32"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="mt-6 text-sm tracking-[0.35em] uppercase text-white/90"
          >
            {formatted}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="font-display mx-auto mt-6 max-w-xl text-xl text-white/95 italic sm:text-2xl"
          >
            "{subtitle}"
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0 }}
            className="mt-10 animate-fade-in"
          >
            <Link
              to="/save-the-date"
              className="gradient-luxe shadow-elegant group inline-flex items-center gap-3 rounded-full px-8 py-4 text-sm font-medium tracking-[0.3em] text-white uppercase transition-transform hover:scale-[1.04]"
            >
              Enter Our Story
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80"
        >
          <span className="block h-12 w-px animate-pulse bg-white/60" />
        </motion.div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-3xl px-6 py-28 text-center">
        <Heart className="text-primary mx-auto" size={20} />
        <h2 className="font-display mt-4 text-4xl sm:text-5xl">A love, lovingly remembered.</h2>
        <p className="text-muted-foreground mt-6 leading-relaxed">
          Every glance, every laugh, every quiet promise — gathered here so the day we said
          <em> forever</em> never fades. Wander through our engagement, our wedding, and every
          memory in between.
        </p>
      </section>

      {/* COUNTDOWN / SAVE THE DATE WIDGET */}
      {saveTheDate?.enabled && (
        <section className="mx-auto max-w-4xl px-6 pb-28 text-center">
          <div className="bg-card shadow-soft rounded-3xl border border-primary/15 p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute top-4 left-4 h-6 w-6 border-t border-l border-primary/20 rounded-tl-xl pointer-events-none" />
            <div className="absolute top-4 right-4 h-6 w-6 border-t border-r border-primary/20 rounded-tr-xl pointer-events-none" />

            <span className="text-xs tracking-[0.4em] uppercase text-primary font-semibold">
              Save Our Date
            </span>
            <h3 className="font-display mt-4 text-3xl sm:text-4xl">Counting down to our forever</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              {formatted} — {saveTheDate.time}
            </p>

            {timeLeft.isOver ? (
              <p className="font-script text-gradient-luxe mt-6 text-4xl">The Celebration Began!</p>
            ) : (
              <div className="mt-8 flex justify-center gap-4">
                {[
                  { val: timeLeft.days, label: "Days" },
                  { val: timeLeft.hours, label: "Hours" },
                  { val: timeLeft.minutes, label: "Mins" },
                  { val: timeLeft.seconds, label: "Secs" },
                ].map((t) => (
                  <div key={t.label} className="flex flex-col items-center">
                    <div className="glass border-primary/10 flex h-16 w-16 items-center justify-center rounded-2xl border text-xl font-bold sm:h-20 sm:w-20 sm:text-2xl">
                      {String(t.val).padStart(2, "0")}
                    </div>
                    <span className="text-muted-foreground mt-2 text-[10px] tracking-wider uppercase">
                      {t.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-10 flex flex-col justify-center items-center gap-4 sm:flex-row relative">
              <Link
                to="/save-the-date"
                className="gradient-luxe shadow-elegant flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-xs font-semibold tracking-[0.25em] text-white uppercase transition-all hover:scale-[1.04] w-full sm:w-auto"
              >
                View Invitation
              </Link>

              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setCalendarMenuOpen(!calendarMenuOpen)}
                  className="glass border-primary/20 hover:bg-primary/10 flex w-full items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-xs font-semibold tracking-[0.25em] uppercase transition-all hover:scale-[1.04]"
                >
                  <CalendarHeart size={14} /> Add to Calendar <ChevronDown size={14} />
                </button>

                <AnimatePresence>
                  {calendarMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setCalendarMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="glass shadow-elegant border-primary/20 absolute right-0 left-0 bottom-full z-50 mb-2 overflow-hidden rounded-2xl border p-2 w-full sm:w-56"
                      >
                        <a
                          href={googleCalendarUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => setCalendarMenuOpen(false)}
                          className="hover:bg-primary/10 flex items-center justify-between rounded-xl px-4 py-2.5 text-xs tracking-wider uppercase text-foreground/85 transition-colors"
                        >
                          Google Calendar <ExternalLink size={12} className="opacity-60" />
                        </a>
                        <button
                          onClick={handleDownloadICS}
                          className="hover:bg-primary/10 flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-xs tracking-wider uppercase text-foreground/85 transition-colors"
                        >
                          iCal / Apple <Download size={12} className="opacity-60" />
                        </button>
                        <a
                          href={outlookCalendarUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => setCalendarMenuOpen(false)}
                          className="hover:bg-primary/10 flex items-center justify-between rounded-xl px-4 py-2.5 text-xs tracking-wider uppercase text-foreground/85 transition-colors"
                        >
                          Outlook Web <ExternalLink size={12} className="opacity-60" />
                        </a>
                        <a
                          href={yahooCalendarUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => setCalendarMenuOpen(false)}
                          className="hover:bg-primary/10 flex items-center justify-between rounded-xl px-4 py-2.5 text-xs tracking-wider uppercase text-foreground/85 transition-colors"
                        >
                          Yahoo Calendar <ExternalLink size={12} className="opacity-60" />
                        </a>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FOUR CHAPTER CARDS */}
      <section className="mx-auto grid max-w-6xl gap-8 px-6 pb-28 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            to: "/engagement",
            label: "Engagement",
            sub: "The moment we promised forever",
            img: getImageUrl(engagementHeroImage) || engagementImg,
          },
          {
            to: "/kalupidithal",
            label: "Kalupidithal",
            sub: "Rituals & blessings",
            img: getImageUrl(kalupidithalHeroImage) || weddingImg,
          },
          {
            to: "/wedding",
            label: "Wedding",
            sub: "The day forever began",
            img: getImageUrl(weddingHeroImage) || weddingImg,
          },
          {
            to: "/reception",
            label: "Reception",
            sub: "The celebration of love",
            img: getImageUrl(receptionHeroImage) || weddingImg,
          },
        ].map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group shadow-soft relative block aspect-4/5 overflow-hidden rounded-3xl"
          >
            <img
              src={c.img}
              alt={c.label}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-1200 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-10 text-white">
              <p className="text-xs tracking-[0.4em] uppercase opacity-80">Milestone</p>
              <h3 className="font-script mt-1 text-5xl">{c.label}</h3>
              <p className="mt-2 text-sm opacity-90">{c.sub}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase">
                Explore <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
