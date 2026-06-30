import { Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { DriveFile } from "@/lib/drive";
import { formatDuration } from "@/lib/drive";
import { useSettings } from "@/lib/store";

export function VideoGrid({ items }: { items: DriveFile[] }) {
  const [active, setActive] = useState<DriveFile | null>(null);
  const driveApiKey = useSettings((s) => s.driveApiKey);
  const setSettings = useSettings((s) => s.set);
  const videos = items.filter((i) => i.isVideo);

  if (!videos.length) return null;

  // Build the direct Google Drive media stream link if we have an API key and it's a Drive file
  const getStreamUrl = (v: DriveFile) => {
    if (v.src && !v.src.includes("drive.google.com") && !v.src.includes("googleapis.com")) {
      return v.src; // Local or custom direct stream url
    }
    if (driveApiKey && v.id) {
      return `https://www.googleapis.com/drive/v3/files/${v.id}?alt=media&key=${driveApiKey}`;
    }
    return v.src || v.preview;
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <motion.button
            key={v.id}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            onClick={() => {
              setActive(v);
              setSettings({ musicPlaying: false });
            }}
            className="group bg-card shadow-soft hover:shadow-elegant relative overflow-hidden rounded-2xl border border-primary/15 text-left transition-shadow"
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src={v.thumbnail}
                alt={v.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="gradient-luxe grid h-16 w-16 place-items-center rounded-full text-white shadow-elegant transition-transform group-hover:scale-110">
                  <Play size={22} className="ml-1 fill-white" />
                </div>
              </div>
              {v.durationMs && (
                <span className="glass absolute right-2 bottom-2 rounded-full px-2.5 py-1 text-[11px] tracking-wider text-white">
                  {formatDuration(v.durationMs)}
                </span>
              )}
            </div>
            <div className="p-4">
              <p className="font-display truncate text-lg">{v.name.replace(/\.[^.]+$/, "")}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-80 grid place-items-center bg-black/90 p-4"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="aspect-video w-full max-w-5xl overflow-hidden rounded-2xl bg-black shadow-elegant"
            >
              {/* Force native player for highest source quality (4K) streaming */}
              <video
                src={getStreamUrl(active)}
                className="h-full w-full object-contain"
                controls
                autoPlay
                playsInline
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
