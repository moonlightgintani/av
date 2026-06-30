import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useSettings } from "@/lib/store";
import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  CalendarHeart,
  Heart,
  Download,
  ChevronDown,
  Check,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { listFolder } from "@/lib/drive";
import { getLocalMedia } from "@/lib/localMedia";
import { MasonryGallery } from "@/components/MasonryGallery";
import { VideoGrid } from "@/components/VideoGrid";

export const Route = createFileRoute("/save-the-date")({
  head: () => ({
    meta: [
      { title: "Save Our Date — Our Wedding Story" },
      {
        name: "description",
        content: "Please save the date for our wedding ceremony. Add to calendar and view details.",
      },
      { property: "og:title", content: "Save Our Date — Our Wedding Story" },
    ],
  }),
  component: SaveTheDatePage,
});

function SaveTheDatePage() {
  const { brideName, groomName, weddingDate, saveTheDate, driveApiKey, mediaSource, bumpCacheKey } =
    useSettings();

  const {
    title = "Save Our Date",
    venueName = "The Grand Palace",
    venueAddress = "123 Elegance Boulevard, Royal Gardens",
    time = "10:30 AM",
    description = "We are getting married! Join us to celebrate our forever union.",
    mapsUrl = "https://maps.google.com",
    theme = "gold",
    rsvpUrl = "/contact",
    calendarNotes = "Save the Date! We'd be honored to have you with us.",
    folderId = "1U9O6ZE6TUGSUuJECJUMbcGgJvmEX1fiQ",
    videoFolderId = "1p1IfCbIpYeHN9tIAjLl0KhV4Cm3Hu7-j",
  } = saveTheDate || {};

  const photosQuery = useQuery({
    queryKey: ["save-the-date-pics", folderId, mediaSource, driveApiKey, bumpCacheKey],
    queryFn: () => {
      if (mediaSource === "local") {
        return getLocalMedia().filter(
          (i) => !i.isVideo && (i.folder === "save-the-date" || i.folder === "engagement"),
        );
      }
      return listFolder(folderId, driveApiKey);
    },
    enabled: !!folderId && (mediaSource === "local" || !!driveApiKey),
    staleTime: 5 * 60_000,
  });

  const videosQuery = useQuery({
    queryKey: ["save-the-date-videos", videoFolderId, mediaSource, driveApiKey, bumpCacheKey],
    queryFn: () => {
      if (mediaSource === "local") {
        return getLocalMedia().filter(
          (i) => i.isVideo && (i.folder === "save-the-date" || i.folder === "engagement"),
        );
      }
      return listFolder(videoFolderId, driveApiKey);
    },
    enabled: !!videoFolderId && (mediaSource === "local" || !!driveApiKey),
    staleTime: 5 * 60_000,
  });

  // --- Countdown Logic ---
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(`${weddingDate}T${convertTo24Hour(time)}`);
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
  }, [weddingDate, time]);

  // --- Calendar Mockup Data ---
  const weddingDateObj = useMemo(() => new Date(weddingDate), [weddingDate]);
  const calendarData = useMemo(() => {
    if (isNaN(weddingDateObj.getTime())) return null;
    const year = weddingDateObj.getFullYear();
    const month = weddingDateObj.getMonth();
    const monthName = weddingDateObj.toLocaleString("en-US", { month: "long" });
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return {
      year,
      month,
      monthName,
      firstDayIndex,
      daysInMonth,
      dayNumber: weddingDateObj.getDate(),
    };
  }, [weddingDateObj]);

  // --- Dropdown state for Calendar add ---
  const [calendarMenuOpen, setCalendarMenuOpen] = useState(false);

  // Helper: convert "10:30 AM" to "10:30" (24h)
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

  // Format date to ISO (YmdTHisZ) for Google Calendar
  const getGCalFormattedDates = () => {
    const start = new Date(weddingDateObj);
    const time24 = convertTo24Hour(time);
    const [hours, minutes] = time24.split(":");
    start.setHours(parseInt(hours), parseInt(minutes), 0);

    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000); // 4 hour event duration

    const toISOStr = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    return { start: toISOStr(start), end: toISOStr(end) };
  };

  // --- Calendar Links ---
  const googleCalendarUrl = useMemo(() => {
    if (isNaN(weddingDateObj.getTime())) return "";
    const dates = getGCalFormattedDates();
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Wedding+of+${encodeURIComponent(brideName)}+%26+${encodeURIComponent(groomName)}&dates=${dates.start}/${dates.end}&details=${encodeURIComponent(description)}+-+${encodeURIComponent(calendarNotes)}&location=${encodeURIComponent(venueName)}+%2C+${encodeURIComponent(venueAddress)}`;
  }, [
    brideName,
    groomName,
    weddingDateObj,
    time,
    venueName,
    venueAddress,
    description,
    calendarNotes,
  ]);

  const yahooCalendarUrl = useMemo(() => {
    if (isNaN(weddingDateObj.getTime())) return "";
    const dates = getGCalFormattedDates();
    // Yahoo format uses st and et, and can take duration or end
    return `https://calendar.yahoo.com/?v=60&view=d&type=20&title=Wedding+of+${encodeURIComponent(brideName)}+%26+${encodeURIComponent(groomName)}&st=${dates.start}&et=${dates.end}&desc=${encodeURIComponent(description)}+-+${encodeURIComponent(calendarNotes)}&in_loc=${encodeURIComponent(venueName)}+%2C+${encodeURIComponent(venueAddress)}`;
  }, [
    brideName,
    groomName,
    weddingDateObj,
    time,
    venueName,
    venueAddress,
    description,
    calendarNotes,
  ]);

  const outlookCalendarUrl = useMemo(() => {
    if (isNaN(weddingDateObj.getTime())) return "";
    const dates = getGCalFormattedDates();
    return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=Wedding+of+${encodeURIComponent(brideName)}+%26+${encodeURIComponent(groomName)}&startdt=${dates.start}&enddt=${dates.end}&body=${encodeURIComponent(description)}+-+${encodeURIComponent(calendarNotes)}&location=${encodeURIComponent(venueName)}+%2C+${encodeURIComponent(venueAddress)}`;
  }, [
    brideName,
    groomName,
    weddingDateObj,
    time,
    venueName,
    venueAddress,
    description,
    calendarNotes,
  ]);

  const handleDownloadICS = () => {
    if (isNaN(weddingDateObj.getTime())) return;
    const dates = getGCalFormattedDates();

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Our Wedding Album//Save the Date//EN",
      "BEGIN:VEVENT",
      `UID:wedding-event-${weddingDateObj.getTime()}`,
      `DTSTART:${dates.start}`,
      `DTEND:${dates.end}`,
      `SUMMARY:Wedding of ${brideName} & ${groomName}`,
      `DESCRIPTION:${description} - ${calendarNotes}`,
      `LOCATION:${venueName}\\, ${venueAddress}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `save-the-date-${brideName.toLowerCase()}-${groomName.toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCalendarMenuOpen(false);
  };

  // --- Theme Classes mapping ---
  const themeClasses = {
    gold: {
      cardBg:
        "bg-gradient-to-br from-amber-50/90 via-stone-50/90 to-amber-100/90 border-amber-300/40 text-stone-800",
      textPrimary: "text-amber-800",
      textMuted: "text-stone-600",
      calendarHeart: "fill-amber-600 text-amber-600",
      buttonSolid: "bg-amber-800 hover:bg-amber-900 text-amber-50",
      borderAccent: "border-amber-400/40",
      pulseColor: "bg-amber-500",
    },
    rose: {
      cardBg:
        "bg-gradient-to-br from-rose-50/90 via-stone-50/90 to-rose-100/90 border-rose-300/40 text-stone-800",
      textPrimary: "text-rose-800",
      textMuted: "text-stone-600",
      calendarHeart: "fill-rose-600 text-rose-600",
      buttonSolid: "bg-rose-800 hover:bg-rose-900 text-rose-50",
      borderAccent: "border-rose-400/40",
      pulseColor: "bg-rose-500",
    },
    emerald: {
      cardBg:
        "bg-gradient-to-br from-teal-950 via-emerald-950 to-emerald-900 border-amber-500/30 text-emerald-50",
      textPrimary: "text-amber-300",
      textMuted: "text-emerald-200/80",
      calendarHeart: "fill-amber-400 text-amber-400",
      buttonSolid: "bg-amber-500 hover:bg-amber-600 text-teal-950",
      borderAccent: "border-amber-500/20",
      pulseColor: "bg-amber-400",
    },
  };

  const style = themeClasses[theme as keyof typeof themeClasses] || themeClasses.gold;

  // Calendar numbers calculation
  const calendarDays = useMemo(() => {
    if (!calendarData) return [];
    const days = [];
    // Padding for first week days
    for (let i = 0; i < calendarData.firstDayIndex; i++) {
      days.push(null);
    }
    // Days numbers
    for (let i = 1; i <= calendarData.daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [calendarData]);

  const formattedDate = useMemo(() => {
    if (isNaN(weddingDateObj.getTime())) return weddingDate;
    return weddingDateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [weddingDateObj, weddingDate]);

  return (
    <>
      <PageHeader
        eyebrow="The Invitation"
        title="Save Our Date"
        subtitle="We invite you to share in our joy, and help us begin our forever."
      />

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
          {/* INVITATION CARD CONTAINER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border p-8 shadow-elegant sm:p-12 ${style.cardBg}`}
          >
            {/* Elegant Corner Borders */}
            <div
              className={`absolute top-4 left-4 h-8 w-8 border-t border-l ${style.borderAccent}`}
            />
            <div
              className={`absolute top-4 right-4 h-8 w-8 border-t border-r ${style.borderAccent}`}
            />
            <div
              className={`absolute bottom-4 left-4 h-8 w-8 border-b border-l ${style.borderAccent}`}
            />
            <div
              className={`absolute bottom-4 right-4 h-8 w-8 border-b border-r ${style.borderAccent}`}
            />

            <div className="text-center">
              <span className={`text-[10px] tracking-[0.4em] uppercase ${style.textMuted}`}>
                The Wedding Celebration
              </span>
              <h2 className="font-script mt-6 text-6xl md:text-7xl">
                {brideName} &amp; {groomName}
              </h2>

              <div className={`mx-auto mt-6 h-px w-24 bg-current opacity-20`} />

              <p className={`font-display mt-8 text-xl md:text-2xl ${style.textPrimary}`}>
                {formattedDate}
              </p>
              <p className={`mt-2 text-sm tracking-wide ${style.textMuted}`}>{time}</p>
            </div>

            <div className="mt-12 space-y-6 text-center">
              <p className="text-sm font-medium italic leading-relaxed max-w-md mx-auto">
                "{description}"
              </p>

              <div className={`mx-auto h-px w-24 bg-current opacity-20`} />

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className={style.textPrimary} />
                  <span className="text-sm font-semibold tracking-wide uppercase">{venueName}</span>
                </div>
                <p className={`text-xs max-w-xs ${style.textMuted}`}>{venueAddress}</p>
              </div>
            </div>

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href={rsvpUrl.startsWith("/") ? rsvpUrl : `https://${rsvpUrl}`}
                className={`flex items-center justify-center gap-2 rounded-full px-8 py-3 text-xs font-semibold tracking-[0.25em] uppercase transition-all hover:scale-[1.04] shadow-soft ${style.buttonSolid}`}
              >
                RSVP Online
              </a>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="glass border-primary/25 text-foreground hover:bg-primary/10 flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-xs font-semibold tracking-[0.25em] uppercase transition-all hover:scale-[1.04]"
              >
                <MapPin size={14} /> Google Maps <ExternalLink size={12} />
              </a>
            </div>
          </motion.div>

          {/* CALENDAR & COUNTDOWN COLUMN */}
          <div className="space-y-8">
            {/* LIVE COUNTDOWN */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card shadow-soft hover:shadow-elegant rounded-3xl border border-primary/15 p-6 text-center transition-shadow"
            >
              <h3 className="font-display text-xl">The Countdown</h3>

              {timeLeft.isOver ? (
                <p className="font-script text-gradient-luxe mt-4 text-4xl">
                  The Celebration Began!
                </p>
              ) : (
                <div className="mt-6 grid grid-cols-4 gap-2">
                  {[
                    { val: timeLeft.days, label: "Days" },
                    { val: timeLeft.hours, label: "Hours" },
                    { val: timeLeft.minutes, label: "Mins" },
                    { val: timeLeft.seconds, label: "Secs" },
                  ].map((unit, i) => (
                    <div key={unit.label} className="flex flex-col items-center">
                      <div className="glass border-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl border text-xl font-bold tracking-wider md:h-16 md:w-16">
                        {String(unit.val).padStart(2, "0")}
                      </div>
                      <span className="text-muted-foreground mt-2 text-[10px] tracking-wider uppercase">
                        {unit.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* INTERACTIVE CALENDAR HIGHLIGHT */}
            {calendarData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-card shadow-soft hover:shadow-elegant rounded-3xl border border-primary/15 p-6 transition-shadow"
              >
                <div className="mb-4 flex items-center justify-between border-b border-primary/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-primary" />
                    <span className="font-display text-lg font-medium">
                      {calendarData.monthName} {calendarData.year}
                    </span>
                  </div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-primary font-semibold">
                    Wedding Month
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-y-2 text-center text-xs">
                  {/* Days of Week headers */}
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <span key={i} className="text-muted-foreground/60 font-semibold py-1">
                      {d}
                    </span>
                  ))}

                  {/* Calendar Numbers */}
                  {calendarDays.map((day, i) => {
                    const isWeddingDay = day === calendarData.dayNumber;
                    return (
                      <div
                        key={i}
                        className="relative flex aspect-square items-center justify-center p-1 text-center"
                      >
                        {day !== null ? (
                          isWeddingDay ? (
                            <div className="relative flex items-center justify-center">
                              {/* pulsing animation behind */}
                              <span
                                className={`absolute inline-flex h-8 w-8 animate-ping rounded-full opacity-30 ${style.pulseColor}`}
                              />
                              <div
                                className={`relative flex h-8 w-8 items-center justify-center rounded-full z-10 text-white font-bold`}
                              >
                                <Heart size={28} className={style.calendarHeart} />
                                <span className="absolute text-[10px] text-white select-none pt-0.5">
                                  {day}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-foreground/80 hover:bg-primary/5 grid h-7 w-7 place-items-center rounded-full transition-colors">
                              {day}
                            </span>
                          )
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ADD TO CALENDAR ACTIONS */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="relative"
            >
              <button
                onClick={() => setCalendarMenuOpen(!calendarMenuOpen)}
                className="gradient-luxe shadow-elegant hover:scale-[1.02] flex w-full items-center justify-between rounded-full px-6 py-4 text-xs font-semibold tracking-[0.25em] text-white uppercase transition-all"
              >
                <span className="flex items-center gap-2">
                  <CalendarHeart size={16} /> Add to Calendar
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${calendarMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {calendarMenuOpen && (
                  <>
                    {/* click backdrop to close */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setCalendarMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="glass shadow-elegant border-primary/20 absolute right-0 left-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border p-2"
                    >
                      <a
                        href={googleCalendarUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setCalendarMenuOpen(false)}
                        className="hover:bg-primary/10 flex items-center justify-between rounded-xl px-4 py-3 text-xs tracking-wider uppercase text-foreground/85 transition-colors"
                      >
                        Google Calendar <ExternalLink size={12} className="opacity-60" />
                      </a>
                      <button
                        onClick={handleDownloadICS}
                        className="hover:bg-primary/10 flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs tracking-wider uppercase text-foreground/85 transition-colors"
                      >
                        iCal / Apple Calendar <Download size={12} className="opacity-60" />
                      </button>
                      <a
                        href={outlookCalendarUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setCalendarMenuOpen(false)}
                        className="hover:bg-primary/10 flex items-center justify-between rounded-xl px-4 py-3 text-xs tracking-wider uppercase text-foreground/85 transition-colors"
                      >
                        Outlook Web <ExternalLink size={12} className="opacity-60" />
                      </a>
                      <a
                        href={yahooCalendarUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setCalendarMenuOpen(false)}
                        className="hover:bg-primary/10 flex items-center justify-between rounded-xl px-4 py-3 text-xs tracking-wider uppercase text-foreground/85 transition-colors"
                      >
                        Yahoo Calendar <ExternalLink size={12} className="opacity-60" />
                      </a>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FILMS SECTION */}
      {videosQuery.isLoading && (
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm border-t border-primary/10 pt-16">
          <Loader2 className="animate-spin" size={16} /> Loading invitation films…
        </div>
      )}

      {videosQuery.data && videosQuery.data.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 border-t border-primary/10 pt-16">
          <div className="mb-10 text-center">
            <h3 className="font-display text-3xl sm:text-4xl">Invitation Film</h3>
            <p className="text-muted-foreground mt-2 text-sm font-light italic">
              A cinematic look at our love story.
            </p>
            <div className="bg-primary/50 mx-auto mt-4 h-px w-12" />
          </div>
          <VideoGrid items={videosQuery.data} />
        </section>
      )}

      {/* GALLERY SECTION */}
      {photosQuery.isLoading && (
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm border-t border-primary/10 pt-16">
          <Loader2 className="animate-spin" size={16} /> Loading invitation gallery…
        </div>
      )}

      {photosQuery.data && photosQuery.data.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 border-t border-primary/10 pt-16">
          <div className="mb-10 text-center">
            <h3 className="font-display text-3xl sm:text-4xl">Engagement Moments</h3>
            <p className="text-muted-foreground mt-2 text-sm font-light italic">
              A glimpse into our beautiful journey together.
            </p>
            <div className="bg-primary/50 mx-auto mt-4 h-px w-12" />
          </div>
          <MasonryGallery items={photosQuery.data} />
        </section>
      )}
    </>
  );
}
