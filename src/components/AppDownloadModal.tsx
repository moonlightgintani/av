import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Share2,
  Check,
  X,
  Smartphone,
  ShieldCheck,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useSettings } from "@/lib/store";
import logoImg from "@/assets/logo.jpeg";

export function AppDownloadModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { brideName, groomName, apkUrl = "/OurWeddingStory.apk" } = useSettings();
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const getFullApkUrl = () => {
    if (typeof window !== "undefined") {
      return new URL(apkUrl, window.location.origin).href;
    }
    return apkUrl;
  };

  const handleShare = async () => {
    const fullUrl = getFullApkUrl();
    const shareData = {
      title: `${brideName} & ${groomName}'s Wedding App`,
      text: `Download our official wedding album app to view all photos, videos, and memories! Passcode: 1596`,
      url: fullUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        setSharing(true);
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          fallbackCopy(fullUrl);
        }
      } finally {
        setSharing(false);
      }
    } else {
      fallbackCopy(fullUrl);
    }
  };

  const fallbackCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="glass relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-primary/30 p-6 sm:p-8 shadow-2xl z-10 text-center max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-primary/10 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* App Icon */}
            <div className="relative mx-auto mb-4 h-16 w-16">
              <img
                src={logoImg}
                alt="Wedding App"
                className="h-full w-full rounded-2xl object-cover border-2 border-primary/40 shadow-soft"
              />
              <div className="gradient-luxe absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-sm">
                <Smartphone size={12} />
              </div>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl text-foreground">
              Our Wedding App
            </h2>
            <p className="font-script text-gradient-luxe text-xl sm:text-2xl mt-0.5">
              {brideName} &amp; {groomName}
            </p>

            <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
              Install the pure Android app on your phone for full-screen viewing, offline access, and fast photo downloads.
            </p>

            <div className="my-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
              <ShieldCheck size={13} />
              <span>Version 1.0 • Pure Android APK (11.4 MB)</span>
            </div>

            {/* Main Action Buttons */}
            <div className="mt-4 space-y-2.5">
              <a
                href={apkUrl}
                download="OurWeddingStory.apk"
                className="gradient-luxe shadow-elegant flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-semibold tracking-wider text-white uppercase transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Download size={15} />
                <span>Download APK File</span>
              </a>

              <button
                onClick={handleShare}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-background/60 py-3 text-xs font-semibold tracking-wider text-foreground transition-all hover:bg-primary/10 active:scale-[0.98] cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={15} className="text-primary" />
                    <span className="text-primary">Download Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={15} />
                    <span>Share APK with Guests</span>
                  </>
                )}
              </button>
            </div>

            {/* Passcode notice */}
            <div className="mt-5 rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs">
              <p className="text-muted-foreground text-[11px]">
                Invitation Passcode:{" "}
                <span className="font-mono text-primary font-bold tracking-widest text-sm">
                  1596
                </span>
              </p>
            </div>

            {/* Install Steps */}
            <div className="mt-5 border-t border-primary/10 pt-4 text-left">
              <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                How to install:
              </p>
              <ol className="mt-2 space-y-1.5 text-muted-foreground text-[11px]">
                <li className="flex items-start gap-2">
                  <span className="gradient-luxe flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white">
                    1
                  </span>
                  <span>Tap <strong>Download APK File</strong> above.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="gradient-luxe flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white">
                    2
                  </span>
                  <span>Open downloaded file from your browser notification or Downloads folder.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="gradient-luxe flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white">
                    3
                  </span>
                  <span>If prompted, allow <em>Install from unknown sources</em> and tap Install.</span>
                </li>
              </ol>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
