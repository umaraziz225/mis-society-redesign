/* MIS Society site scripts. Every page works with JS off; this only adds polish. */

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
