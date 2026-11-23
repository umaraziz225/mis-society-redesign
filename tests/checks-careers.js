// Interactive checks for careers.html and quiz/index.html. Merged into page-checks.js.
const fs = require("fs"), path = require("path"), vm = require("vm"), crypto = require("crypto");
const ROOT = path.resolve(__dirname, "..");

const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "quiz/js/data.js"), "utf8") + ";this.FAMILIES=FAMILIES;this.RATING_ITEMS=RATING_ITEMS;", ctx);
const FAMILIES = ctx.FAMILIES;

// Felix's logic and content must stay the same as the original repo (recorded Nov 22, 2026). Hashes ignore line endings (CRLF vs LF) so any checkout matches.
const LOCKED = {
  "quiz/js/data.js": "5d166f4662e6829094de41d7e3ab98ec72133b5fdab8ae9ea5a4656b4c0171ed",
  "quiz/js/scoring.js": "3aa53cf77db592bdcc84069f2465aa971b7c2d202f025debb26a8da56cff4ea6",
  "quiz/js/app.js": "8e3c4b09006c86c3a54bafc324b8f2871d6fc573115ee144d17f9cd266bd4c8d",
  "quiz/css/style.css": "303701a9a4b6637ca8ce16c07194f08176745a2adbb703ae07a03a91577100f0",
};
const LIVE = "https://felixdoesmis-csusm.github.io/mis-career-quiz/";

// Take the quiz from its start screen to the results screen. Returns "" on success, or a reason.
async function takeQuiz(page) {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  if (!(await page.locator("#btn-start").isVisible())) await page.reload({ waitUntil: "load" }); // checks share a page: start from a clean start screen
  await page.locator("#btn-start").click();
  let steps = 0;
  while (await page.locator("#view-quiz").isVisible()) {
    if (++steps > 80) return "quiz did not finish after 80 steps";
    const pct = await page.locator("#progress-pct").innerText();
    const opts = page.locator("#step-body .option-card:not(.is-disabled)");
    const n = await opts.count();
    if (n) await opts.nth(steps % 2 ? n - 1 : 0).click(); // vary answers: first, last, first, ...
    else {
      // Part D (optional): answer the first row "Yes" so the experience path runs too
      await page.locator("#step-body label[for$='-y']").first().click();
    }
    await page.waitForFunction(() => !document.getElementById("btn-next").disabled);
    await page.locator("#btn-next").click();
    // the progress text changes on every step (the most/least steps of one scenario share a title)
    await page.waitForFunction(p => document.getElementById("view-results").hidden === false || document.getElementById("progress-pct").textContent !== p, pct, { timeout: 5000 });
  }
  if (!(await page.locator("#view-results").isVisible())) return "results view not shown";
  const cards = await page.locator("#cards .family-card").count();
  if (cards !== 3) return `expected 3 top matches, got ${cards}`;
  const band = await page.locator("#cards .band").first().innerText();
  if (!/match/i.test(band)) return "top match has no match level: " + band;
  const bh = (await page.locator("#cards .band").first().boundingBox()).height;
  if (bh > 60) return `match badge is ${Math.round(bh)}px tall (a site class is probably colliding with the quiz's .band)`;
  if (!(await page.locator("#results-title").isVisible())) return "results heading not visible";
  const all = await page.locator("#all-families .path-chip").count(); // chips grouped by match level
  if (all < 12) return `"All 12 families" list has ${all} entries`;
  if (errors.length) return "errors during the quiz: " + errors.slice(0, 2).join(" | ");
  return "";
}

