// Link checker. Dev tool (not shipped with the site); needs only Node 18+. Run: node scripts/check-links.js [--offline]
//  - every internal link, #anchor and asset path in every HTML page must resolve on disk
//  - every url() in the site's CSS must resolve
//  - every external link must answer 200-399 (retried once). Sites that block scripts (LinkedIn, ASQ, PMI) only warn.
// Re-run this the week before Dec 8: the Toolkit and certification links are the likeliest to change.
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const offline = process.argv.includes("--offline");
const SOFT = /linkedin\.com|instagram\.com|facebook\.com|asq\.org|pmi\.org/;

const pages = fs.readdirSync(ROOT).filter(f => f.endsWith(".html")).concat(fs.existsSync(path.join(ROOT, "quiz/index.html")) ? ["quiz/index.html"] : []);
const strip = s => s.replace(/<!--[\s\S]*?-->/g, "");
const broken = [], warnings = [], external = new Map();
let internalCount = 0;

for (const p of pages) {
  const html = strip(fs.readFileSync(path.join(ROOT, p), "utf8"));
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
  for (const m of html.matchAll(/<(a|link|script|img|source)\b[^>]*?\s(href|src)="([^"]*)"/g)) {
    const ref = m[3];
    if (!ref || /^(mailto:|tel:|data:|javascript:)/i.test(ref)) continue;
    if (/^https?:\/\//i.test(ref)) { if (!/rel="(preconnect|dns-prefetch)"/.test(m[0])) (external.get(ref) || external.set(ref, []).get(ref)).push(p); continue; }
    internalCount++;
    if (ref.startsWith("/")) { broken.push(`${p}: absolute path ${ref} (use a relative path)`); continue; }
    const [file, frag] = ref.split("#");
    const target = file ? path.resolve(path.dirname(path.join(ROOT, p)), decodeURIComponent(file.split("?")[0])) : path.join(ROOT, p);
    if (!fs.existsSync(target)) { broken.push(`${p}: ${ref} (file not found)`); continue; }
    if (frag && target.endsWith(".html")) {
      const dest = target === path.join(ROOT, p) ? ids : new Set([...strip(fs.readFileSync(target, "utf8")).matchAll(/\sid="([^"]+)"/g)].map(x => x[1]));
      if (!dest.has(decodeURIComponent(frag))) broken.push(`${p}: ${ref} (no element with id "${frag}")`);
    }
  }
}
// url() inside the site's own CSS and the vendored icon CSS (fonts)
const cssFiles = ["css/style.css", "quiz/css/style.css", "quiz/css/quiz-site.css", "vendor/bootstrap-icons/bootstrap-icons.css"].filter(f => fs.existsSync(path.join(ROOT, f)));
for (const f of cssFiles) for (const m of fs.readFileSync(path.join(ROOT, f), "utf8").matchAll(/url\(\s*["']?([^)"']+)/g)) {
  if (/^(data:|https?:|#)/.test(m[1])) continue; internalCount++;
  if (!fs.existsSync(path.resolve(path.dirname(path.join(ROOT, f)), m[1].split(/[?#]/)[0]))) broken.push(`${f}: url(${m[1]}) not found`);
}

async function status(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const r = await fetch(url, { method, redirect: "follow", signal: AbortSignal.timeout(20000), headers: { "User-Agent": "Mozilla/5.0 (site link checker)" } });
      if (r.status >= 200 && r.status < 400) return r.status;
      if (method === "GET") return r.status;
    } catch (e) { if (method === "GET") return "error: " + e.message.split("\n")[0]; }
  }
}
(async () => {
  let ok = 0;
  if (!offline) for (const [url, from] of external) {
    let s = await status(url); if (!(s >= 200 && s < 400)) s = await status(url); // retry once
    if (s >= 200 && s < 400) { ok++; continue; }
    (SOFT.test(url) ? warnings : broken).push(`${[...new Set(from)].join(", ")}: ${url} -> ${s}${SOFT.test(url) ? " (site blocks scripts; open it by hand once)" : ""}`);
  }
  console.log(`Checked ${pages.length} pages: ${internalCount} internal links, anchors and assets; ${offline ? "external links skipped (--offline)" : external.size + " distinct external links"}.`);
  if (!offline) console.log(`External OK: ${ok}. Blocked-by-site warnings: ${warnings.length}.`);
  warnings.forEach(w => console.log("  WARN   " + w));
  broken.forEach(b => console.log("  BROKEN " + b));
  console.log(broken.length ? `\n${broken.length} broken` : "\nNo broken links.");
  process.exit(broken.length ? 1 : 0);
})();
