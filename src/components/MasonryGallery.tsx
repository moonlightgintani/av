import { useMemo, useState } from "react";
import { MasonryPhotoAlbum } from "react-photo-album";
import "react-photo-album/masonry.css";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Download from "yet-another-react-lightbox/plugins/download";
import Share from "yet-another-react-lightbox/plugins/share";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import {
  Heart,
  Download as DownloadIcon,
  Check,
  CheckSquare,
  Square,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import type { DriveFile } from "@/lib/drive";
import { useSettings } from "@/lib/store";
import { downloadPhotosAsZip, type DownloadProgress } from "@/lib/downloadZip";
import { motion, AnimatePresence } from "framer-motion";

export function MasonryGallery({
  items,
  title = "wedding-album",
}: {
  items: DriveFile[];
  title?: string;
}) {
  const [index, setIndex] = useState(-1);
  const { favorites, toggleFavorite, hidden } = useSettings();
  const [resolvedDimensions, setResolvedDimensions] = useState<
    Record<string, { width: number; height: number }>
  >({});

  // Multi-selection state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);

  const photos = useMemo(
    () =>
      items
        .filter((i) => !i.isVideo && !hidden.includes(i.id))
        .map((i) => {
          const resolved = resolvedDimensions[i.id];
          return {
            src: i.thumbnail,
            width: resolved?.width ?? i.width ?? 1600,
            height: resolved?.height ?? i.height ?? 1067,
            alt: i.name,
            key: i.id,
            driveId: i.id,
            full: i.src,
            original: i,
          };
        }),
    [items, hidden, resolvedDimensions]
  );

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const all = new Set(photos.map((p) => p.driveId));
    setSelectedIds(all);
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleDownloadAll = async () => {
    if (photos.length === 0) return;
    setIsDownloading(true);
    try {
      const itemsToDownload = photos.map((p) => p.original);
      await downloadPhotosAsZip(itemsToDownload, `${title}-all-photos.zip`, setDownloadProgress);
    } catch (err) {
      console.error("Failed to download all photos", err);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  };

  const handleDownloadSelected = async () => {
    const selectedPhotos = photos
      .filter((p) => selectedIds.has(p.driveId))
      .map((p) => p.original);
    if (selectedPhotos.length === 0) return;

    setIsDownloading(true);
    try {
      await downloadPhotosAsZip(
        selectedPhotos,
        `${title}-selected-${selectedPhotos.length}-photos.zip`,
        setDownloadProgress
      );
      // Auto-exit selection mode after successful download
      setIsSelectMode(false);
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Failed to download selected photos", err);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  };

  return (
    <div className="relative">
      {/* Top Action Header for the Gallery */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-primary/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-[0.2em] text-foreground/70 uppercase">
            {photos.length} Photographs
          </span>
          {isSelectMode && (
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              {selectedIds.size} selected
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isSelectMode ? (
            <>
              <button
                onClick={() => {
                  setIsSelectMode(true);
                  setSelectedIds(new Set());
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-background/60 px-4 py-1.5 text-xs font-semibold tracking-wider text-foreground/80 transition-all hover:border-primary hover:text-primary active:scale-95 cursor-pointer shadow-sm"
              >
                <CheckSquare size={13} />
                <span>Select Photos</span>
              </button>

              <button
                onClick={handleDownloadAll}
                disabled={isDownloading || photos.length === 0}
                className="gradient-luxe inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-soft"
              >
                {isDownloading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <DownloadIcon size={13} />
                    <span>Download All ({photos.length})</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={selectedIds.size === photos.length ? handleDeselectAll : handleSelectAll}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-background/70 px-3.5 py-1.5 text-xs font-medium text-foreground/80 hover:text-primary transition-colors cursor-pointer"
              >
                {selectedIds.size === photos.length ? "Deselect All" : "Select All"}
              </button>

              <button
                onClick={handleDownloadSelected}
                disabled={isDownloading || selectedIds.size === 0}
                className="gradient-luxe inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-soft"
              >
                {isDownloading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <DownloadIcon size={13} />
                    <span>Download Selected ({selectedIds.size})</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsSelectMode(false);
                  setSelectedIds(new Set());
                }}
                className="inline-flex items-center gap-1 rounded-full border border-border/80 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={12} />
                <span>Done</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Floating Download Progress Toast */}
      <AnimatePresence>
        {isDownloading && downloadProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 sm:bottom-8 left-1/2 z-50 -translate-x-1/2 w-11/12 max-w-md rounded-2xl border border-primary/30 bg-background/95 p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Loader2 size={15} className="animate-spin text-primary" />
                <span className="font-semibold text-foreground">{downloadProgress.status}</span>
              </div>
              <span className="font-mono text-primary font-bold">{downloadProgress.percent}%</span>
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-primary/15">
              <motion.div
                className="gradient-luxe h-full rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress.percent}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Album Grid */}
      <MasonryPhotoAlbum
        photos={photos}
        columns={(c) => (c < 640 ? 2 : c < 1024 ? 3 : 4)}
        spacing={12}
        onClick={({ index: clickedIndex }) => {
          if (isSelectMode) {
            handleToggleSelect(photos[clickedIndex].driveId);
          } else {
            setIndex(clickedIndex);
          }
        }}
        render={{
          image: (props, { photo }) => {
            const driveId = (photo as { driveId: string }).driveId;
            const isSelected = selectedIds.has(driveId);

            const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
              const { naturalWidth, naturalHeight } = e.currentTarget;
              if (naturalWidth && naturalHeight) {
                if (
                  resolvedDimensions[driveId] === undefined ||
                  resolvedDimensions[driveId].width !== naturalWidth ||
                  resolvedDimensions[driveId].height !== naturalHeight
                ) {
                  setResolvedDimensions((prev) => ({
                    ...prev,
                    [driveId]: { width: naturalWidth, height: naturalHeight },
                  }));
                }
              }
              if (props.onLoad) props.onLoad(e);
            };

            return (
              <div
                className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
                  isSelectMode ? "cursor-pointer select-none" : "cursor-pointer"
                } ${
                  isSelected
                    ? "ring-4 ring-primary ring-offset-2 ring-offset-background scale-[0.98]"
                    : "hover:shadow-lg"
                }`}
              >
                <img
                  {...props}
                  onLoad={handleLoad}
                  className={`${props.className ?? ""} object-cover transition-transform duration-500 group-hover:scale-105`}
                />

                {/* Selection Checkbox Overlay */}
                {isSelectMode && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSelect(driveId);
                    }}
                    className={`absolute top-2.5 left-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-lg transition-transform active:scale-90 ${
                      isSelected
                        ? "gradient-luxe text-white shadow-md scale-105"
                        : "bg-background/80 text-muted-foreground border border-foreground/20 hover:border-primary backdrop-blur-sm"
                    }`}
                  >
                    {isSelected ? <Check size={16} strokeWidth={2.5} /> : <Square size={15} />}
                  </div>
                )}
              </div>
            );
          },
          extras: (_, { photo, index: i }) => {
            const driveId = (photo as { driveId: string }).driveId;
            if (isSelectMode) return null;

            return (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(driveId);
                }}
                aria-label="Favorite"
                className="glass absolute top-2.5 right-2.5 z-10 grid h-8 w-8 place-items-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 shadow-sm"
                data-i={i}
              >
                <Heart
                  size={14}
                  className={
                    favorites.includes(driveId)
                      ? "fill-primary text-primary"
                      : "text-foreground/70"
                  }
                />
              </button>
            );
          },
        }}
      />

      {/* Lightbox for Fullscreen Viewing */}
      <Lightbox
        index={index}
        open={index >= 0}
        close={() => setIndex(-1)}
        slides={photos.map((p) => ({ src: p.full, width: p.width, height: p.height }))}
        plugins={[Zoom, Fullscreen, Slideshow, Counter, Thumbnails, Download, Share]}
        carousel={{ finite: false, preload: 3 }}
        animation={{ fade: 350, swipe: 400 }}
        controller={{ closeOnBackdropClick: true }}
      />
    </div>
  );
}
