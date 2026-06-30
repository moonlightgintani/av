import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { MediaSection } from "@/components/MediaSection";
import { useSettings } from "@/lib/store";
import { useState } from "react";

export const Route = createFileRoute("/kalupidithal")({
  head: () => ({
    meta: [
      { title: "Kalupidithal — Our Wedding Story" },
      {
        name: "description",
        content:
          "Kalupidithal — pre-wedding rituals of blessings, nalangu, and ancestral traditions.",
      },
      { property: "og:title", content: "Kalupidithal — Our Wedding Story" },
    ],
  }),
  component: Page,
});

const chapters = ["Nalangu", "Blessings", "Family Rituals"];

function Page() {
  const { folders } = useSettings();
  const [activeTab, setActiveTab] = useState<"bride" | "groom">("bride");

  return (
    <>
      <PageHeader
        eyebrow="The Rituals"
        title="Kalupidithal"
        subtitle="The sacred pre-wedding ceremony of nalangu, blessings, and traditional purification."
      />
      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
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

        {/* BRIDE / GROOM SELECTOR */}
        <div className="glass border-primary/10 relative mx-auto mb-12 flex max-w-[280px] rounded-full border p-1 shadow-soft">
          <button
            onClick={() => setActiveTab("bride")}
            className={`relative flex-1 rounded-full py-2.5 text-center text-xs font-medium tracking-[0.15em] uppercase transition-all duration-300 z-10 ${
              activeTab === "bride"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Bride's Side
          </button>
          <button
            onClick={() => setActiveTab("groom")}
            className={`relative flex-1 rounded-full py-2.5 text-center text-xs font-medium tracking-[0.15em] uppercase transition-all duration-300 z-10 ${
              activeTab === "groom"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Groom's Side
          </button>
        </div>

        <MediaSection
          key={activeTab} // Force query refresh on toggle
          photoFolder={
            activeTab === "bride"
              ? folders.kalupidithalPhotosBride
                ? [folders.kalupidithalPhotosBride]
                : folders.kalupidithalPhotos
                  ? [folders.kalupidithalPhotos]
                  : [folders.brideAlbum].filter(Boolean)
              : folders.kalupidithalPhotosGroom
                ? [folders.kalupidithalPhotosGroom]
                : folders.kalupidithalPhotos
                  ? [folders.kalupidithalPhotos]
                  : [folders.groomAlbum].filter(Boolean)
          }
        />
      </section>
    </>
  );
}
