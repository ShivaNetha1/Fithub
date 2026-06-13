"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check initial state asynchronously to avoid React 19 synchronous render cascades
    const isDark = document.documentElement.classList.contains("dark");
    const activeTheme = isDark ? "dark" : "light";
    setTimeout(() => {
      setTheme(activeTheme);
    }, 0);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    
    setTheme(nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex size-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--panel)] text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)] transition-colors cursor-pointer shadow-2xs"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    >
      {theme === "light" ? (
        <Moon size={16} aria-hidden="true" className="transition-transform rotate-0 scale-100 hover:-rotate-12 duration-200" />
      ) : (
        <Sun size={16} aria-hidden="true" className="transition-transform rotate-0 scale-100 hover:rotate-45 duration-200" />
      )}
    </button>
  );
}
