import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Images,
  Heart,
  Smartphone,
  Menu,
  X,
  Lock,
  ChevronRight,
  Clock,
  Sparkles,
  Camera,
  Film,
  FileText,
  Mail,
  User,
} from "lucide-react";
import { lockWebsite } from "./PasswordGate";
import { AppDownloadModal } from "./AppDownloadModal";
import { useSettings } from "@/lib/store";

export function MobileBottomNav() {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);
  const [apkModalOpen, setApkModalOpen] = useState(false);
  const albumPdfUrl = useSettings((s) => s.albumPdfUrl);

  const mainTabs = [
    { to: "/", label: "Home", icon: Home, exact: true },
    { to: "/gallery", label: "Gallery", icon: Images, exact: false },
    { to: "/save-the-date", label: "Invite", icon: Heart, exact: false },
  ];

  return (
    <>
      {/* Slide-up "More" Menu Sheet on Mobile */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="glass relative max-h-[82vh] overflow-y-auto rounded-t-3xl border-t border-primary/25 p-6 shadow-2xl z-10"
            >
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-primary/20" />

              <div className="flex items-center justify-between pb-3 border-b border-primary/10">
                <span className="font-display text-xl text-foreground">Explore Albums</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-primary/10"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Album Links */}
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {[
                  { to: "/engagement", label: "Engagement", icon: Camera },
                  { to: "/kalupidithal", label: "Kalupidithal", icon: Sparkles },
                  { to: "/wedding", label: "Wedding", icon: Heart },
                  { to: "/reception", label: "Reception", icon: Images },
                  { to: "/baby", label: "Little Miracle", icon: Sparkles },
                  { to: "/videos", label: "Films", icon: Film },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-2xl border border-primary/15 bg-background/60 p-3 text-xs font-semibold tracking-wider text-foreground/85 transition-all hover:border-primary hover:text-primary active:scale-95"
                  >
                    <item.icon size={15} className="text-primary shrink-0" />
                    <span className="truncate uppercase">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Utility Links */}
              <div className="mt-4 space-y-1.5 border-t border-primary/10 pt-4">
                <Link
                  to="/timeline"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs tracking-wider uppercase text-foreground/80 hover:bg-primary/10 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Clock size={14} className="text-primary" /> Timeline &amp; Story
                  </span>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </Link>

                {albumPdfUrl && (
                  <a
                    href={albumPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs tracking-wider uppercase text-foreground/80 hover:bg-primary/10 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FileText size={14} className="text-primary" /> Wedding Album (PDF)
                    </span>
                    <span className="text-[10px] text-primary">↗</span>
                  </a>
                )}

                <Link
                  to="/memories"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs tracking-wider uppercase text-foreground/80 hover:bg-primary/10 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles size={14} className="text-primary" /> Guest Memories
                  </span>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </Link>

                <Link
                  to="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs tracking-wider uppercase text-foreground/80 hover:bg-primary/10 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Mail size={14} className="text-primary" /> Contact &amp; RSVP
                  </span>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </Link>

                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs tracking-wider uppercase text-foreground/80 hover:bg-primary/10 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <User size={14} className="text-primary" /> Admin Settings
                  </span>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </Link>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    lockWebsite();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs tracking-wider uppercase text-destructive hover:bg-destructive/10 transition-colors cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2">
                    <Lock size={14} /> Lock Website Now
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pure APK Download & Share Modal */}
      <AppDownloadModal open={apkModalOpen} onClose={() => setApkModalOpen(false)} />

      {/* Floating Glass Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed inset-x-3 bottom-3 z-40 lg:hidden"
      >
        <div className="glass mx-auto flex max-w-md items-center justify-around rounded-full border border-primary/25 bg-background/85 px-2 py-2 shadow-2xl backdrop-blur-xl">
          {mainTabs.map((tab) => {
            const isActive = tab.exact
              ? currentPath === tab.to
              : currentPath.startsWith(tab.to);

            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`relative flex flex-col items-center justify-center py-1 px-3 text-[10px] font-semibold tracking-wider uppercase transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileNavActivePill"
                    className="absolute inset-0 rounded-full bg-primary/15"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <tab.icon size={18} className="relative z-10" />
                <span className="relative z-10 mt-0.5">{tab.label}</span>
              </Link>
            );
          })}

          {/* App (APK) Button */}
          <button
            onClick={() => setApkModalOpen(true)}
            className="relative flex flex-col items-center justify-center py-1 px-3 text-[10px] font-semibold tracking-wider uppercase transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <div className="gradient-luxe flex h-6 w-6 items-center justify-center rounded-full text-white shadow-soft">
              <Smartphone size={13} />
            </div>
            <span className="mt-0.5 text-primary">App</span>
          </button>

          {/* More Menu Toggle */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 text-[10px] font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
              menuOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Menu size={18} />
            <span className="mt-0.5">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
