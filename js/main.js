/* MIS Society site scripts. Every page works with JS off; this only adds polish. */

// Tell the CSS that JavaScript is running (shows the Toolkit filter bar, collapses the steps)
document.documentElement.classList.add("js");

// Footer year (static text in the HTML is the fallback)
document.querySelectorAll("[data-year]").forEach(function (el) {
  el.textContent = new Date().getFullYear();
});

// Escape closes the open mobile menu and puts focus back on the hamburger button
document.addEventListener("keydown", function (e) {
  var nav = document.getElementById("mainNav");
  if (e.key !== "Escape" || !nav || !nav.classList.contains("show") || !window.bootstrap) return;
  window.bootstrap.Collapse.getOrCreateInstance(nav).hide();
  document.querySelector(".navbar-toggler").focus();
});

// Toolkit: filter tool cards by category. A card can have several categories (data-category="ai productivity").
(function () {
  var bar = document.querySelector("[data-filter-bar]");
  if (!bar) return;
  var buttons = bar.querySelectorAll("[data-filter]");
  var cards = document.querySelectorAll("[data-category]");
  var status = document.getElementById("filter-status");
  function apply(filter) {
    var shown = 0;
    cards.forEach(function (card) {
      var show = filter === "all" || card.dataset.category.split(" ").indexOf(filter) > -1;
      card.hidden = !show;
      if (show) shown++;
    });
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.filter === filter)); });
    status.textContent = "Showing " + shown + (shown === 1 ? " tool" : " tools");
  }
  buttons.forEach(function (b) { b.addEventListener("click", function () { apply(b.dataset.filter); }); });
})();
