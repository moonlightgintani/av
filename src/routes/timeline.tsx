import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline — Our Wedding Story" },
      { name: "description", content: "A walk through every milestone of our love story." },
      { property: "og:title", content: "Timeline — Our Wedding Story" },
    ],
  }),
  component: Page,
});

const chapters = [
  {
    icon: "💍",
    title: "Engagement",
    date: "The Promise",
    desc: "Where it began — a quiet yes between two families.",
    to: "/engagement",
  },
  {
    icon: "🌸",
    title: "Kalupidithal",
    date: "The Rituals",
    desc: "Traditional nalangu and ancestral blessings before the main vows.",
    to: "/kalupidithal",
  },
  {
    icon: "❤️",
    title: "Wedding Ceremony",
    date: "The Vows",
    desc: "Beneath the mandap, beneath the stars.",
    to: "/wedding",
  },
  {
    icon: "🎉",
    title: "Reception",
    date: "The Celebration",
    desc: "Music, laughter, and celebratory toasts under the lights.",
    to: "/reception",
  },
  {
    icon: "📸",
    title: "Family Photos",
    date: "Together",
    desc: "Every smile that made the day complete.",
    to: "/gallery",
  },
  {
    icon: "👶",
    title: "Little Miracle",
    date: "Our Next Milestone",
    desc: "A tiny hand to hold, a new story to unfold.",
    to: "/baby",
  },
] as const;

function HexagonBadge({ icon, index }: { icon: string; index: number }) {
  const isVertical = index % 2 === 1;
  const clipPath = isVertical
    ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
    : "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";

  return (
    <div
      style={{ clipPath }}
      className="absolute left-1 sm:left-6 lg:left-1/2 lg:-translate-x-1/2 top-1.5 lg:top-2 h-10 w-10 sm:h-12 sm:w-12 bg-primary/45 flex items-center justify-center z-10 transition-transform duration-300 hover:scale-110 shadow-soft"
    >
      <div
        style={{ clipPath }}
        className="h-[calc(100%-2px)] w-[calc(100%-2px)] bg-card flex items-center justify-center"
      >
        <span className="text-lg sm:text-xl">{icon}</span>
      </div>
    </div>
  );
}

function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Our Journey"
        title="Timeline"
        subtitle="Every milestone of a love unfolding."
      />
      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        {/* Vertical Line on the left (mobile only) */}
        <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-linear-to-b from-primary/10 via-primary/40 to-primary/10 sm:left-12 lg:hidden" />

        {/* Horizontal Line at the top (desktop only) */}
        <div className="absolute top-[30px] left-16 right-16 h-0.5 bg-linear-to-r from-primary/10 via-primary/40 to-primary/10 hidden lg:block" />

        <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-6 lg:gap-5 lg:items-start">
          {chapters.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="relative pl-14 sm:pl-24 lg:pl-0 lg:pt-20 flex flex-col items-center"
            >
              {/* Timeline Indicator Badge directly on the line */}
              <HexagonBadge icon={c.icon} index={i} />

              {/* Milestone Card */}
              <div className="glass hover:bg-card/95 border border-primary/10 hover:border-primary/35 p-6 sm:p-8 lg:p-5 rounded-3xl lg:rounded-2xl transition-all duration-500 shadow-soft hover:shadow-elegant relative overflow-hidden group w-full text-left">
                {/* Decorative background glow */}
                <div className="absolute -right-12 -top-12 h-24 w-24 lg:h-16 lg:w-16 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors duration-500 pointer-events-none" />

                <span className="text-primary text-[10px] lg:text-[9px] tracking-[0.3em] lg:tracking-[0.2em] uppercase font-semibold">
                  {c.date}
                </span>

                <h3 className="font-display mt-2 text-2xl lg:text-lg text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                  {c.title}
                </h3>

                <p className="text-muted-foreground mt-3 text-sm lg:text-xs leading-relaxed lg:line-clamp-3">
                  {c.desc}
                </p>

                <Link
                  to={c.to}
                  search={c.to === "/gallery" ? { filter: undefined } : undefined}
                  className="text-primary mt-6 inline-flex items-center gap-1.5 text-xs lg:text-[11px] tracking-[0.3em] lg:tracking-[0.2em] uppercase group-hover:underline font-semibold"
                >
                  View photos{" "}
                  <ArrowRight
                    size={12}
                    className="transform group-hover:translate-x-1 transition-transform duration-300"
                  />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
