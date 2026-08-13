import { useCallback, useEffect, useState } from "react";

export type ThemeChoice = "light" | "dark" | "system";
const KEY = "careerbuddy-theme";

function apply(theme: ThemeChoice) {
  if (typeof document === "undefined") return;
  const prefersDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", prefersDark);
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeChoice>("light");

  useEffect(() => {
    const stored = (localStorage.getItem(KEY) as ThemeChoice | null) ?? "system";
    setThemeState(stored);
    apply(stored);
  }, []);

  const setTheme = useCallback((next: ThemeChoice) => {
    setThemeState(next);
    localStorage.setItem(KEY, next);
    apply(next);
  }, []);

  return { theme, setTheme };
}
