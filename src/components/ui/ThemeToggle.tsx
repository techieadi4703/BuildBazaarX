import { useTheme } from "../../hooks/useTheme";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="
        inline-flex items-center justify-center
        w-9 h-9 rounded-md
        border border-[var(--border-default)]
        bg-[var(--bg-card)]
        text-[var(--text-secondary)]
        hover:text-[var(--text-primary)]
        hover:bg-[var(--bg-surface)]
        hover:border-[var(--accent)]
        transition-all duration-200
      "
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
