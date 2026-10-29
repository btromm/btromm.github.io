// Light/dark toggle. head.html sets the starting theme before paint;
// this wires up the switch, remembers a manual choice, and, when the
// site default is "auto", follows the OS setting as it changes.
(function () {
  var root = document.documentElement;
  var body = document.body;
  var toggle = document.querySelector(".theme-toggle");
  var media = window.matchMedia("(prefers-color-scheme: dark)");

  function current() {
    return root.classList.contains("dark") ? "dark" : "light";
  }

  function apply(theme) {
    var other = theme === "dark" ? "light" : "dark";
    root.classList.replace(other, theme) || root.classList.add(theme);
    body.classList.remove("auto", other);
    body.classList.add(theme);
    if (toggle) toggle.setAttribute("aria-checked", theme === "dark");
  }

  function saved() {
    try {
      return localStorage.getItem("theme");
    } catch (e) {
      return null;
    }
  }

  apply(current());

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      apply(next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
    });
    // Only animate the knob after the first paint, so it doesn't slide on load
    requestAnimationFrame(function () {
      toggle.classList.add("has-transition");
    });
  }

  media.addEventListener("change", function (e) {
    if (!saved() && root.dataset.themeDefault === "auto") apply(e.matches ? "dark" : "light");
  });
})();
