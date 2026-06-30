import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { VideoGrid } from "@/components/VideoGrid";
import { useSettings } from "@/lib/store";
import { listFolder } from "@/lib/drive";
import { getLocalMedia } from "@/lib/localMedia";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "Films — Our Wedding Story" },
      { name: "description", content: "Cinematic films from our engagement and wedding day." },
      { property: "og:title", content: "Films — Our Wedding Story" },
    ],
  }),
  component: Page,
});

function Page() {
  const { folders, driveApiKey, bumpCacheKey, mediaSource } = useSettings();

  const eng = useQuery({
    queryKey: ["videos-eng", folders.engagementVideos, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.engagementVideos, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.engagementVideos,
    staleTime: 5 * 60_000,
  });

  const wedMain = useQuery({
    queryKey: ["videos-wed-main", folders.weddingVideos, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.weddingVideos, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.weddingVideos,
    staleTime: 5 * 60_000,
  });

  const wedBride = useQuery({
    queryKey: ["videos-wed-bride", folders.weddingVideosBride, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.weddingVideosBride, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.weddingVideosBride,
    staleTime: 5 * 60_000,
  });

  const wedGroom = useQuery({
    queryKey: ["videos-wed-groom", folders.weddingVideosGroom, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.weddingVideosGroom, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.weddingVideosGroom,
    staleTime: 5 * 60_000,
  });

  const recMain = useQuery({
    queryKey: ["videos-rec-main", folders.receptionVideos, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.receptionVideos, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.receptionVideos,
    staleTime: 5 * 60_000,
  });

  const recBride = useQuery({
    queryKey: ["videos-rec-bride", folders.receptionVideosBride, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.receptionVideosBride, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.receptionVideosBride,
    staleTime: 5 * 60_000,
  });

  const recGroom = useQuery({
    queryKey: ["videos-rec-groom", folders.receptionVideosGroom, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.receptionVideosGroom, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.receptionVideosGroom,
    staleTime: 5 * 60_000,
  });

  const cine = useQuery({
    queryKey: ["videos-cine", folders.cinematicVideos, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.cinematicVideos, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.cinematicVideos,
    staleTime: 5 * 60_000,
  });

  const all = useMemo(() => {
    if (mediaSource === "local") {
      return getLocalMedia().filter((v) => v.isVideo);
    }
    const combined = [
      ...(eng.data ?? []),
      ...(wedMain.data ?? []),
      ...(wedBride.data ?? []),
      ...(wedGroom.data ?? []),
      ...(recMain.data ?? []),
      ...(recBride.data ?? []),
      ...(recGroom.data ?? []),
      ...(cine.data ?? []),
    ];
    // De-duplicate items by ID
    const seen = new Set<string>();
    return combined.filter((v) => {
      if (seen.has(v.id)) return false;
      seen.add(v.id);
      return v.isVideo;
    });
  }, [
    eng.data,
    wedMain.data,
    wedBride.data,
    wedGroom.data,
    recMain.data,
    recBride.data,
    recGroom.data,
    cine.data,
    mediaSource,
    bumpCacheKey,
  ]);

  const loading =
    mediaSource === "drive" &&
    (eng.isLoading ||
      wedMain.isLoading ||
      wedBride.isLoading ||
      wedGroom.isLoading ||
      recMain.isLoading ||
      recBride.isLoading ||
      recGroom.isLoading ||
      cine.isLoading);

  return (
    <>
      <PageHeader
        eyebrow="The Films"
        title="Cinematic Memories"
        subtitle="Press play. Live the moments with us — frame by gentle frame."
      />
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        {loading && (
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
            <Loader2 className="animate-spin" size={16} /> Loading films…
          </div>
        )}
        {!loading && all.length === 0 && (
          <p className="text-muted-foreground py-20 text-center text-sm">
            {mediaSource === "local"
              ? "No films found in local public/images/ folders yet."
              : "No films yet — configure Drive folders in Admin."}
          </p>
        )}
        {all.length > 0 && <VideoGrid items={all} />}
      </section>
    </>
  );
}
