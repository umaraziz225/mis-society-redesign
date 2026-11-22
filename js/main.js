/* MIS Society site scripts. Every page works with JS off; this only adds polish. */

// Footer year (static text in the HTML is the fallback)
document.querySelectorAll("[data-year]").forEach(function (el) {
  el.textContent = new Date().getFullYear();
});
