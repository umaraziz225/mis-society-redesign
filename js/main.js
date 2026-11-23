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

// Join: design-only membership form. Checks the fields, then shows a demo notice. Nothing is ever sent.
(function () {
  var form = document.querySelector("[data-demo-form]");
  if (!form) return;
  var result = document.getElementById("form-result");
  var CLUB_EMAIL = "csusmmissociety@gmail.com";

  // Tie each field to its error text only while it is invalid, so screen readers read the error on focus
  function mark(field) {
    var errorId = field.getAttribute("data-error");
    if (!errorId) return;
    var ids = (field.getAttribute("aria-describedby") || "").split(" ").filter(function (id) { return id && id !== errorId; });
    if (field.validity.valid) {
      field.removeAttribute("aria-invalid");
    } else {
      field.setAttribute("aria-invalid", "true");
      ids.push(errorId);
    }
    if (ids.length) field.setAttribute("aria-describedby", ids.join(" ")); else field.removeAttribute("aria-describedby");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();                          // never a real submit
    result.innerHTML = "";
    var email = form.elements.email;
    email.value = email.value.trim().toLowerCase();  // the pattern is lowercase
    form.classList.add("was-validated");
    var fields = form.querySelectorAll("[data-error]");
    fields.forEach(mark);
    var firstBad = form.querySelector(":invalid");
    if (firstBad) { firstBad.focus(); return; }

    var notice = document.createElement("div");
    notice.className = "alert alert-info";
    notice.setAttribute("role", "status");
    notice.appendChild(document.createTextNode("This is a demo form for a class project. Nothing was sent. To join for real, email "));
    var link = document.createElement("a");
    link.href = "mailto:" + CLUB_EMAIL;
    link.textContent = CLUB_EMAIL;
    notice.appendChild(link);
    notice.appendChild(document.createTextNode("."));
    result.appendChild(notice);
  });

  // Once the form has been checked, update each field's error state as the person fixes it
  form.addEventListener("input", function (event) {
    if (form.classList.contains("was-validated") && event.target.hasAttribute("data-error")) mark(event.target);
  });
  form.addEventListener("change", function (event) {
    if (form.classList.contains("was-validated") && event.target.hasAttribute("data-error")) mark(event.target);
  });
})();

// Open the FAQ answer a link points to (for example join.html#officer-roles)
(function () {
  function openFromHash() {
    if (!location.hash || !window.bootstrap) return;
    try {
      var item = document.querySelector(".accordion-item" + location.hash);
      var body = item && item.querySelector(".accordion-collapse");
      if (body) window.bootstrap.Collapse.getOrCreateInstance(body, { toggle: false }).show();
    } catch (e) { /* not a valid selector: ignore */ }
  }
  openFromHash();
  window.addEventListener("hashchange", openFromHash);
})();
