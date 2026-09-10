import { useState } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.dataset.theme === "dark"
        ? "dark"
        : "light";
    }
    return "light";
  });

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = next;
    }
    setTheme(next);
    try {
      localStorage.setItem("medication-inventory-theme", next);
    } catch {
      /* Theme works even if localStorage is disabled or restricted */
    }
  };

  return { theme, toggleTheme };
}
