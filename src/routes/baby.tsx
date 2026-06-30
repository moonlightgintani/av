import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { Heart, Sparkles, Star } from "lucide-react";

export const Route = createFileRoute("/baby")({
  head: () => ({
    meta: [
      { title: "Little Miracle — Our Next Milestone" },
      {
        name: "description",
        content: "A tiny miracle is on the way. Join us in celebrating our next milestone.",
      },
      { property: "og:title", content: "Little Miracle — Our Next Milestone" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Our Next Milestone"
        title="A Little Miracle"
        subtitle="A tiny hand to hold, a new story to unfold."
      />
      <section className="relative mx-auto max-w-3xl px-6 pb-32 text-center overflow-hidden">
        {/* Animated background stars */}
        <div className="absolute inset-0 -z-10 pointer-events-none opacity-40">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.1, y: 100 }}
              animate={{
                opacity: [0.1, 0.8, 0.1],
                y: [-20, -120],
                x: [0, i % 2 === 0 ? 30 : -30],
              }}
              transition={{
                duration: 6 + i * 2,
                repeat: Infinity,
                ease: "linear",
                delay: i * 1.5,
              }}
              className="absolute text-primary"
              style={{
                left: `${15 + i * 15}%`,
                bottom: "10%",
              }}
            >
              {i % 2 === 0 ? (
                <Star size={16 + i * 2} className="fill-primary/20" />
              ) : (
                <Heart size={14 + i * 2} className="fill-primary/25" />
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="glass border border-primary/15 relative mx-auto max-w-xl rounded-[40px] px-8 py-16 shadow-elegant overflow-hidden"
        >
          {/* Top corner accents */}
          <div className="absolute top-6 left-6 h-8 w-8 border-t-2 border-l-2 border-primary/25 rounded-tl-2xl" />
          <div className="absolute top-6 right-6 h-8 w-8 border-t-2 border-r-2 border-primary/25 rounded-tr-2xl" />
          <div className="absolute bottom-6 left-6 h-8 w-8 border-b-2 border-l-2 border-primary/25 rounded-bl-2xl" />
          <div className="absolute bottom-6 right-6 h-8 w-8 border-b-2 border-r-2 border-primary/25 rounded-br-2xl" />

          {/* Central Pulsing Heart Icon */}
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-primary/5 blur-md"
            />
            <div className="glass border border-primary/20 flex h-16 w-16 items-center justify-center rounded-full text-primary shadow-soft">
              <Heart size={28} className="fill-primary/20 animate-pulse text-primary" />
            </div>
          </div>

          <h3 className="font-display mt-8 text-4xl sm:text-5xl tracking-wide text-foreground">
            Coming Soon
          </h3>

          <p className="text-muted-foreground mx-auto mt-6 max-w-md text-sm leading-relaxed sm:text-base">
            We are preparing a beautiful space to share the laughter, the tiny footsteps, and the
            countless blessings of this new life. Stay tuned for our little miracle's first updates!
          </p>

          <div className="mt-10 flex justify-center gap-3">
            <span className="glass border-primary/10 text-primary flex items-center gap-1.5 rounded-full border px-5 py-2 text-xs tracking-[0.25em] uppercase font-semibold">
              <Sparkles size={12} /> Baby Announcement <Sparkles size={12} />
            </span>
          </div>
        </motion.div>
      </section>
    </>
  );
}
