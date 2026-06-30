import { Music, Pause } from "lucide-react";
import { useEffect, useRef } from "react";
import { useSettings } from "@/lib/store";

export function MusicToggle() {
  const url = useSettings((s) => s.musicUrl);
  const musicPlaying = useSettings((s) => s.musicPlaying);
  const driveApiKey = useSettings((s) => s.driveApiKey);
  const setSettings = useSettings((s) => s.set);
  const ref = useRef<HTMLAudioElement | null>(null);

  // Set very low volume for background music
  useEffect(() => {
    if (!ref.current) return;
    ref.current.volume = 0.08; // Very soft background volume
  }, []);

  // Sync state between store and DOM element
  useEffect(() => {
    if (!ref.current) return;
    if (musicPlaying) {
      ref.current.play().catch(() => {
        // Autoplay policy might block it initially, reset store state if it fails
        setSettings({ musicPlaying: false });
      });
    } else {
      ref.current.pause();
    }
  }, [musicPlaying, setSettings]);

  // Automatically play on first user interaction (bypasses browser autoplay restrictions)
  useEffect(() => {
    const startMusic = () => {
      setSettings({ musicPlaying: true });
      cleanup();
    };

    const cleanup = () => {
      document.removeEventListener("click", startMusic);
      document.removeEventListener("touchstart", startMusic);
      document.removeEventListener("scroll", startMusic);
    };

    document.addEventListener("click", startMusic);
    document.addEventListener("touchstart", startMusic);
    document.addEventListener("scroll", startMusic);

    return cleanup;
  }, [setSettings]);

  if (!url) return null;

  // Build direct stream URL if it's a Google Drive file ID (doesn't start with http)
  const getAudioSrc = () => {
    if (url.startsWith("http")) {
      // If it's a drive view link, extract the ID
      const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (driveMatch && driveApiKey) {
        return `https://www.googleapis.com/drive/v3/files/${driveMatch[1]}?alt=media&key=${driveApiKey}`;
      }
      return url;
    }
    if (driveApiKey) {
      return `https://www.googleapis.com/drive/v3/files/${url}?alt=media&key=${driveApiKey}`;
    }
    return url;
  };

  return (
    <>
      <audio ref={ref} src={getAudioSrc()} loop preload="auto" />
      <button
        aria-label={musicPlaying ? "Pause music" : "Play music"}
        onClick={() => {
          setSettings({ musicPlaying: !musicPlaying });
        }}
        className="glass hover:shadow-elegant fixed right-5 bottom-5 z-45 grid h-12 w-12 place-items-center rounded-full border border-primary/30 text-primary transition-all hover:scale-105 shadow-soft cursor-pointer"
      >
        {musicPlaying ? <Pause size={18} /> : <Music size={18} />}
      </button>
    </>
  );
}
