import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useSettings } from "@/lib/store";
import logoImg from "@/assets/logo.jpeg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { to: "/", label: "Home" },
  { to: "/save-the-date", label: "Save the Date" },
  { to: "/engagement", label: "Engagement" },
  { to: "/kalupidithal", label: "Kalupidithal" },
  { to: "/wedding", label: "Wedding" },
  { to: "/reception", label: "Reception" },
  { to: "/baby", label: "Little Miracle" },
  { to: "/gallery", label: "Gallery" },
  { to: "/videos", label: "Videos" },
  { to: "/timeline", label: "Timeline" },
  { to: "/memories", label: "Memories" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const brideName = useSettings((s) => s.brideName);
  const groomName = useSettings((s) => s.groomName);
  const albumPdfUrl = useSettings((s) => s.albumPdfUrl);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-primary/15 glass py-2.5 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <img
            src={logoImg}
            alt="Logo"
            className="h-8 w-8 rounded-full object-cover border border-primary/25 shadow-soft transition-transform group-hover:scale-105"
          />
          <span className="font-script text-gradient-luxe text-2xl sm:text-3xl">
            {brideName?.[0] ?? "A"} &amp; {groomName?.[0] ?? "B"}
          </span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-primary" }}
            inactiveProps={{ className: "text-foreground/70 hover:text-primary" }}
            className="text-[13px] tracking-[0.18em] uppercase transition-colors"
          >
            Home
          </Link>
          <Link
            to="/save-the-date"
            activeProps={{ className: "text-primary" }}
            inactiveProps={{ className: "text-foreground/70 hover:text-primary" }}
            className="text-[13px] tracking-[0.18em] uppercase transition-colors"
          >
            Save the Date
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="text-[13px] tracking-[0.18em] uppercase text-foreground/70 hover:text-primary transition-colors flex items-center gap-1 outline-none cursor-pointer">
              Albums <ChevronDown size={12} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="glass border-primary/10 p-1.5 min-w-[170px]"
            >
              <DropdownMenuItem asChild>
                <Link
                  to="/engagement"
                  activeProps={{ className: "text-primary font-medium" }}
                  inactiveProps={{ className: "text-foreground/80 hover:text-primary" }}
                  className="w-full text-[12px] tracking-[0.15em] uppercase px-3 py-2 block rounded-md transition-colors"
                >
                  Engagement
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/kalupidithal"
                  activeProps={{ className: "text-primary font-medium" }}
                  inactiveProps={{ className: "text-foreground/80 hover:text-primary" }}
                  className="w-full text-[12px] tracking-[0.15em] uppercase px-3 py-2 block rounded-md transition-colors"
                >
                  Kalupidithal
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/wedding"
                  activeProps={{ className: "text-primary font-medium" }}
                  inactiveProps={{ className: "text-foreground/80 hover:text-primary" }}
                  className="w-full text-[12px] tracking-[0.15em] uppercase px-3 py-2 block rounded-md transition-colors"
                >
                  Wedding
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/reception"
                  activeProps={{ className: "text-primary font-medium" }}
                  inactiveProps={{ className: "text-foreground/80 hover:text-primary" }}
                  className="w-full text-[12px] tracking-[0.15em] uppercase px-3 py-2 block rounded-md transition-colors"
                >
                  Reception
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/baby"
                  activeProps={{ className: "text-primary font-medium" }}
                  inactiveProps={{ className: "text-foreground/80 hover:text-primary" }}
                  className="w-full text-[12px] tracking-[0.15em] uppercase px-3 py-2 block rounded-md transition-colors"
                >
                  Little Miracle
                </Link>
              </DropdownMenuItem>
              {albumPdfUrl && (
                <DropdownMenuItem asChild>
                  <a
                    href={albumPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-[12px] tracking-[0.15em] uppercase px-3 py-2 block rounded-md transition-colors text-foreground/85 hover:text-primary cursor-pointer"
                  >
                    Wedding Album (PDF)
                  </a>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            to="/gallery"
            search={{ filter: undefined }}
            activeProps={{ className: "text-primary" }}
            inactiveProps={{ className: "text-foreground/70 hover:text-primary" }}
            className="text-[13px] tracking-[0.18em] uppercase transition-colors"
          >
            Gallery
          </Link>
          <Link
            to="/videos"
            activeProps={{ className: "text-primary" }}
            inactiveProps={{ className: "text-foreground/70 hover:text-primary" }}
            className="text-[13px] tracking-[0.18em] uppercase transition-colors"
          >
            Videos
          </Link>
          {albumPdfUrl && (
            <a
              href={albumPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] tracking-[0.18em] uppercase transition-colors text-foreground/70 hover:text-primary cursor-pointer"
            >
              PDF Album
            </a>
          )}
          <Link
            to="/timeline"
            activeProps={{ className: "text-primary" }}
            inactiveProps={{ className: "text-foreground/70 hover:text-primary" }}
            className="text-[13px] tracking-[0.18em] uppercase transition-colors"
          >
            Timeline
          </Link>
          <Link
            to="/memories"
            activeProps={{ className: "text-primary" }}
            inactiveProps={{ className: "text-foreground/70 hover:text-primary" }}
            className="text-[13px] tracking-[0.18em] uppercase transition-colors"
          >
            Memories
          </Link>
          <Link
            to="/about"
            activeProps={{ className: "text-primary" }}
            inactiveProps={{ className: "text-foreground/70 hover:text-primary" }}
            className="text-[13px] tracking-[0.18em] uppercase transition-colors"
          >
            About
          </Link>
          <Link
            to="/contact"
            activeProps={{ className: "text-primary" }}
            inactiveProps={{ className: "text-foreground/70 hover:text-primary" }}
            className="text-[13px] tracking-[0.18em] uppercase transition-colors"
          >
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            aria-label="Menu"
            className="text-foreground/80 grid h-10 w-10 place-items-center lg:hidden"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="glass mt-2 mx-3 rounded-2xl border border-primary/15 px-6 py-5 lg:hidden">
          <nav className="grid gap-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "text-primary" }}
                inactiveProps={{ className: "text-foreground/80" }}
                className="text-sm tracking-[0.15em] uppercase"
              >
                {l.label}
              </Link>
            ))}
            {albumPdfUrl && (
              <a
                href={albumPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="text-sm tracking-[0.15em] uppercase text-foreground/85 hover:text-primary transition-colors cursor-pointer"
              >
                PDF Album ↗
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
