// Page-specific interactive checks. Add entries as each stage is built.
// Shape: { "page.html": [ ["check name", async (page, ctx) => <"" to pass, a reason string to fail>], ... ] }
// Still to add: join.html validation + demo alert (Stage 7), about.html checks (Stage 6).

const activeSlide = page => page.evaluate(() => [...document.querySelectorAll("#eventsCarousel .carousel-item")].findIndex(i => i.classList.contains("active")));
const settle = page => page.waitForFunction(() => !document.querySelector("#eventsCarousel .carousel-item-next, #eventsCarousel .carousel-item-prev"));

module.exports = {
  "resources.html": require("./checks-resources"),
  ...require("./checks-careers"),
  "events.html": require("./checks-events"),
  "index.html": [
    ["Home: hero buttons and teaser links go to the right pages", async page => {
      const want = { "Join the Society": "join.html", "Explore free tools": "resources.html" }, errs = [];
      for (const [t, h] of Object.entries(want)) {
        const got = await page.locator(".hero a.btn", { hasText: t }).getAttribute("href");
        if (got !== h) errs.push(`${t} -> ${got}`);
      }
      const links = await page.locator("a", { hasText: "See how to get it" }).evaluateAll(a => a.map(x => x.getAttribute("href")));
      const ids = ["chatgpt-edu", "microsoft-365", "adobe-creative-cloud", "azure-students"].map(i => "resources.html#" + i);
      if (JSON.stringify(links) !== JSON.stringify(ids)) errs.push("teaser links: " + links.join(", "));
      return errs.join("; ");
    }],
    ["Home: 'Sample schedule' badge is visible", async page => (await page.locator("#upcoming-events .badge", { hasText: "Sample schedule" }).isVisible()) ? "" : "badge not visible"],
    ["Home: carousel has no autoplay", async page => {
      const el = page.locator("#eventsCarousel");
      if ((await el.getAttribute("data-bs-ride")) !== null) return "data-bs-ride is set";
      if ((await el.getAttribute("data-bs-interval")) !== "false") return "interval is not false";
      await page.waitForTimeout(5600); // longer than Bootstrap's default 5s interval
      return (await activeSlide(page)) === 0 ? "" : "slide changed by itself";
    }],
    ["Home: carousel next/prev buttons and indicators work", async page => {
      await page.locator(".carousel-control-next").click(); await settle(page);
      if ((await activeSlide(page)) !== 1) return "next did not go to slide 2";
      await page.locator(".carousel-control-prev").click(); await settle(page);
      if ((await activeSlide(page)) !== 0) return "prev did not return to slide 1";
      await page.locator('.carousel-indicators [data-bs-slide-to="2"]').click(); await settle(page);
      if ((await activeSlide(page)) !== 2) return "indicator 3 did not show slide 3";
      await page.locator(".carousel-control-next").click(); await settle(page);
      return (await activeSlide(page)) === 0 ? "" : "next did not wrap to slide 1";
    }],
    ["Home: carousel works with the keyboard", async page => {
      await page.locator(".carousel-control-next").focus();
      await page.keyboard.press("Enter"); await settle(page);
      if ((await activeSlide(page)) !== 1) return "Enter on Next did not advance";
      await page.keyboard.press("Space"); await settle(page);
      if ((await activeSlide(page)) !== 2) return "Space on Next did not advance";
      await page.locator(".carousel-control-prev").focus();
      await page.keyboard.press("Enter"); await settle(page);
      return (await activeSlide(page)) === 1 ? "" : "Enter on Previous did not go back";
    }],
    ["Home: carousel controls have accessible names", async page => {
      const names = await page.locator(".carousel-control-prev, .carousel-control-next, .carousel-indicators button").evaluateAll(b => b.map(x => (x.getAttribute("aria-label") || x.textContent).trim()));
      return names.length === 5 && names.every(Boolean) ? "" : "unnamed control(s): " + JSON.stringify(names);
    }],
    ["Home: section order and tile/card counts", async page => {
      const heads = await page.locator("main h2").allInnerTexts();
      const want = ["What is MIS?", "What your CSUSM email unlocks", "Upcoming events", "Why join", "Not sure which MIS career fits you?", "Ready to get involved?"];
      const ok = want.every((w, i) => (heads[i] || "").startsWith(w));
      const tiles = await page.locator(".mis-area").count(), teasers = await page.locator('[aria-labelledby="email-unlocks"] .card').count(), perks = await page.locator('[aria-labelledby="why-join"] .card').count();
      return ok && tiles === 7 && teasers === 4 && perks === 4 ? "" : `headings ${JSON.stringify(heads)}, tiles ${tiles}, teasers ${teasers}, perks ${perks}`;
    }],
    ["Home: MIS-area grid is 2 columns on phone, 4 on desktop", async (page) => {
      const cols = () => page.evaluate(() => { const t = [...document.querySelectorAll(".mis-area")].map(e => Math.round(e.getBoundingClientRect().top)); return t.filter(x => x === t[0]).length; }); // tiles in the first row
      const d = await cols(); await page.setViewportSize({ width: 375, height: 800 }); const m = await cols();
      await page.setViewportSize({ width: 1280, height: 900 });
      return d === 4 && m === 2 ? "" : `desktop ${d} columns, phone ${m} columns`;
    }],
  ],
};
