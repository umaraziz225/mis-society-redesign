/* Automated site tests. Run: npm test --prefix tests
   Dev tooling only; not part of the submitted site. Drives installed Microsoft Edge (no browser download). */
const fs = require("fs");
const path = require("path");
const http = require("http");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright-core");
const AxeBuilder = require("@axe-core/playwright").default;
const { HtmlValidate } = require("html-validate");
const pageChecks = require("./page-checks");

// SITE_ROOT lets the suite test any copy of the site (for example the unzipped submission)
const ROOT = process.env.SITE_ROOT ? path.resolve(process.env.SITE_ROOT) : path.resolve(__dirname, "..");
const SHOTS = path.join(__dirname, "screenshots");
const WIDTHS = [375, 768, 1280];
const SOFT_HOSTS = /linkedin\.com|instagram\.com|facebook\.com|asq\.org|pmi\.org/; // these block bots (403/999): warn, don't fail
const NAV_ORDER = ["index.html", "resources.html", "careers.html", "events.html", "about.html", "join.html"];

// Live mode: BASE_URL=https://user.github.io/repo npm test  tests only that site (no local file:// or server runs).
const LIVE = (process.env.BASE_URL || "").replace(/\/+$/, "");

// Windows and macOS ignore letter case in file names; GitHub Pages (Linux) does not. A link that works here can 404 there,
// so existence is checked segment by segment with the exact case.
function existsExact(abs) {
  const rel = path.relative(ROOT, abs);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return fs.existsSync(abs);
  let cur = ROOT;
  for (const seg of rel.split(path.sep)) { if (!fs.existsSync(cur) || !fs.readdirSync(cur).includes(seg)) return false; cur = path.join(cur, seg); }
  return true;
}

const results = []; // {page, mode, check, status: pass|fail|warn, detail}
const rec = (page, mode, check, status, detail = "") => results.push({ page, mode, check, status, detail });
async function check(page, mode, name, fn) {
  try {
    const r = await fn();
    // fn returns "" / undefined for pass, a string for fail, or {warn: string}
    if (!r) rec(page, mode, name, "pass");
    else if (typeof r === "object" && r.warn) rec(page, mode, name, "warn", r.warn);
    else rec(page, mode, name, "fail", String(r));
  } catch (e) { rec(page, mode, name, "fail", "threw: " + e.message.split("\n")[0]); }
}

// ---------- pages and static server ----------
function listPages() {
  const out = fs.readdirSync(ROOT).filter(f => f.endsWith(".html"));
  (function walk(dir) {
    const d = path.join(ROOT, dir);
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === "node_modules") continue;
      if (e.isDirectory()) walk(path.join(dir, e.name));
      else if (e.name.endsWith(".html")) out.push(path.join(dir, e.name).replace(/\\/g, "/"));
    }
  })("quiz");
  return out;
}
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff", ".ico": "image/x-icon", ".webp": "image/webp" };
function serve() {
  return new Promise(res => {
    const s = http.createServer((req, rsp) => {
      let p = decodeURIComponent(req.url.split("?")[0]);
      if (p.endsWith("/")) p += "index.html";
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !existsExact(f) || fs.statSync(f).isDirectory()) { rsp.writeHead(404); return rsp.end("not found"); }
      rsp.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
      fs.createReadStream(f).pipe(rsp);
    }).listen(0, "127.0.0.1", () => res(s));
  });
}

