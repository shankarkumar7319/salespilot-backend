document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("themeToggle");

  if (!toggle) return;

  // ✅ DEFAULT = LIGHT MODE ALWAYS
  document.body.classList.remove("dark-mode");
  localStorage.setItem("theme", "light");
  toggle.innerText = "🌙";

  // If saved theme exists
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    toggle.innerText = "☀️";
  }

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");

    localStorage.setItem("theme", isDark ? "dark" : "light");

    toggle.innerText = isDark ? "☀️" : "🌙";
  });
});