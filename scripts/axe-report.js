// Full axe-core scan at EVERY impact level, on every page and on the interactive states. Dev tool (not shipped).
// Run: node scripts/axe-report.js   (needs the tests/ dependencies: npm install --prefix tests)
const fs = require("fs"), path = require("path"), http = require("http");
const { pathToFileURL } = require("url");
const ROOT = path.resolve(__dirname, "..");
const { chromium } = require(path.join(ROOT, "tests/node_modules/playwright-core"));
const AxeBuilder = require(path.join(ROOT, "tests/node_modules/@axe-core/playwright")).default;

const pages = fs.readdirSync(ROOT).filter(f => f.endsWith(".html")).concat(["quiz/index.html"]);
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".woff2": "font/woff2", ".woff": "font/woff", ".svg": "image/svg+xml" };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]).replace(/\/$/, "/index.html"));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(res);
});

// Interactive states: [label, page, async (page) => put the page in that state]
const states = [
  ["Home: carousel on slide 2", "index.html", async p => { await p.click(".carousel-control-next"); await p.waitForTimeout(800); }],
  ["Toolkit: filtered to AI, one 'How to get it' open", "resources.html", async p => { await p.click("[data-filter=ai]"); await p.click("#chatgpt-edu .steps-toggle"); await p.waitForTimeout(600); }],
  ["Careers: internship tip 3 open", "careers.html", async p => { await p.click('[data-bs-target="#tip3"]'); await p.waitForTimeout(600); }],
  ["Events: Details modal open", "events.html", async p => { await p.click(".events-table button"); await p.waitForTimeout(700); }],
  ["Events: RSVP modal open", "events.html", async p => { await p.click(".event-card button"); await p.waitForTimeout(700); }],
  ["Join: form with errors", "join.html", async p => { await p.click("#submit"); await p.waitForTimeout(300); }],
  ["Join: form with the demo notice", "join.html", async p => { await p.fill("#firstName", "Ada"); await p.fill("#lastName", "Lovelace"); await p.fill("#email", "ada@csusm.edu"); await p.selectOption("#major", "MIS"); await p.selectOption("#year", "Second year"); await p.click("#submit"); await p.waitForTimeout(300); }],
  ["Join: officer FAQ open", "join.html", async p => { await p.click('[data-bs-target="#officer-roles-body"]'); await p.waitForTimeout(600); }],
  ["Quiz: a question screen", "quiz/index.html", async p => { await p.click("#btn-start"); await p.waitForTimeout(300); }],
  ["Quiz: results screen", "quiz/index.html", async p => {
    await p.click("#btn-start");
    for (let n = 0; n < 60 && await p.locator("#view-quiz").isVisible(); n++) {
      const o = p.locator("#step-body .option-card:not(.is-disabled)");
      if (await o.count()) await o.nth(n % 2 ? 0 : 1).click(); else await p.locator("#step-body label[for$=-y]").first().click();
      await p.click("#btn-next"); await p.waitForTimeout(250);
    }
    await p.locator("#cards details.family-card summary").first().click().catch(() => {}); await p.waitForTimeout(300);
  }],
  ["Mobile menu open (375px)", "index.html", async p => { await p.setViewportSize({ width: 375, height: 800 }); await p.click(".navbar-toggler"); await p.waitForTimeout(600); }],
];

(async () => {
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const rows = []; let serious = 0;
  const scan = async (label, page) => {
    const r = await new AxeBuilder({ page }).analyze();
    for (const v of r.violations) { if (["serious", "critical"].includes(v.impact)) serious++; rows.push({ label, id: v.id, impact: v.impact, n: v.nodes.length, help: v.help, sample: v.nodes[0].target.join(" ").slice(0, 70) }); }
    rows.push({ label, id: "(scanned)", impact: "-", n: r.passes.length, help: r.passes.length + " rules passed, " + r.incomplete.length + " need manual review", sample: "" });
  };
  for (const mode of ["http", "file"]) for (const p of pages) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } }), page = await ctx.newPage();
    await page.goto(mode === "http" ? `${base}/${p}` : pathToFileURL(path.join(ROOT, p)).href, { waitUntil: "load" });
    await scan(`${p} [${mode}]`, page); await ctx.close();
  }
  for (const [label, p, setup] of states) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } }), page = await ctx.newPage();
    await page.goto(`${base}/${p}`, { waitUntil: "load" }); await setup(page); await scan(`STATE ${label}`, page); await ctx.close();
  }
  await browser.close(); server.close();
  const bad = rows.filter(r => r.id !== "(scanned)");
  console.log(`Scanned ${pages.length * 2} page loads and ${states.length} interactive states.\n`);
  if (!bad.length) console.log("No axe violations at any impact level.");
  for (const r of bad) console.log(`${r.impact.padEnd(9)} ${r.id.padEnd(26)} x${r.n}  ${r.label}\n          ${r.help}\n          e.g. ${r.sample}`);
  console.log(`\nSerious/critical: ${serious}. Total violations (all impacts): ${bad.length}.`);
  process.exit(serious ? 1 : 0);
})();
