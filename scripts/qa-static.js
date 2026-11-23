// Static QA audit of every HTML page (dev tool, not part of the site). Run: node scripts/qa-static.js
// Reads the files on disk: no browser, no network. Prints pass/fail per check and a Bootstrap component inventory.
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");

const pages = fs.readdirSync(ROOT).filter(f => f.endsWith(".html")).concat(fs.existsSync(path.join(ROOT, "quiz/index.html")) ? ["quiz/index.html"] : []);
const src = Object.fromEntries(pages.map(p => [p, fs.readFileSync(path.join(ROOT, p), "utf8").replace(/\r\n/g, "\n")]));
const noComments = s => s.replace(/<!--[\s\S]*?-->/g, "");
const text = s => noComments(s).replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");

const results = [];
const check = (area, name, fn) => { let r; try { r = fn(); } catch (e) { r = "threw: " + e.message; } results.push([area, name, r ? "FAIL" : "pass", r || ""]); };

// 1. Rubric: structure
check("1 Rubric", "4+ linked pages (root pages linked from the navbar)", () => {
  const nav = [...src["index.html"].matchAll(/class="nav-link[^"]*" (?:aria-current="page" )?href="([^"]+)"/g)].map(m => m[1]);
  return nav.length >= 4 && nav.every(h => pages.includes(h)) ? "" : "nav links: " + nav.join(", ");
});
for (const tag of ["header", "nav", "main", "section", "footer"]) {
  check("1 Rubric", `<${tag}> on every page`, () => pages.filter(p => !new RegExp(`<${tag}[ >]`).test(src[p])).map(p => p).join(", ") && "missing in: " + pages.filter(p => !new RegExp(`<${tag}[ >]`).test(src[p])).join(", "));
}
check("1 Rubric", "exactly one <main> per page", () => pages.filter(p => (src[p].match(/<main[ >]/g) || []).length !== 1).join(", "));
check("1 Rubric", "site pages load exactly one custom CSS file (css/style.css) besides Bootstrap, Bootstrap Icons and the font", () => {
  const bad = pages.filter(p => !p.startsWith("quiz/")).filter(p => {
    const hrefs = [...src[p].matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m => m[1]).filter(h => !/^https:\/\/fonts\.googleapis\.com/.test(h) && !/^vendor\//.test(h));
    return hrefs.join() !== "css/style.css";
  });
  return bad.join(", ");
});
check("1 Rubric", "Bootstrap grid used (.container + .row + .col*) on every page", () => pages.filter(p => !/class="[^"]*\brow\b/.test(src[p]) || !/class="[^"]*\bcontainer\b/.test(src[p]) || !/class="[^"]*\bcol(-|")/.test(src[p])).join(", "));
check("1 Rubric", "content types: headings, lists, links, images, tables, forms are all present somewhere", () => {
  const all = Object.values(src).join("\n"), miss = [];
  for (const [n, re] of [["headings", /<h2/], ["lists", /<ul|<ol/], ["links", /<a href/], ["images", /<img /], ["tables", /<table/], ["forms", /<form/]]) if (!re.test(all)) miss.push(n);
  return miss.join(", ");
});

// 2. Placeholder text
check("2 Placeholders", "no lorem / ipsum / coming soon / TBD / 'Heading' in visible text", () => {
  const hits = [];
  for (const p of pages) { const m = text(src[p]).match(/lorem|ipsum|coming soon|\bTBD\b|\bHeading\b/i); if (m) hits.push(`${p}: "${m[0]}"`); }
  return hits.join("; ");
});
check("2 Placeholders", "'NEEDS CONTENT' only inside HTML comments", () => pages.filter(p => /NEEDS CONTENT/i.test(text(src[p]))).join(", "));
check("2 Placeholders", "no empty headings (static HTML; the quiz's JavaScript-filled step title is checked in the browser tests)", () => {
  const out = [];
  for (const p of pages) for (const m of noComments(src[p]).matchAll(/<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/g)) if (!m[3].replace(/<[^>]+>/g, "").trim() && !/id="step-title"/.test(m[2])) out.push(`${p}: <h${m[1]}${m[2].slice(0, 30)}>`);
  return out.join("; ");
});
check("2 Placeholders", "no placeholder words in the quiz's own content file (quiz/js/data.js)", () => /lorem|ipsum|coming soon|\bTBD\b/i.test(fs.readFileSync(path.join(ROOT, "quiz/js/data.js"), "utf8")) ? "found" : "");
check("2 Placeholders", "every NEEDS CONTENT comment is logged in MISSING_CONTENT.md", () => {
  const log = fs.readFileSync(path.join(ROOT, "MISSING_CONTENT.md"), "utf8").toLowerCase();
  const topics = [[/instagram/i, "instagram"], [/photos/i, "photos"], [/alumni|company names/i, "alumni"], [/membership rules|fee/i, "membership"]];
  const miss = [];
  for (const p of pages) for (const m of src[p].matchAll(/NEEDS CONTENT:?\s*([^\n]*)/g)) {
    const topic = topics.find(([re]) => re.test(m[1])); if (!topic) { miss.push(p + ": unrecognised comment: " + m[1].slice(0, 40)); continue; }
    if (!log.includes(topic[1])) miss.push(p + ": " + topic[1] + " is not in MISSING_CONTENT.md");
  }
  return miss.join("; ");
});

// 3. Accessibility (static part; axe runs in the browser tests)
check("3 Accessibility", "exactly one h1 per page in the HTML (the quiz has one per screen, only one is visible)", () => pages.filter(p => !p.startsWith("quiz/") && (noComments(src[p]).match(/<h1[ >]/g) || []).length !== 1).join(", "));
check("3 Accessibility", "headings never skip a level in document order", () => {
  const bad = [];
  for (const p of pages.filter(p => !p.startsWith("quiz/"))) {
    let prev = 0; for (const m of noComments(src[p]).matchAll(/<h([1-6])[ >]/g)) { const l = +m[1]; if (prev && l > prev + 1) bad.push(`${p}: h${prev} -> h${l}`); prev = l; }
  }
  return bad.join("; ");
});
check("3 Accessibility", "every <img> has an alt attribute", () => pages.flatMap(p => [...noComments(src[p]).matchAll(/<img\b[^>]*>/g)].filter(m => !/\balt=/.test(m[0])).map(() => p)).join(", "));
check("3 Accessibility", "every page has lang, viewport, a unique <title> and a meta description", () => {
  const titles = {}, bad = [];
  for (const p of pages) { const s = src[p]; const t = (s.match(/<title>([^<]+)<\/title>/) || [])[1];
    if (!/<html lang="en"/.test(s) || !/name="viewport"/.test(s) || !t || !/name="description" content="[^"]{20,}/.test(s)) bad.push(p);
    (titles[t] ||= []).push(p); }
  const dup = Object.entries(titles).filter(([, v]) => v.length > 1).map(([t]) => t);
  return [...bad.map(b => b + " incomplete head"), ...dup.map(d => "duplicate title: " + d)].join("; ");
});
check("3 Accessibility", "every page has a skip link as the first focusable element and <main id=main>", () => pages.filter(p => !/<body>\s*<a class="skip-link" href="#main">/.test(src[p]) || !/<main id="main"/.test(src[p])).join(", "));
check("3 Accessibility", "external links (target=_blank) all carry rel=noopener", () => pages.flatMap(p => [...src[p].matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].filter(m => !/rel="[^"]*noopener/.test(m[0])).map(() => p)).join(", "));