// ---------- in-page helpers (run inside the browser) ----------
const inPage = {
  headings: () => [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(h => h.checkVisibility()).map(h => ({ level: +h.tagName[1], text: h.textContent.trim(), hasImg: !!h.querySelector("img[alt]:not([alt=''])") })),
  bodyText: () => document.body.innerText,
  imgsNoAlt: () => [...document.querySelectorAll("img")].filter(i => !i.hasAttribute("alt")).map(i => i.getAttribute("src")),
  unlabeled: () => [...document.querySelectorAll("input,select,textarea")].filter(el => {
    if (["hidden", "submit", "button", "reset", "image"].includes(el.type)) return false;
    if (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.closest("label")) return false;
    return !(el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`));
  }).map(el => el.outerHTML.slice(0, 80)),
  refs: () => {
    const out = [];
    document.querySelectorAll("a[href]").forEach(e => out.push(["a", e.getAttribute("href")]));
    document.querySelectorAll("link[href]:not([rel=preconnect]):not([rel=dns-prefetch])").forEach(e => out.push(["link", e.getAttribute("href")]));
    document.querySelectorAll("script[src],img[src],source[src]").forEach(e => out.push([e.tagName.toLowerCase(), e.getAttribute("src")]));
    return out;
  },
  overflow: () => {
    const vw = document.documentElement.clientWidth, bad = [];
    if (document.documentElement.scrollWidth > vw) bad.push(`page scrollWidth ${document.documentElement.scrollWidth} > ${vw}`);
    for (const el of document.body.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || (r.right <= vw + 1 && r.left >= -1)) continue;
      if (el.closest(".visually-hidden,.skip-link")) continue;
      let clipped = false;
      for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
        const o = getComputedStyle(a); if (o.overflowX !== "visible") { clipped = true; break; }
      }
      if (!clipped) bad.push(`${el.tagName.toLowerCase()}${el.className ? "." + String(el.className).split(" ")[0] : ""} [${Math.round(r.left)}..${Math.round(r.right)}]`);
      if (bad.length > 5) break;
    }
    return bad;
  },
  focusInfo: () => {
    const el = document.activeElement, cs = getComputedStyle(el);
    return { tag: el.tagName, id: el.id, cls: String(el.className), href: el.getAttribute("href"), text: (el.textContent || "").trim().slice(0, 30),
      outline: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0,
      // an inset shadow is a decoration (e.g. the active underline), not a focus ring; faint glows (alpha < .5) don't count either
      shadow: cs.boxShadow !== "none" && cs.boxShadow.split("), ").some(s => !s.includes("inset") && (s.startsWith("rgba") ? parseFloat(s.split(",")[3]) >= 0.5 : s.startsWith("rgb"))) };
  },
};

// ---------- per-mode checks ----------
async function runPage(browser, file, mode, base) {
  const url = mode === "file" ? pathToFileURL(path.join(ROOT, file)).href : mode === "live" ? `${LIVE}/${file}` : `${base}/${file}`;
  const P = file, M = mode;
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const consoleErrors = [], failedReqs = [], extFailed = [];
  page.on("console", m => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", e => consoleErrors.push("pageerror: " + e.message));
  page.on("requestfailed", r => { const u = r.url(); (/^https?:\/\/(?!127\.0\.0\.1)/.test(u) ? extFailed : failedReqs).push(`${u} (${r.failure()?.errorText})`); });
  page.on("response", r => { if (r.status() >= 400) { const u = r.url(); (/^https?:\/\/(?!127\.0\.0\.1)/.test(u) ? extFailed : failedReqs).push(`${u} (HTTP ${r.status()})`); } });
  await page.goto(url, { waitUntil: "load" });
  await page.waitForLoadState("networkidle").catch(() => {});

  await check(P, M, "Loads: no console errors / failed requests", () => {
    const local = consoleErrors.filter(c => !/fonts\.(googleapis|gstatic)/.test(c) || !extFailed.length);
    if (consoleErrors.length || failedReqs.length) return [...consoleErrors, ...failedReqs].slice(0, 4).join(" | ");
    if (extFailed.length) return { warn: "external request failed (offline?): " + extFailed[0] };
  });

  await check(P, M, "Headings: one h1, in order, none empty", async () => {
    const hs = await page.evaluate(inPage.headings), errs = [];
    const n1 = hs.filter(h => h.level === 1).length;
    if (n1 !== 1) errs.push(`${n1} h1 elements`);
    hs.forEach((h, i) => {
      if (!h.text && !h.hasImg) errs.push(`empty h${h.level}`);
      if (i && h.level > hs[i - 1].level + 1) errs.push(`h${hs[i - 1].level} -> h${h.level} ("${h.text.slice(0, 25)}")`);
    });
    if (hs.length && hs[0].level !== 1) errs.push(`first heading is h${hs[0].level}`);
    return errs.join("; ");
  });

  await check(P, M, "No placeholder text", async () => {
    const t = await page.evaluate(inPage.bodyText);
    const m = t.match(/lorem|ipsum|coming soon|\bTBD\b|NEEDS CONTENT|\bHeading\b/i);
    return m ? `found "${m[0]}"` : "";
  });
  await check(P, M, "Every img has alt", async () => { const b = await page.evaluate(inPage.imgsNoAlt); return b.length ? "missing alt: " + b.join(", ") : ""; });
  await check(P, M, "Every form field has a label", async () => { const b = await page.evaluate(inPage.unlabeled); return b.length ? "unlabeled: " + b.join(" | ") : ""; });

  await check(P, M, "axe: no serious/critical violations", async () => {
    const r = await new AxeBuilder({ page }).analyze();
    const bad = r.violations.filter(v => ["serious", "critical"].includes(v.impact));
    return bad.map(v => `${v.id} (${v.nodes.length}): ${v.nodes[0].target.join(" ")}`).join("; ");
  });

  await check(P, M, "Internal links and assets resolve", async () => {
    const refs = await page.evaluate(inPage.refs), ids = await page.evaluate(() => new Set([...document.querySelectorAll("[id]")].map(e => e.id)) && [...document.querySelectorAll("[id]")].map(e => e.id));
    const bad = [], warns = [];
    if (mode === "live") { // ask the real server about every internal link, asset and #anchor
      const seen = new Map();
      for (const [, ref] of refs) {
        if (!ref || /^(https?:|mailto:|tel:|data:|javascript:)/i.test(ref)) continue;
        if (ref.startsWith("#")) { if (ref.length > 1 && !ids.includes(ref.slice(1))) bad.push(ref); continue; }
        const u = new URL(ref, url), key = u.origin + u.pathname;
        if (!seen.has(key)) { const r = await fetch(key, { headers: { "User-Agent": "site-test" } }); seen.set(key, { status: r.status, body: /html/.test(r.headers.get("content-type") || "") ? await r.text() : "" }); }
        const hit = seen.get(key);
        if (hit.status !== 200) { bad.push(`${ref} -> HTTP ${hit.status}`); continue; }
        if (u.hash.length > 1) {
          const id = decodeURIComponent(u.hash.slice(1)).split('"').join(""), has = hit.body.includes(`id="${id}"`) || hit.body.includes(`id='${id}'`);
          if (!has) bad.push(`${ref} (no element with that id on the live page)`);
        }
      }
      return bad.length ? [...new Set(bad)].join(", ") : "";
    }
    for (const [, ref] of refs) {
      if (!ref || /^(https?:|mailto:|tel:|data:|javascript:)/i.test(ref)) continue;
      if (ref.startsWith("#")) { if (ref.length > 1 && !ids.includes(ref.slice(1))) bad.push(ref); continue; }
      if (ref.startsWith("/")) { bad.push(ref + " (absolute path; use relative)"); continue; }
      const f = path.resolve(path.dirname(path.join(ROOT, file)), decodeURIComponent(ref.split(/[?#]/)[0]));
      if (!existsExact(f)) { bad.push(ref + (fs.existsSync(f) ? " (the file exists but the letter case differs: GitHub Pages is case-sensitive)" : "")); continue; }
      // page.html#anchor: the id must exist on the destination page (read from disk)
      const frag = ref.includes("#") ? decodeURIComponent(ref.split("#")[1]) : "";
      if (frag && f.endsWith(".html")) {
        const dest = fs.readFileSync(f, "utf8");
        if (!new RegExp(`\\sid=["']${frag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`).test(dest)) {
          // a page still holding only the skeleton is "not built yet": report, don't fail
          (dest.includes("Page content is added in later stages") ? warns : bad).push(`${ref} (${dest.includes("Page content is added in later stages") ? "target page not built yet" : "no element with that id"})`);
        }
      }
    }
    if (bad.length) return [...new Set(bad)].join(", ");
    if (warns.length) return { warn: [...new Set(warns)].join(", ") };
  });

  // Responsive: overflow + screenshots (screenshots only once, from the server run)
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(150);
    await check(P, M, `No horizontal overflow @${w}px`, async () => { const b = await page.evaluate(inPage.overflow); return b.join("; "); });
    if (mode === "http") {
      fs.mkdirSync(SHOTS, { recursive: true });
      await page.screenshot({ path: path.join(SHOTS, `${file.replace(/[\\/]/g, "_").replace(/\.html$/, "")}-${w}.png`), fullPage: true });
    }
  }
  // In-between widths where layouts tend to break: a very small phone, the 992px point where the hamburger becomes a full navbar, and a large desktop
  for (const w of [320, 992, 1024, 1440]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(150);
    await check(P, M, `No horizontal overflow @${w}px`, async () => { const b = await page.evaluate(inPage.overflow); return b.join("; "); });
    if (w >= 992) await check(P, M, `Navbar stays on one row @${w}px`, async () => {
      const h = await page.evaluate(() => document.querySelector(".navbar > .container").getBoundingClientRect().height);
      return h < 90 ? "" : `navbar is ${Math.round(h)}px tall (it wrapped)`;
    });
  }
  await page.setViewportSize({ width: 1280, height: 900 });

  // Hamburger @375
  await page.setViewportSize({ width: 375, height: 800 });
  await page.reload({ waitUntil: "load" });
  await check(P, M, "Mobile menu @375: opens, links usable, Escape/click closes", async () => {
    const tog = page.locator(".navbar-toggler");
    if (!(await tog.isVisible())) return "hamburger button not visible";
    const settled = open => page.waitForFunction(o => { const n = document.querySelector("#mainNav,.navbar-collapse"); return n && !n.classList.contains("collapsing") && n.classList.contains("show") === o; }, open, { timeout: 3000 });
    await tog.click(); await settled(true);
    const links = page.locator(".navbar-collapse a.nav-link"), n = await links.count(), errs = [];
    for (let i = 0; i < n; i++) {
      const l = links.nth(i);
      if (!(await l.isVisible())) { errs.push(`link ${i} hidden`); continue; }
      const b = await l.boundingBox();
      const hit = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return !!e && (e.closest("a.nav-link") != null); }, [b.x + b.width / 2, b.y + b.height / 2]);
      if (!hit) errs.push(`link "${(await l.innerText()).trim()}" covered`);
    }
    // Escape closes the menu from a focused nav link and returns focus to the hamburger
    await links.first().focus();
    await page.keyboard.press("Escape"); await settled(false);
    if (!(await page.evaluate(() => document.activeElement.classList.contains("navbar-toggler")))) errs.push("Escape did not return focus to the hamburger");
    // a second click also closes it
    await tog.click(); await settled(true);
    await tog.click(); await settled(false);
    return errs.join("; ");
  });

  // Keyboard @1280
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.reload({ waitUntil: "load" });
  await check(P, M, "Keyboard: skip link, focus order, visible focus", async () => {
    const errs = [];
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press("Tab");
    let f = await page.evaluate(inPage.focusInfo);
    if (!/skip-link/.test(f.cls)) return `first focus is ${f.tag}.${f.cls} (not the skip link)`;
    if (!f.outline && !f.shadow) errs.push("skip link has no visible focus style");
    await page.keyboard.press("Enter");
    f = await page.evaluate(inPage.focusInfo);
    if (f.id !== "main") errs.push(`skip link did not move focus to main (focus on ${f.tag}#${f.id})`);
    // fresh pass through the nav (goto, not reload: the skip link left #main in the URL)
    await page.goto(url, { waitUntil: "load" });
    await page.keyboard.press("Tab");
    const seen = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      f = await page.evaluate(inPage.focusInfo);
      if (f.href) seen.push(f.href);
      if (!f.outline && !f.shadow) errs.push(`no visible focus on ${f.tag} "${f.text}"`);
      if (seen.length >= 7) break;
    }
    const expected = NAV_ORDER.map(p => (file.startsWith("quiz/") ? "../" : "") + p);
    const brand = seen.slice(0, 1), nav = seen.slice(1, 7);
    if (JSON.stringify(nav) !== JSON.stringify(expected)) errs.push(`nav focus order was ${nav.join(", ")}`);
    return [...new Set(errs)].join("; ");
  });

  await check(P, M, "Nav: correct .active + aria-current", async () => {
    if (file.startsWith("quiz/")) return "";
    const r = await page.evaluate(() => [...document.querySelectorAll(".navbar a.nav-link")].map(a => ({ h: a.getAttribute("href"), act: a.classList.contains("active"), cur: a.getAttribute("aria-current") })));
    const act = r.filter(a => a.act), cur = r.filter(a => a.cur === "page");
    if (act.length !== 1 || cur.length !== 1) return `${act.length} active, ${cur.length} aria-current`;
    return act[0].h === file && cur[0].h === file ? "" : `active is ${act[0].h}, expected ${file}`;
  });
  await ctx.close();

  // JS disabled
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
  const p2 = await ctx2.newPage();
  await p2.goto(url, { waitUntil: "load" });
  await check(P, M, "Works with JavaScript disabled", async () => {
    const txt = (await p2.locator("main").innerText()).trim();
    if (txt.length < 40) return "main has almost no visible text";
    return (await p2.locator("main h1").first().isVisible()) ? "" : "h1 not visible";
  });
  await ctx2.close();

  // Page-specific interactive checks
  if (pageChecks[file]) {
    const ctx3 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p3 = await ctx3.newPage();
    await p3.goto(url, { waitUntil: "load" });
    for (const [name, fn] of pageChecks[file]) await check(P, M, name, () => fn(p3, { url, mode, browser, root: ROOT }));
    await ctx3.close();
  }
}