module.exports = {
  "careers.html": [
    ["Careers: quiz call-out (id=quiz) with button, live-version link and credit", async page => {
      const sec = page.locator("section#quiz"), errs = [];
      if ((await sec.count()) !== 1) return "no section with id=quiz";
      if ((await sec.locator("a.btn", { hasText: "Take the Career Fit Quiz" }).getAttribute("href")) !== "quiz/index.html") errs.push("button does not go to quiz/index.html");
      if (!(await sec.locator(`a[href="${LIVE}"]`).count())) errs.push("live-version link missing");
      if (!/Career Fit Quiz built by Felix Gross/.test(await sec.innerText())) errs.push("credit text missing");
      return errs.join("; ");
    }],
    ["Careers: 12 family cards match quiz/js/data.js (name, short description, entry titles)", async page => {
      const got = await page.locator(".family-card").evaluateAll(cs => cs.map(c => ({
        id: c.dataset.family, name: c.querySelector("h3").textContent.trim(), tagline: c.querySelector(".family-tagline").textContent.trim(),
        desc: c.querySelector(".family-tagline + p").textContent.trim(), titles: [...c.querySelectorAll(".entry-titles li")].map(l => l.textContent.trim()) })));
      const errs = [];
      if (got.length !== FAMILIES.length) errs.push(`${got.length} cards, data.js has ${FAMILIES.length}`);
      FAMILIES.forEach((f, i) => {
        const g = got[i] || {};
        if (g.id !== f.id || g.name !== f.name) errs.push(`card ${i + 1} name: "${g.name}" vs "${f.name}"`);
        if (g.tagline !== f.tagline) errs.push(`${f.id} tagline differs`);
        if (g.desc !== f.description) errs.push(`${f.id} description differs`);
        if (JSON.stringify(g.titles) !== JSON.stringify(f.entryTitles)) errs.push(`${f.id} entry titles differ`);
      });
      return errs.join("; ");
    }],
    ["Careers: no pay or growth numbers on the page", async page => {
      const txt = await page.locator("main").innerText(), bad = [];
      FAMILIES.forEach(f => { for (const v of [f.outlook.pay, f.outlook.growth]) if (txt.includes(v)) bad.push(v); });
      return bad.length ? "found: " + bad.join(", ") : "";
    }],
    ["Careers: certifications table is responsive and uses only data.js certs", async page => {
      const errs = [];
      if (!(await page.locator(".table-responsive > table.table").count())) errs.push("table is not inside .table-responsive");
      const cells = await page.locator(".cert-list li").evaluateAll(l => l.map(x => x.textContent)); // textContent: the hidden "(opens in new tab)" span adds line breaks to innerText
      const want = FAMILIES.flatMap(f => [...f.certs.now, ...f.certs.later]);
      const norm = s => s.replace(/\s*\(opens in new tab\)/g, "").replace(/\s+/g, " ").trim();
      const have = cells.map(norm);
      if (have.length !== want.length) errs.push(`${have.length} certs on page, ${want.length} in data.js`);
      want.forEach(w => { if (!have.includes(norm(w))) errs.push("missing from page: " + w.slice(0, 50)); });
      const heads = await page.locator("table thead th[scope=col]").count(), rowHeads = await page.locator("table tbody th[scope=row]").count();
      if (heads !== 3 || rowHeads !== 12) errs.push(`table headers: ${heads} column, ${rowHeads} row`);
      return errs.join("; ");
    }],
    ["Careers: every certification link goes to an official vendor domain, in a new tab", async page => {
      const ok = /^https:\/\/(www\.asq\.org|iassc\.org|www\.iiba\.org|learn\.microsoft\.com|www\.comptia\.org|iapp\.org|www\.isaca\.org|www\.pmi\.org)\//;
      const links = await page.locator(".cert-list a").evaluateAll(a => a.map(x => ({ h: x.href, t: x.target, r: x.rel })));
      const bad = links.filter(l => !ok.test(l.h) || l.t !== "_blank" || !/noopener/.test(l.r)).map(l => l.h);
      return links.length >= 20 && !bad.length ? "" : `${links.length} links; bad: ${bad.join(", ")}`;
    }],
    ["Careers: internship accordion has 5 tips and opens/closes by keyboard", async page => {
      const items = await page.locator("#internshipTips .accordion-item").count();
      if (items !== 5) return `${items} tips, expected 4 to 5 (5)`;
      const b2 = page.locator('[data-bs-target="#tip2"]');
      await b2.focus(); await page.keyboard.press("Enter");
      await page.locator("#tip2.show").waitFor();
      await page.locator("#tip1.collapse:not(.show):not(.collapsing)").waitFor({ state: "attached" });
      if ((await b2.getAttribute("aria-expanded")) !== "true") return "aria-expanded not true on tip 2";
      if ((await page.locator('[data-bs-target="#tip1"]').getAttribute("aria-expanded")) !== "false") return "tip 1 should close when tip 2 opens";
      await page.keyboard.press("Space");
      await page.locator("#tip2.collapse:not(.show):not(.collapsing)").waitFor({ state: "attached" });
      return (await b2.getAttribute("aria-expanded")) === "false" ? "" : "aria-expanded not false after closing";
    }],
    ["Careers: internship tips link to the Career Center and the Join page, and cite no statistics", async page => {
      const hrefs = await page.locator("#internshipTips a").evaluateAll(a => a.map(x => x.getAttribute("href")));
      const txt = await page.locator("#internshipTips").evaluate(e => e.textContent);
      const errs = [];
      if (!hrefs.includes("https://www.csusm.edu/careers/index.html")) errs.push("no Career Center link");
      if (!hrefs.includes("join.html")) errs.push("no Join link");
      if (/\d+\s?%|\$\d/.test(txt)) errs.push("contains a statistic");
      return errs.join("; ");
    }],
    ["Careers: with JavaScript off the quiz link, cards, table and all tips show", async (page, c) => {
      const k = await c.browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
      const p = await k.newPage(); await p.goto(c.url.split("#")[0]);
      const errs = [];
      if (!(await p.locator('a[href="quiz/index.html"]').first().isVisible())) errs.push("quiz button hidden");
      if (!(await p.locator(".family-card").first().isVisible())) errs.push("cards hidden");
      for (let i = 1; i <= 5; i++) if (!(await p.locator("#tip" + i).isVisible())) errs.push(`tip ${i} hidden`);
      await k.close();
      return errs.join("; ");
    }],
    ["Careers -> Quiz: take the quiz end to end from the Take-the-quiz button and see results", async (page, c) => {
      await page.locator("section#quiz a.btn").click();
      await page.waitForURL(/quiz\/index\.html/);
      return takeQuiz(page);
    }],
  ],

  "quiz/index.html": [
    ["Quiz: Felix's logic and content files are unchanged (SHA-256)", async () => {
      const lf = f => fs.readFileSync(path.join(ROOT, f), "utf8").split("\r\n").join("\n"); // ignore CRLF vs LF
      const bad = Object.entries(LOCKED).filter(([f, h]) => crypto.createHash("sha256").update(lf(f)).digest("hex") !== h).map(([f]) => f);
      return bad.length ? "changed: " + bad.join(", ") : "";
    }],
    ["Quiz: credit to Felix Gross and the live-version link are visible", async page => {
      const t = await page.locator(".quiz-credit").innerText(), errs = [];
      if (!/Career Fit Quiz built by Felix Gross/.test(t)) errs.push("credit text missing");
      if (!(await page.locator(`.quiz-credit a[href="${LIVE}"]`).isVisible())) errs.push("live link not visible");
      if (!(await page.locator("#version").innerText()).trim() || !(await page.locator("#checked").innerText()).trim()) errs.push("version/checked date not filled in");
      return errs.join("; ");
    }],
    ["Quiz: start screen shows the 12 family chips and site navigation points to ../", async page => {
      const chips = await page.locator(".path-chip").count();
      const hrefs = await page.locator(".navbar a.nav-link").evaluateAll(a => a.map(x => x.getAttribute("href")));
      const want = ["../index.html", "../resources.html", "../careers.html", "../events.html", "../about.html", "../join.html"];
      return chips === 12 && JSON.stringify(hrefs) === JSON.stringify(want) ? "" : `${chips} chips; nav ${hrefs}`;
    }],
    ["Quiz: take the quiz end to end from quiz/index.html and see results", page => takeQuiz(page)],
    ["Quiz: results show the BLS source, and Retake restarts at question 1", async page => {
      await takeQuiz(page);
      const txt = await page.locator("#view-results").innerText();
      if (!/BLS|Bureau of Labor Statistics/.test(txt)) return "no BLS source on results";
      await page.locator("#btn-retake").click();
      await page.locator("#view-quiz").waitFor({ state: "visible" });
      return /Part A.*1 of 20/.test(await page.locator("#part-label").innerText()) ? "" : "Retake did not restart at question 1 of Part A";
    }],
  ],
};
