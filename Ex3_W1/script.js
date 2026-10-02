const themeToggle = document.querySelector("#theme-toggle");
const themeIcon = document.querySelector("#theme-icon");

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");


/* =========================
   Theme State
   ========================= */

function applyTheme(theme) {
    const isDark = theme === "dark";

    document.documentElement.dataset.theme = theme;

    themeToggle.setAttribute("aria-pressed", String(isDark));

    themeToggle.setAttribute(
        "aria-label",
        isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
    );

    themeIcon.textContent = isDark ? "☾" : "☀";

    localStorage.setItem("theme", theme);
}


const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark" || savedTheme === "light") {
    applyTheme(savedTheme);
} else {
    applyTheme("light");
}


themeToggle.addEventListener("click", () => {
    const currentTheme =
        document.documentElement.dataset.theme || "light";

    const nextTheme =
        currentTheme === "dark"
            ? "light"
            : "dark";

    applyTheme(nextTheme);
});


/* =========================
   Contact Form State
   ========================= */

contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
        formStatus.textContent = "Please complete all required fields.";
        contactForm.reportValidity();
        return;
    }

    formStatus.textContent =
        "Your message has been submitted successfully.";

    contactForm.reset();
});


contactForm.addEventListener("input", () => {
    formStatus.textContent = "";
});