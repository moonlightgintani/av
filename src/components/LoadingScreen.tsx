import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useSettings } from "@/lib/store";

export function LoadingScreen() {
  const [done, setDone] = useState(false);
  const { brideName, groomName } = useSettings();
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1400);
    return () => clearTimeout(t);
  }, []);
  const initials = `${brideName?.[0] ?? "A"} & ${groomName?.[0] ?? "B"}`;
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-script text-gradient-luxe text-7xl"
          >
            {initials}
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-6 h-px bg-primary/60"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground mt-4 text-xs tracking-[0.4em] uppercase"
          >
            A love story
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
