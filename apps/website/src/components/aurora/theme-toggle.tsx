import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/use-theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="glass inline-flex size-9 items-center justify-center rounded-full transition-transform active:scale-95"
    >
      {theme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </button>
  );
}
