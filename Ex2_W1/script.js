const themeToggle = document.querySelector("#theme-toggle");

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
}

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark" || savedTheme === "light") {
    applyTheme(savedTheme);
}

themeToggle.addEventListener("click", () => {
    const currentTheme =
        document.documentElement.dataset.theme || "light";

    const nextTheme = currentTheme === "dark"
        ? "light"
        : "dark";

    applyTheme(nextTheme);
});