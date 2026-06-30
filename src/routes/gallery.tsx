import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { MasonryGallery } from "@/components/MasonryGallery";
import { useSettings } from "@/lib/store";
import { listFolder, type DriveFile } from "@/lib/drive";
import { getLocalMedia } from "@/lib/localMedia";
import { useMemo, useState, useEffect } from "react";
import { Search, Loader2, Download } from "lucide-react";
import JSZip from "jszip";

export const Route = createFileRoute("/gallery")({
  validateSearch: (search: Record<string, unknown>) => ({
    filter: (search.filter as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Gallery — Our Wedding Story" },
      {
        name: "description",
        content: "Every photograph, in one place. Filter, search, and view in fullscreen.",
      },
      { property: "og:title", content: "Gallery — Our Wedding Story" },
    ],
  }),
  component: Page,
});

function Page() {
  const { folders, driveApiKey, bumpCacheKey, mediaSource } = useSettings();
  const search = Route.useSearch();
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [zipProgress, setZipProgress] = useState("");

  const filters = useMemo<string[]>(() => {
    if (mediaSource === "local") {
      const foldersList = getLocalMedia()
        .filter((i) => !i.isVideo)
        .map((i) => i.folder);
      const uniqueFolders = Array.from(new Set(foldersList));
      return ["all", ...uniqueFolders];
    }
    return ["all", "engagement", "kalupidithal", "wedding", "reception"];
  }, [mediaSource, bumpCacheKey]);

  useEffect(() => {
    if (search.filter && filters.includes(search.filter)) {
      setFilter(search.filter);
    }
  }, [search.filter, filters]);

  useEffect(() => {
    if (!filters.includes(filter)) {
      setFilter("all");
    }
  }, [filters, filter]);

  // --- QUERIES ---
  const eng = useQuery({
    queryKey: ["gallery-eng", folders.engagementPhotos, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.engagementPhotos, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.engagementPhotos,
    staleTime: 5 * 60_000,
  });

  const wedMain = useQuery({
    queryKey: ["gallery-wed-main", folders.weddingPhotos, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.weddingPhotos, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.weddingPhotos,
    staleTime: 5 * 60_000,
  });

  const wedBride = useQuery({
    queryKey: ["gallery-wed-bride", folders.weddingPhotosBride, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.weddingPhotosBride, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.weddingPhotosBride,
    staleTime: 5 * 60_000,
  });

  const wedGroom = useQuery({
    queryKey: ["gallery-wed-groom", folders.weddingPhotosGroom, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.weddingPhotosGroom, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.weddingPhotosGroom,
    staleTime: 5 * 60_000,
  });

  const recMain = useQuery({
    queryKey: ["gallery-rec-main", folders.receptionPhotos, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.receptionPhotos, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.receptionPhotos,
    staleTime: 5 * 60_000,
  });

  const recBride = useQuery({
    queryKey: ["gallery-rec-bride", folders.receptionPhotosBride, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.receptionPhotosBride, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.receptionPhotosBride,
    staleTime: 5 * 60_000,
  });

  const recGroom = useQuery({
    queryKey: ["gallery-rec-groom", folders.receptionPhotosGroom, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.receptionPhotosGroom, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.receptionPhotosGroom,
    staleTime: 5 * 60_000,
  });

  const kalMain = useQuery({
    queryKey: ["gallery-kal-main", folders.kalupidithalPhotos, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.kalupidithalPhotos, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.kalupidithalPhotos,
    staleTime: 5 * 60_000,
  });

  const kalBride = useQuery({
    queryKey: ["gallery-kal-bride", folders.kalupidithalPhotosBride, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.kalupidithalPhotosBride, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.kalupidithalPhotosBride,
    staleTime: 5 * 60_000,
  });

  const kalGroom = useQuery({
    queryKey: ["gallery-kal-groom", folders.kalupidithalPhotosGroom, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.kalupidithalPhotosGroom, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.kalupidithalPhotosGroom,
    staleTime: 5 * 60_000,
  });

  const brideAlb = useQuery({
    queryKey: ["gallery-bride-alb", folders.brideAlbum, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.brideAlbum, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.brideAlbum,
    staleTime: 5 * 60_000,
  });

  const groomAlb = useQuery({
    queryKey: ["gallery-groom-alb", folders.groomAlbum, driveApiKey, bumpCacheKey],
    queryFn: () => listFolder(folders.groomAlbum, driveApiKey),
    enabled: mediaSource === "drive" && !!driveApiKey && !!folders.groomAlbum,
    staleTime: 5 * 60_000,
  });

  // --- ITEMS PROCESSING ---
  const items = useMemo<DriveFile[]>(() => {
    let baseItems: DriveFile[] = [];
    if (mediaSource === "local") {
      const localPics = getLocalMedia().filter((i) => !i.isVideo);
      baseItems = filter === "all" ? localPics : localPics.filter((i) => i.folder === filter);
    } else {
      const engPics = eng.data ?? [];
      const bridePics = brideAlb.data ?? [];
      const groomPics = groomAlb.data ?? [];
      const wedPics = [
        ...(wedMain.data ?? []),
        ...(wedBride.data ?? []),
        ...(wedGroom.data ?? []),
        ...bridePics,
        ...groomPics,
      ];
      const recPics = [
        ...(recMain.data ?? []),
        ...(recBride.data ?? []),
        ...(recGroom.data ?? []),
        ...bridePics,
        ...groomPics,
      ];
      const kalPics = [
        ...(kalMain.data ?? []),
        ...(kalBride.data ?? []),
        ...(kalGroom.data ?? []),
        ...bridePics,
        ...groomPics,
      ];

      if (filter === "engagement") {
        baseItems = engPics;
      } else if (filter === "wedding") {
        baseItems = wedPics;
      } else if (filter === "reception") {
        baseItems = recPics;
      } else if (filter === "kalupidithal") {
        baseItems = kalPics;
      } else {
        baseItems = [...engPics, ...kalPics, ...wedPics, ...recPics, ...bridePics, ...groomPics];
      }

      // De-duplicate items by ID
      const seen = new Set<string>();
      baseItems = baseItems.filter((i) => {
        if (seen.has(i.id)) return false;
        seen.add(i.id);
        return !i.isVideo;
      });
    }

    if (!q.trim()) return baseItems;
    const needle = q.toLowerCase();
    return baseItems.filter((i) => i.name.toLowerCase().includes(needle));
  }, [
    eng.data,
    wedMain.data,
    wedBride.data,
    wedGroom.data,
    recMain.data,
    recBride.data,
    recGroom.data,
    kalMain.data,
    kalBride.data,
    kalGroom.data,
    brideAlb.data,
    groomAlb.data,
    filter,
    q,
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
      kalMain.isLoading ||
      kalBride.isLoading ||
      kalGroom.isLoading ||
      brideAlb.isLoading ||
      groomAlb.isLoading);

  const handleDownloadAllZip = async () => {
    setDownloading(true);
    setZipProgress("Starting...");
    try {
      const zip = new JSZip();
      let count = 0;

      for (const item of items) {
        setZipProgress(`Fetching ${++count}/${items.length}...`);
        try {
          const res = await fetch(item.src);
          if (!res.ok) throw new Error("Fetch failed");
          const blob = await res.blob();

          let ext = ".jpg";
          if (item.mimeType === "image/png") ext = ".png";
          if (item.mimeType === "image/webp") ext = ".webp";
          if (item.mimeType === "image/gif") ext = ".gif";

          const name = item.name.replace(/[/\\?%*:|"<>]/g, "-");
          zip.file(`${name}-${item.id.substring(0, 6)}${ext}`, blob);
        } catch (e) {
          console.error("Failed to download image", item.src, e);
        }
      }

      setZipProgress("Generating ZIP...");
      const content = await zip.generateAsync({ type: "blob" });

      setZipProgress("Saving file...");
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `wedding-gallery.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate zip", err);
    } finally {
      setDownloading(false);
      setZipProgress("");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="The Album"
        title="Gallery"
        subtitle="A wandering, scrollable collection of our favourite frames."
      />
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="mb-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-4 py-1.5 text-xs tracking-[0.2em] uppercase transition-colors ${
                  filter === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary/20 text-foreground/70 hover:border-primary/60"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            {items.length > 0 && (
              <button
                onClick={handleDownloadAllZip}
                disabled={downloading}
                className="border-primary/30 text-primary hover:bg-primary/5 inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2 text-xs font-semibold tracking-wider uppercase transition-colors disabled:opacity-60"
              >
                {downloading ? (
                  <>
                    <Loader2 className="animate-spin" size={12} />
                    <span>{zipProgress}</span>
                  </>
                ) : (
                  <>
                    <Download size={12} />
                    <span>Download ZIP ({items.length})</span>
                  </>
                )}
              </button>
            )}
            <div className="relative w-full sm:w-64">
              <Search
                size={14}
                className="text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search photos"
                className="bg-background/70 border-border focus:border-primary w-full rounded-full border py-2 pr-4 pl-10 text-sm outline-none"
              />
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
            <Loader2 className="animate-spin" size={16} /> Loading photographs…
          </div>
        )}

        {!loading && items.length === 0 && (
          <p className="text-muted-foreground py-20 text-center text-sm">
            {mediaSource === "local"
              ? "No photos found in local public/images/ folders yet."
              : "No photos yet — configure Drive folders in Admin."}
          </p>
        )}

        {items.length > 0 && <MasonryGallery items={items} />}
      </section>
    </>
  );
}
