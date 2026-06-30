import { useQuery } from "@tanstack/react-query";
import { listFolder } from "@/lib/drive";
import { useSettings } from "@/lib/store";
import { getLocalMedia } from "@/lib/localMedia";
import { MasonryGallery } from "./MasonryGallery";
import { VideoGrid } from "./VideoGrid";
import { Loader2, FolderOpen } from "lucide-react";

export function MediaSection({
  photoFolder,
  videoFolder,
  emptyHint,
}: {
  photoFolder?: string | string[];
  videoFolder?: string | string[];
  emptyHint?: string;
}) {
  const { driveApiKey, bumpCacheKey, mediaSource } = useSettings();

  const photos = useQuery({
    queryKey: ["photos", photoFolder, mediaSource, driveApiKey, bumpCacheKey],
    queryFn: async () => {
      const folders = Array.isArray(photoFolder) ? photoFolder : [photoFolder || "engagement"];
      if (mediaSource === "local") {
        return getLocalMedia().filter((i) => !i.isVideo && folders.includes(i.folder));
      }
      const results = await Promise.all(
        folders.map((f) => listFolder(f, driveApiKey).catch(() => [])),
      );
      const flat = results.flat();
      const seen = new Set<string>();
      return flat.filter((i) => {
        if (seen.has(i.id)) return false;
        seen.add(i.id);
        return !i.isVideo;
      });
    },
    enabled: !!photoFolder && (mediaSource === "local" || !!driveApiKey),
    staleTime: 5 * 60_000,
  });

  const videos = useQuery({
    queryKey: ["videos", videoFolder, mediaSource, driveApiKey, bumpCacheKey],
    queryFn: async () => {
      const folders = Array.isArray(videoFolder) ? videoFolder : [videoFolder || "engagement"];
      if (mediaSource === "local") {
        return getLocalMedia().filter((i) => i.isVideo && folders.includes(i.folder));
      }
      const results = await Promise.all(
        folders.map((f) => listFolder(f, driveApiKey).catch(() => [])),
      );
      const flat = results.flat();
      const seen = new Set<string>();
      return flat.filter((i) => {
        if (seen.has(i.id)) return false;
        seen.add(i.id);
        return i.isVideo;
      });
    },
    enabled: !!videoFolder && (mediaSource === "local" || !!driveApiKey),
    staleTime: 5 * 60_000,
  });

  const loading = photos.isLoading || videos.isLoading;
  const noConfig = mediaSource === "drive" && (!driveApiKey || (!photoFolder && !videoFolder));

  return (
    <div className="space-y-16">
      {noConfig && (
        <div className="glass mx-auto max-w-2xl rounded-2xl border border-primary/20 p-8 text-center">
          <FolderOpen className="mx-auto text-primary" size={24} />
          <p className="font-display mt-3 text-2xl">Connect this album</p>
          <p className="text-muted-foreground mt-2 text-sm">
            {emptyHint ??
              "Add your Google Drive API key and folder IDs in the Admin panel to display photos and videos here."}
          </p>
          <a
            href="/admin"
            className="text-primary mt-4 inline-block text-xs tracking-[0.3em] uppercase hover:underline"
          >
            Open admin →
          </a>
        </div>
      )}
      {loading && (
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
          <Loader2 className="animate-spin" size={16} /> Loading memories…
        </div>
      )}
      {photos.data && photos.data.length > 0 && (
        <section>
          <SectionTitle>Photographs</SectionTitle>
          <MasonryGallery items={photos.data} />
        </section>
      )}
      {videos.data && videos.data.length > 0 && (
        <section>
          <SectionTitle>Films</SectionTitle>
          <VideoGrid items={videos.data} />
        </section>
      )}
      {(photos.error || videos.error) && (
        <p className="text-destructive text-center text-sm">
          Could not load Drive folder. Make sure it's shared with "Anyone with the link".
        </p>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 text-center">
      <h2 className="font-display text-3xl sm:text-4xl">{children}</h2>
      <div className="bg-primary/50 mx-auto mt-3 h-px w-12" />
    </div>
  );
}
