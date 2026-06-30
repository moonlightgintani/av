import { useEffect, useState, type ReactNode } from "react";
import { useSettings } from "@/lib/store";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

const KEY = "wedding-site-unlocked";

export function PasswordGate({ children }: { children: ReactNode }) {
  const { passwordEnabled, sitePassword, brideName, groomName } = useSettings();
  const [unlocked, setUnlocked] = useState(true);
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!passwordEnabled) {
      setUnlocked(true);
      return;
    }
    setUnlocked(typeof window !== "undefined" && sessionStorage.getItem(KEY) === "1");
  }, [passwordEnabled]);

  if (!passwordEnabled || unlocked) return <>{children}</>;

  return (
    <div className="relative grid min-h-screen place-items-center px-6">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{ background: "var(--gradient-soft)" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass shadow-elegant w-full max-w-md rounded-3xl border border-primary/20 p-10 text-center"
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-primary/30 text-primary">
          <Lock size={18} />
        </div>
        <h1 className="font-script text-gradient-luxe mt-5 text-5xl">
          {brideName?.[0]} &amp; {groomName?.[0]}
        </h1>
        <p className="text-muted-foreground mt-2 text-xs tracking-[0.35em] uppercase">
          A private invitation
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (val === sitePassword) {
              sessionStorage.setItem(KEY, "1");
              setUnlocked(true);
            } else setErr(true);
          }}
          className="mt-8 space-y-3"
        >
          <input
            type="password"
            value={val}
            autoFocus
            onChange={(e) => {
              setVal(e.target.value);
              setErr(false);
            }}
            placeholder="Enter password"
            className="bg-background/70 border-border focus:border-primary w-full rounded-full border px-5 py-3 text-center tracking-widest outline-none transition-colors"
          />
          {err && <p className="text-destructive text-xs">Incorrect password</p>}
          <button
            type="submit"
            className="gradient-luxe shadow-elegant w-full rounded-full px-6 py-3 text-sm font-medium tracking-[0.25em] text-white uppercase transition-transform hover:scale-[1.02]"
          >
            Enter
          </button>
        </form>
      </motion.div>
    </div>
  );
}