// ---------- once-per-page checks ----------
async function onceChecks(files) {
  const hv = new HtmlValidate({
    extends: ["html-validate:recommended"],
    // Every recommended rule is on. The only exceptions are three comments in Felix's quiz markup (in quiz/index.html).
  });
  for (const f of files) {
    await check(f, "once", "html-validate passes", async () => {
      const rep = await hv.validateFile(path.join(ROOT, f));
      const msgs = rep.results.flatMap(r => r.messages);
      return msgs.slice(0, 4).map(m => `L${m.line}: ${m.ruleId}: ${m.message}`).join(" | ") + (msgs.length > 4 ? ` (+${msgs.length - 4} more)` : "");
    });
  }
}

async function externalLinks(browser, files) {
  const urls = new Map(); // url -> [pages]
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  for (const f of files) {
    await page.goto(pathToFileURL(path.join(ROOT, f)).href);
    for (const [, r] of await page.evaluate(inPage.refs)) if (/^https?:/i.test(r)) urls.set(r, [...(urls.get(r) || []), f]);
  }
  await ctx.close();
  const hit = async u => {
    for (const method of ["HEAD", "GET"]) {
      try {
        const r = await fetch(u, { method, redirect: "follow", signal: AbortSignal.timeout(15000), headers: { "User-Agent": "Mozilla/5.0 (site link checker)" } });
        if (r.status >= 200 && r.status < 400) return r.status;
        if (method === "GET") return r.status;
      } catch (e) { if (method === "GET") return "error " + e.message.split("\n")[0]; }
    }
  };
  for (const [u, pages] of urls) {
    let s = await hit(u); if (!(s >= 200 && s < 400)) s = await hit(u); // retry once
    const ok = s >= 200 && s < 400;
    const status = ok ? "pass" : SOFT_HOSTS.test(u) ? "warn" : "fail";
    for (const p of [...new Set(pages)]) rec(p, "once", `External link: ${u.replace(/^https?:\/\//, "").slice(0, 50)}`, status, ok ? "" : `status ${s}`);
  }
}

