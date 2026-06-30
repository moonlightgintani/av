import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { useSettings } from "@/lib/store";
import { listFolder } from "@/lib/drive";
import { getLocalMedia } from "@/lib/localMedia";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/memories")({
  head: () => ({
    meta: [
      { title: "Memory Wall — Our Wedding Story" },
      {
        name: "description",
        content: "The moments we hold dearest — featured memories from our story.",
      },
      { property: "og:title", content: "Memory Wall — Our Wedding Story" },
    ],
  }),
  component: Page,
});

const captions = [
  "The first look",
  "Stolen glances",
  "Sealed with a smile",
  "Hands, held forever",
  "Laughter that stayed",
  "A quiet vow",
  "The garland exchange",
  "Family, gathered",
  "Under the lights",
];

function Page() {
  const { folders, driveApiKey, bumpCacheKey, featured, weddingDate, mediaSource } = useSettings();

  const eng = useQuery({
    queryKey: ["mem-eng", folders.engagementPhotos, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.engagementPhotos, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.engagementPhotos,
  });

  const wed = useQuery({
    queryKey: ["mem-wed", folders.weddingPhotos, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.weddingPhotos, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.weddingPhotos,
  });

  const all = useMemo(() => {
    if (mediaSource === "local") {
      return getLocalMedia().filter((i) => !i.isVideo);
    }
    return [...(eng.data ?? []), ...(wed.data ?? [])].filter((i) => !i.isVideo);
  }, [eng.data, wed.data, mediaSource, bumpCacheKey]);

  const items = useMemo(() => {
    return featured.length > 0 ? all.filter((i) => featured.includes(i.id)) : all.slice(0, 9);
  }, [all, featured]);

  const loading = mediaSource === "drive" && (eng.isLoading || wed.isLoading);
  const dateStr = new Date(weddingDate).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <PageHeader
        eyebrow="Forever Kept"
        title="Memory Wall"
        subtitle="A handful of frames we'll return to again and again."
      />
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        {loading && (
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
            <Loader2 className="animate-spin" size={16} /> Loading memories…
          </div>
        )}
        {!loading && items.length === 0 && (
          <p className="text-muted-foreground py-20 text-center text-sm">
            Mark photos as featured in{" "}
            <a className="text-primary underline" href="/admin">
              Admin
            </a>{" "}
            to populate this wall.
          </p>
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m, i) => (
            <motion.figure
              key={m.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 6) * 0.05 }}
              whileHover={{ y: -6 }}
              className="group bg-card shadow-soft hover:shadow-elegant overflow-hidden rounded-3xl border border-primary/15 transition-shadow"
            >
              <div className="relative aspect-4/5 overflow-hidden">
                <img
                  src={m.thumbnail}
                  alt={m.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-1200 group-hover:scale-110"
                />
              </div>
              <figcaption className="p-5">
                <p className="font-display text-2xl">{captions[i % captions.length]}</p>
                <p className="text-muted-foreground mt-1 text-xs tracking-[0.3em] uppercase">
                  {dateStr}
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>
    </>
  );
}
