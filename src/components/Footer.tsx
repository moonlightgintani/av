import { Heart } from "lucide-react";
import { useSettings } from "@/lib/store";

export function Footer() {
  const { familyName, weddingDate, brideName, groomName } = useSettings();
  const date = new Date(weddingDate);
  const formatted = isNaN(date.getTime())
    ? weddingDate
    : date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  return (
    <footer className="border-t border-primary/15 bg-secondary/40 mt-24 px-6 py-14 text-center">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="font-script text-gradient-luxe text-4xl">
          {brideName} &amp; {groomName}
        </div>
        <div className="text-muted-foreground text-xs tracking-[0.35em] uppercase">{formatted}</div>
        <p className="text-foreground/75 flex items-center justify-center gap-2 text-sm">
          Made with <Heart size={14} className="fill-primary text-primary" /> for our beloved sister
        </p>
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} {familyName}. All rights reserved.
        </p>
        <p className="text-muted-foreground/60 text-[10px] tracking-[0.2em] uppercase mt-1">
          Developed with ♡ by Surya
        </p>
      </div>
    </footer>
  );
}
