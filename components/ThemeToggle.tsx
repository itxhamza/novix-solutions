"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

/**
 * Dark/light switch.
 *
 * The theme itself is applied before first paint by the inline script in
 * app/layout.tsx — this component only reads what that script decided and
 * flips it, so there is never a frame of the wrong theme and never two
 * sources of truth.
 *
 * It renders nothing until mounted. The server has no way to know which
 * theme the browser chose, so rendering a guess would either hydrate wrong
 * or show the wrong icon for a beat.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  if (!theme) {
    // Hold the space so the header does not reflow when this appears.
    return <span className={className} aria-hidden="true" style={{ width: "2.5rem" }} />;
  }

  const next: Theme = theme === "dark" ? "light" : "dark";

  const apply = () => {
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode and blocked storage: the switch still works for this
      // page view, it just will not be remembered.
    }
    // The canvas dot field caches its colours, so it has to be told.
    window.dispatchEvent(new Event("themechange"));
  };

  return (
    <button
      type="button"
      onClick={apply}
      className={`theme-toggle${className ? ` ${className}` : ""}`}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      {theme === "dark" ? (
        // Moon: we are dark, pressing it goes light.
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.6v2.6M12 18.8v2.6M2.6 12h2.6M18.8 12h2.6M5.4 5.4l1.8 1.8M16.8 16.8l1.8 1.8M18.6 5.4l-1.8 1.8M7.2 16.8l-1.8 1.8" />
        </svg>
      )}
    </button>
  );
}
