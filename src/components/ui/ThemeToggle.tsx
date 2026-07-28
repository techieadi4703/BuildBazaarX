import { useTheme } from "../../hooks/useTheme";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  /** "solid" (default) uses the standard card surface; "transparent" is for
   * floating over imagery, e.g. a hero header before the user scrolls. */
  variant?: "solid" | "transparent";
  className?: string;
}

export function ThemeToggle({ variant = "solid", className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const solidClasses =
    "border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] hover:border-[var(--accent)]";

  const transparentClasses =
    "border-white/30 bg-white/10 text-white/90 backdrop-blur-md hover:text-white hover:bg-white/20 hover:border-white/50";

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-200 ${
        variant === "transparent" ? transparentClasses : solidClasses
      } ${className}`}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" strokeWidth={1.75} />
      ) : (
        <Moon className="w-4 h-4" strokeWidth={1.75} />
      )}
    </button>
  );
}
