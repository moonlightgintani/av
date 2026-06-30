import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { MediaSection } from "@/components/MediaSection";
import { useSettings } from "@/lib/store";
import { motion } from "framer-motion";

export const Route = createFileRoute("/reception")({
  head: () => ({
    meta: [
      { title: "Reception — Our Wedding Story" },
      {
        name: "description",
        content:
          "The wedding reception celebration — dancing, music, greetings, and happy moments.",
      },
      { property: "og:title", content: "Reception — Our Wedding Story" },
    ],
  }),
  component: Page,
});

const chapters = [
  "Grand Entrance",
  "Cake Cutting",
  "First Dance",
  "Toast & Speech",
  "Music & Dance",
  "Family Greetings",
];

function Page() {
  const { folders } = useSettings();

  return (
    <>
      <PageHeader
        eyebrow="Milestone Three"
        title="Reception"
        subtitle="A night of music, laughter, and celebratory toasts under a canopy of starlight."
      />
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.7 }}
        className="mx-auto max-w-7xl px-5 pb-12 sm:px-8"
      >
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {chapters.map((c) => (
            <span
              key={c}
              className="glass border-primary/20 text-foreground/80 rounded-full border px-4 py-1.5 text-xs tracking-[0.18em] uppercase"
            >
              {c}
            </span>
          ))}
        </div>

        <MediaSection
          photoFolder={
            folders.receptionPhotosGroom
              ? [folders.receptionPhotosGroom]
              : folders.receptionPhotos
                ? [folders.receptionPhotos]
                : [folders.groomAlbum].filter(Boolean)
          }
          videoFolder={[folders.groomAlbum].filter(Boolean)}
        />
      </motion.section>
    </>
  );
}