// 7. Works from the folder
check("7 Folder/file://", "no absolute (/...) paths in href, src or CSS url()", () => {
  const bad = [];
  for (const p of pages) for (const m of src[p].matchAll(/(?:href|src)="(\/[^"]*)"/g)) bad.push(`${p}: ${m[1]}`);
  for (const f of ["css/style.css", "quiz/css/style.css", "quiz/css/quiz-site.css"]) for (const m of fs.readFileSync(path.join(ROOT, f), "utf8").matchAll(/url\(\s*["']?(\/[^)"']*)/g)) bad.push(`${f}: ${m[1]}`);
  return bad.join("; ");
});
check("7 Folder/file://", "no fetch() or XMLHttpRequest in the site's or the quiz's JavaScript (they fail on file://)", () => {
  const bad = ["js/main.js", "quiz/js/app.js", "quiz/js/data.js", "quiz/js/scoring.js"].filter(f => /\bfetch\s*\(|XMLHttpRequest|import\s*\(|type="module"/.test(fs.readFileSync(path.join(ROOT, f), "utf8")));
  return bad.join(", ") + (pages.some(p => /type="module"/.test(src[p])) ? " (module scripts)" : "");
});
check("7 Folder/file://", "no CDN scripts: Bootstrap and icons are loaded from vendor/", () => pages.filter(p => /<script[^>]+src="https?:/.test(src[p]) || /<link[^>]+href="https?:\/\/(cdn|unpkg)/.test(src[p])).join(", "));

// 9. Consistency
const normalize = (html, tag, page) => {
  const m = html.match(new RegExp(`<${tag}[ >][\\s\\S]*?</${tag}>`)); if (!m) return null;
  let s = m[0].replace(/ active" aria-current="(page|true)/g, "").replace(/ aria-current="(page|true)"/g, "").replace(/ active"/g, '"');
  if (page.startsWith("quiz/")) s = s.replace(/(href|src)="\.\.\//g, '$1="');
  return s.replace(/\s+/g, " ");
};
for (const tag of ["header", "footer"]) check("9 Consistency", `the <${tag}> is identical on every page (ignoring the active link)`, () => {
  const base = normalize(src["index.html"], tag, "index.html");
  return pages.filter(p => normalize(src[p], tag, p) !== base).join(", ");
});
check("9 Consistency", "titles follow the pattern '<Name> | MIS Society at CSUSM'", () => pages.filter(p => !/<title>[^<|]+ \| MIS Society at CSUSM<\/title>/.test(src[p])).join(", "));
check("9 Consistency", "every page links the same scripts at the end of <body>", () => pages.filter(p => !/bootstrap\.bundle\.min\.js"><\/script>\s*<script src="(\.\.\/)?js\/main\.js"/.test(src[p])).join(", "));
check("9 Consistency", "the nav marks exactly one current page, and it is the right one", () => pages.filter(p => !p.startsWith("quiz/")).filter(p => {
  const links = [...src[p].matchAll(/<a class="nav-link([^"]*)"([^>]*?)href="([^"]+)"/g)];
  const active = links.filter(x => x[1].includes("active")), current = links.filter(x => /aria-current="page"/.test(x[2]));
  return active.length !== 1 || current.length !== 1 || active[0][3] !== p || current[0][3] !== p;
}).join(", "));

// Print
const area = {};
for (const r of results) (area[r[0]] ||= []).push(r);
let fails = 0;
for (const [a, rs] of Object.entries(area)) { console.log("\n" + a); for (const [, n, s, d] of rs) { if (s === "FAIL") fails++; console.log(`  ${s === "pass" ? "PASS" : "FAIL"}  ${n}${d ? "\n        " + d : ""}`); } }

// Bootstrap component inventory
const comps = {
  "Navbar (collapses to a hamburger)": /class="[^"]*\bnavbar\b/, "Grid (container, row, col)": /class="[^"]*\bcol(-|")/, "Cards": /class="[^"]*\bcard\b/, "Buttons / button group": /class="[^"]*\bbtn\b/,
  "Button group": /class="[^"]*\bbtn-group\b/, "Badges": /class="[^"]*\bbadge\b/, "Carousel": /class="[^"]*\bcarousel\b/, "Accordion": /class="[^"]*\baccordion\b/, "Collapse": /data-bs-toggle="collapse"/,
  "Modal": /class="[^"]*\bmodal\b/, "Alerts": /class="[^"]*\balert\b/, "Tables (table-responsive)": /class="[^"]*\btable\b/, "Forms (form-control, form-select, form-check)": /class="[^"]*\bform-(control|select|check)/,
  "Progress bar": /class="[^"]*\bprogress\b/, "Bootstrap Icons": /class="bi bi-/, "Visually-hidden utility": /visually-hidden/, "List group / details (quiz)": /<details/,
};
console.log("\nBootstrap components in use (pages that use each):");
for (const [name, re] of Object.entries(comps)) { const where = pages.filter(p => re.test(src[p])); console.log(`  ${name.padEnd(48)} ${where.length ? where.join(", ") : "-"}`); }
// Comment inventory
console.log("\nNEEDS CONTENT comments (must each be in MISSING_CONTENT.md):");
for (const p of pages) for (const m of src[p].matchAll(/NEEDS CONTENT:?\s*([^\n]*)/g)) console.log(`  ${p}: ${m[1].trim().slice(0, 100)}`);
console.log(`\n${results.length - fails} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