// ---------- main ----------
(async () => {
  const files = listPages();
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    if (LIVE) { for (const f of files) await runPage(browser, f, "live", base); }
    else {
      for (const f of files) for (const m of ["file", "http"]) await runPage(browser, f, m, base);
      await onceChecks(files);
      await externalLinks(browser, files);
    }
  } finally { await browser.close(); server.close(); }

  // summary
  const by = {}; for (const r of results) { const k = r.check.startsWith("External link") ? "External links" : r.check.replace(/ @\d+px/, ""); (by[k] ||= { pass: 0, fail: 0, warn: 0 })[r.status]++; }
  const rows = Object.entries(by).map(([k, v]) => `| ${k} | ${v.pass} | ${v.fail} | ${v.warn} |`);
  const total = { pass: 0, fail: 0, warn: 0 }; results.forEach(r => total[r.status]++);
  const summary = ["| Check | Pass | Fail | Warn |", "|---|---|---|---|", ...rows, `| **Total** | **${total.pass}** | **${total.fail}** | **${total.warn}** |`].join("\n");
  const problems = results.filter(r => r.status !== "pass").map(r => `- [${r.status.toUpperCase()}] ${r.page} (${r.mode}) ${r.check}: ${r.detail}`);
  const report = `# Test report\n\nPages: ${files.join(", ")}\n\n${summary}\n\n## Failures and warnings\n\n${problems.join("\n") || "None."}\n\n## All results\n\n| Page | Mode | Check | Result |\n|---|---|---|---|\n${results.map(r => `| ${r.page} | ${r.mode} | ${r.check} | ${r.status} |`).join("\n")}\n`;
  fs.writeFileSync(path.join(__dirname, LIVE ? "last-report-live.md" : "last-report.md"), report);
  console.log(`\n${summary}\n`);
  if (problems.length) console.log(problems.join("\n") + "\n");
  console.log(LIVE ? `Live site: ${LIVE}
Full report: tests/last-report-live.md` : "Full report: tests/last-report.md   Screenshots: tests/screenshots/");
  process.exit(total.fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
