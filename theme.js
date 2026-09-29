// Theme handling: saved choice > system preference > dark.
// Loaded in <head> (no defer) so the theme is set before first paint.
(function () {
  const KEY = "dsa-tree-theme";
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: light)");

  let saved = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch {}

  function current() {
    return root.getAttribute("data-theme") || "dark";
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    const btn = document.getElementById("theme-btn");
    if (btn) {
      const next = theme === "dark" ? "light" : "dark";
      btn.setAttribute("aria-label", `Switch to ${next} theme`);
      btn.title = `Switch to ${next} theme`;
    }
  }

  apply(saved === "light" || saved === "dark" ? saved : media.matches ? "light" : "dark");

  document.addEventListener("DOMContentLoaded", () => {
    apply(current()); // refresh button label now that it exists
    document.getElementById("theme-btn").addEventListener("click", () => {
      const next = current() === "dark" ? "light" : "dark";
      apply(next);
      saved = next;
      try {
        localStorage.setItem(KEY, next);
      } catch {}
    });
  });

  // Follow the OS setting until the user picks a theme themselves
  media.addEventListener("change", (e) => {
    if (!saved) apply(e.matches ? "light" : "dark");
  });
})();