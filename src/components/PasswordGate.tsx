import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSettings } from "@/lib/store";
import { verifyPasscode } from "@/lib/crypto";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldCheck, Clock, KeyRound, Loader2 } from "lucide-react";

export const STORAGE_LOCK_KEY = "wedding-site-locked";
export const STORAGE_UNLOCKED_KEY = "wedding-site-unlocked";

/**
 * Programmatically locks the website immediately
 */
export function lockWebsite() {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_LOCK_KEY, "1");
    sessionStorage.removeItem(STORAGE_UNLOCKED_KEY);
    window.dispatchEvent(new CustomEvent("lock-website-now"));
  }
}

export function PasswordGate({ children }: { children: ReactNode }) {
  const {
    passwordEnabled = true,
    sitePassword,
    sitePasswordHash,
    brideName,
    groomName,
    lockEveryAccess = true,
    autoLockEnabled = true,
    autoLockTimeout = 60,
  } = useSettings();

  // Initial lock state:
  // When passwordEnabled is true:
  // If lockEveryAccess is true, the site ALWAYS requires the passcode on every visit / page entry.
  // Otherwise, respect session unlocked flag.
  const [locked, setLocked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    if (!passwordEnabled) return false;
    if (lockEveryAccess) {
      // Require passcode every time website is opened or refreshed
      return true;
    }
    const isExplicitlyLocked = sessionStorage.getItem(STORAGE_LOCK_KEY) === "1";
    if (isExplicitlyLocked) return true;
    if (sessionStorage.getItem(STORAGE_UNLOCKED_KEY) !== "1") {
      return true;
    }
    return false;
  });

  const [lockReason, setLockReason] = useState<"inactivity" | "manual" | "required">(
    lockEveryAccess ? "required" : "inactivity"
  );
  const [val, setVal] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState<number | null>(null);

  const lastActiveRef = useRef<number>(Date.now());

  // Listen for manual lock events
  useEffect(() => {
    const handleManualLock = () => {
      sessionStorage.setItem(STORAGE_LOCK_KEY, "1");
      sessionStorage.removeItem(STORAGE_UNLOCKED_KEY);
      setLockReason("manual");
      setLocked(true);
      setWarningCountdown(null);
    };

    window.addEventListener("lock-website-now", handleManualLock);
    return () => window.removeEventListener("lock-website-now", handleManualLock);
  }, []);

  // Inactivity tracking when unlocked
  useEffect(() => {
    if (locked || !autoLockEnabled) {
      setWarningCountdown(null);
      return;
    }

    const resetActivity = () => {
      lastActiveRef.current = Date.now();
      if (warningCountdown !== null) {
        setWarningCountdown(null);
      }
    };

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "wheel",
      "pointerdown",
    ];

    activityEvents.forEach((ev) => {
      window.addEventListener(ev, resetActivity, { passive: true });
    });

    const checkTimeout = () => {
      const timeout = Math.max(5, autoLockTimeout || 60);
      const elapsed = (Date.now() - lastActiveRef.current) / 1000;

      if (elapsed >= timeout) {
        // Auto-lock triggered!
        sessionStorage.setItem(STORAGE_LOCK_KEY, "1");
        sessionStorage.removeItem(STORAGE_UNLOCKED_KEY);
        setLockReason("inactivity");
        setLocked(true);
        setWarningCountdown(null);
      } else if (elapsed >= timeout - 10) {
        // Show 10-second warning
        const remaining = Math.max(1, Math.ceil(timeout - elapsed));
        setWarningCountdown(remaining);
      } else {
        setWarningCountdown(null);
      }
    };

    const timer = setInterval(checkTimeout, 500);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkTimeout();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", checkTimeout);

    return () => {
      activityEvents.forEach((ev) => {
        window.removeEventListener(ev, resetActivity);
      });
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", checkTimeout);
    };
  }, [locked, autoLockEnabled, autoLockTimeout, warningCountdown]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!val.trim()) return;

    setVerifying(true);
    setErr(false);

    try {
      const targetHashOrPlain = sitePasswordHash || sitePassword || "love";
      const isValid = await verifyPasscode(val, targetHashOrPlain);

      if (isValid) {
        sessionStorage.setItem(STORAGE_LOCK_KEY, "0");
        sessionStorage.setItem(STORAGE_UNLOCKED_KEY, "1");
        lastActiveRef.current = Date.now();
        setLocked(false);
        setVal("");
        setErr(false);
        setWarningCountdown(null);
      } else {
        setErr(true);
      }
    } catch {
      setErr(true);
    } finally {
      setVerifying(false);
    }
  };

  const stayActive = () => {
    lastActiveRef.current = Date.now();
    setWarningCountdown(null);
  };

  return (
    <>
      {/* Render site content when unlocked */}
      {!locked && children}

      {/* Floating Inactivity Warning Banner when 10 seconds remain */}
      <AnimatePresence>
        {!locked && warningCountdown !== null && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 sm:bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-primary/30 bg-background/90 px-5 py-3 shadow-2xl backdrop-blur-md"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Clock size={16} className="animate-spin" style={{ animationDuration: "3s" }} />
            </div>
            <div className="text-left text-xs">
              <p className="font-semibold text-foreground">
                Auto-locking in <span className="text-primary font-mono text-sm">{warningCountdown}s</span>
              </p>
              <p className="text-muted-foreground text-[11px]">No activity detected</p>
            </div>
            <button
              onClick={stayActive}
              className="gradient-luxe rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wider text-white uppercase shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              Stay Active
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Locked Gate Overlay */}
      {locked && (
        <div className="fixed inset-0 z-50 grid min-h-screen place-items-center overflow-y-auto px-6 py-12">
          {/* Ambient Luxurious Backdrop */}
          <div
            className="pointer-events-none fixed inset-0 opacity-80"
            style={{ background: "var(--gradient-soft)" }}
          />
          <div className="pointer-events-none fixed inset-0 bg-background/50 backdrop-blur-2xl" />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="glass shadow-2xl relative w-full max-w-md rounded-3xl border border-primary/30 p-8 sm:p-10 text-center"
          >
            {/* Glowing Lock Badge */}
            <div className="relative mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary shadow-inner">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full border border-primary/40"
              />
              <Lock size={22} className="relative z-10" />
            </div>

            {/* Couple Monogram / Script */}
            <h1 className="font-script text-gradient-luxe text-4xl sm:text-5xl">
              {brideName?.[0] ?? "A"} &amp; {groomName?.[0] ?? "V"}
            </h1>

            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold tracking-[0.25em] text-primary uppercase">
              <ShieldCheck size={13} />
              <span>
                {lockReason === "inactivity" ? "Session Auto-Locked" : "Encrypted Invitation Gate"}
              </span>
            </div>

            <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
              {lockReason === "inactivity"
                ? `Website auto-locked after ${autoLockTimeout || 60} seconds of inactivity. Enter passcode to continue.`
                : "This wedding album is private and protected by encrypted passcode. Please enter the passcode to access."}
            </p>

            <form onSubmit={handleUnlock} className="mt-7 space-y-4">
              <motion.div
                animate={err ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
                  <KeyRound size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={val}
                  autoFocus
                  disabled={verifying}
                  onChange={(e) => {
                    setVal(e.target.value);
                    if (err) setErr(false);
                  }}
                  placeholder="Enter passcode"
                  className="bg-background/80 border-border focus:border-primary text-foreground placeholder:text-muted-foreground/60 w-full rounded-2xl border py-3.5 pr-12 pl-11 text-center font-medium tracking-widest outline-none transition-all shadow-sm focus:ring-2 focus:ring-primary/20 disabled:opacity-70"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-4 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </motion.div>

              {err && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-destructive text-xs font-medium"
                >
                  Incorrect passcode. Please try again.
                </motion.p>
              )}

              <button
                type="submit"
                disabled={verifying}
                className="gradient-luxe shadow-elegant w-full cursor-pointer rounded-2xl py-3.5 text-sm font-semibold tracking-[0.25em] text-white uppercase transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-75 flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Unlock Website</span>
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-primary/10 pt-4 flex flex-col items-center gap-1">
              <p className="text-muted-foreground/75 text-[11px]">
                Protected with SHA-256 cryptographic verification
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
