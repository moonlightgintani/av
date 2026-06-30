import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";
import { useSettings } from "@/lib/store";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useSettings();
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`text-foreground/70 hover:text-primary grid place-items-center rounded-full transition-colors ${compact ? "h-9 w-9" : "h-10 w-10"}`}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
