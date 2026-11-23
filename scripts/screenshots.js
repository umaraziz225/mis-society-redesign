// Screenshots for the presentation. Dev tool (not shipped). Run: node scripts/screenshots.js
// Writes docs/screenshots/<page>-<width>.png (full page) and a few interactive states. Opens the pages from the folder (file://).
const fs = require("fs"), path = require("path");
const { pathToFileURL } = require("url");
const ROOT = path.resolve(__dirname, "..");
const { chromium } = require(path.join(ROOT, "tests/node_modules/playwright-core"));
const OUT = path.join(ROOT, "docs/screenshots");
const pages = [["index", "index.html"], ["toolkit", "resources.html"], ["careers", "careers.html"], ["events", "events.html"], ["about", "about.html"], ["join", "join.html"], ["quiz", "quiz/index.html"]];
const states = [
  ["state-home-carousel", "index.html", 1280, async p => { await p.click(".carousel-control-next"); await p.waitForTimeout(800); await p.locator("#eventsCarousel").scrollIntoViewIfNeeded(); }],
  ["state-toolkit-filter-ai", "resources.html", 1280, async p => { await p.click("[data-filter=ai]"); await p.click("#chatgpt-edu .steps-toggle"); await p.waitForTimeout(600); await p.locator("#tool-grid").scrollIntoViewIfNeeded(); }],
  ["state-events-modal", "events.html", 1280, async p => { await p.locator(".events-table button").nth(2).click(); await p.waitForTimeout(700); }],
  ["state-events-modal", "events.html", 375, async p => { await p.locator("#spring-kickoff button").scrollIntoViewIfNeeded(); await p.locator("#spring-kickoff button").click(); await p.waitForTimeout(700); }],
  ["state-join-errors", "join.html", 375, async p => { await p.click("#submit"); await p.waitForTimeout(400); await p.locator("#form-heading").scrollIntoViewIfNeeded(); }],
  ["state-join-demo-notice", "join.html", 1280, async p => { await p.fill("#firstName", "Ada"); await p.fill("#lastName", "Lovelace"); await p.fill("#email", "ada@csusm.edu"); await p.selectOption("#major", "MIS"); await p.selectOption("#year", "Second year"); await p.click("#submit"); await p.locator("#form-result").scrollIntoViewIfNeeded(); await p.waitForTimeout(300); }],
  ["state-mobile-menu", "index.html", 375, async p => { await p.click(".navbar-toggler"); await p.waitForTimeout(600); }],
  ["state-quiz-question", "quiz/index.html", 375, async p => { await p.click("#btn-start"); for (let i = 0; i < 3; i++) { await p.locator("#step-body .option-card").nth(3).click(); await p.click("#btn-next"); await p.waitForTimeout(350); } }],
  ["state-quiz-results", "quiz/index.html", 1280, async p => {
    await p.click("#btn-start");
    for (let n = 0; n < 60 && await p.locator("#view-quiz").isVisible(); n++) { const o = p.locator("#step-body .option-card:not(.is-disabled)"); if (await o.count()) await o.nth(n % 3 ? 0 : 1).click(); else await p.locator("#step-body label[for$=-y]").first().click(); await p.click("#btn-next"); await p.waitForTimeout(250); }
    await p.waitForTimeout(600);
  }],
];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of fs.readdirSync(OUT)) if (f.endsWith(".png")) fs.unlinkSync(path.join(OUT, f));
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  let n = 0;
  for (const [name, file] of pages) for (const w of [375, 768, 1280]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } }), p = await ctx.newPage();
    await p.goto(pathToFileURL(path.join(ROOT, file)).href, { waitUntil: "load" }); await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(OUT, `${name}-${w}.png`), fullPage: true }); n++; await ctx.close();
  }
  for (const [name, file, w, setup] of states) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } }), p = await ctx.newPage();
    await p.goto(pathToFileURL(path.join(ROOT, file)).href, { waitUntil: "load" }); await setup(p);
    await p.screenshot({ path: path.join(OUT, `${name}-${w}.png`) }); n++; await ctx.close();
  }
  await browser.close();
  const size = fs.readdirSync(OUT).reduce((s, f) => s + fs.statSync(path.join(OUT, f)).size, 0);
  console.log(`${n} screenshots in docs/screenshots/ (${(size / 1048576).toFixed(1)} MB)`);
})();
