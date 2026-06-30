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
import { Heart } from "lucide-react";
import type { DriveFile } from "@/lib/drive";
import { useSettings } from "@/lib/store";

export function MasonryGallery({ items }: { items: DriveFile[] }) {
  const [index, setIndex] = useState(-1);
  const { favorites, toggleFavorite, hidden } = useSettings();
  const [resolvedDimensions, setResolvedDimensions] = useState<
    Record<string, { width: number; height: number }>
  >({});

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
          };
        }),
    [items, hidden, resolvedDimensions],
  );

  return (
    <>
      <MasonryPhotoAlbum
        photos={photos}
        columns={(c) => (c < 640 ? 2 : c < 1024 ? 3 : 4)}
        spacing={10}
        onClick={({ index }) => setIndex(index)}
        render={{
          image: (props, { photo }) => {
            const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
              const { naturalWidth, naturalHeight } = e.currentTarget;
              if (naturalWidth && naturalHeight) {
                const driveId = (photo as { driveId: string }).driveId;
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
              if (props.onLoad) {
                props.onLoad(e);
              }
            };

            return (
              <img
                {...props}
                onLoad={handleLoad}
                className={`${props.className ?? ""} object-cover`}
              />
            );
          },
          extras: (_, { photo, index: i }) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite((photo as { driveId: string }).driveId);
              }}
              aria-label="Favorite"
              className="glass absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
              data-i={i}
            >
              <Heart
                size={14}
                className={
                  favorites.includes((photo as { driveId: string }).driveId)
                    ? "fill-primary text-primary"
                    : "text-foreground/70"
                }
              />
            </button>
          ),
        }}
      />
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
    </>
  );
}
