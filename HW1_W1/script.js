
/**
 * T-04: Accessible Theme Engine
 * Responsibilities:
 * - Toggle light and dark themes.
 * - Synchronize the accessible button state.
 * - Persist the selected theme in localStorage.
 */

const themeToggle = document.querySelector("#theme-btn");
const root = document.documentElement;
const THEME_STORAGE_KEY = "theme";

function applyTheme(theme) {
  const isDark = theme === "dark";

  // Update the theme attribute consumed by CSS.
  root.dataset.theme = isDark ? "dark" : "light";

  // Keep the accessible state synchronized.
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Switch to light theme" : "Switch to dark theme"
  );
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    // The theme still works if storage is unavailable.
    console.warn("Unable to save theme preference.", error);
  }
}

function loadTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    return savedTheme === "dark" || savedTheme === "light"
      ? savedTheme
      : "light";
  } catch (error) {
    console.warn("Unable to load theme preference.", error);
    return "light";
  }
}

// Restore the saved theme when the page loads.
applyTheme(loadTheme());

// Toggle themes when the button is activated.
themeToggle.addEventListener("click", () => {
  const currentTheme = root.dataset.theme;
  const nextTheme = currentTheme === "dark" ? "light" : "dark";

  applyTheme(nextTheme);
  saveTheme(nextTheme);
});
