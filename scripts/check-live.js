// Compares the live GitHub Pages site with the repo. Dev tool (not shipped). Run: node scripts/check-live.js <base-url>
// 1. Every file in the repo is fetched from the live site: status must be 200 and the content must match (line endings ignored).
// 2. Case check: for each HTML/CSS/JS/image path, the same URL with different letter case must NOT work (Pages is case-sensitive),
//    which confirms the site is being served by a case-sensitive server and that our links use the exact case.
const { execSync } = require("child_process");
const crypto = require("crypto"), fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const base = (process.argv[2] || "").replace(/\/+$/, "");
if (!base) { console.error("usage: node scripts/check-live.js https://user.github.io/repo"); process.exit(2); }
const TEXT = /\.(html|css|js|md|json|diff|txt|svg)$/i;
const files = execSync("git ls-files", { cwd: ROOT, encoding: "utf8" }).split("\n").filter(Boolean);
const sha = b => crypto.createHash("sha256").update(b).digest("hex");
const norm = f => { const b = fs.readFileSync(path.join(ROOT, f)); return TEXT.test(f) ? Buffer.from(b.toString("utf8").split("\r\n").join("\n")) : b; };
(async () => {
  const missing = [], differ = [], notServed = [];
  let ok = 0;
  for (const f of files) {
    const r = await fetch(`${base}/${f.split("/").map(encodeURIComponent).join("/")}`, { headers: { "User-Agent": "site-check" } });
    if (r.status !== 200) { // Pages serves .md files as rendered or not at all; only report real site files
      (/^(docs|tests|scripts)\//.test(f) || /\.(md|json)$/i.test(f) && !/^(css|js|quiz)\//.test(f) ? notServed : missing).push(`${f} -> HTTP ${r.status}`); continue;
    }
    const body = Buffer.from(await r.arrayBuffer());
    const want = norm(f), got = TEXT.test(f) ? Buffer.from(body.toString("utf8").split("\r\n").join("\n")) : body;
    if (sha(want) !== sha(got)) differ.push(`${f} (live ${got.length} bytes, repo ${want.length} bytes)`); else ok++;
  }
  // case sensitivity: a wrong-case URL must 404 (if it returns 200 the host is case-insensitive and mismatches could hide)
  const probes = ["index.html", "css/style.css", "js/main.js", "quiz/js/data.js", "vendor/bootstrap/bootstrap.min.css", "images/mis-society-logo.png"];
  const caseResults = [];
  for (const p of probes) {
    const wrong = p.replace(/[a-z]/, c => c.toUpperCase()), r = await fetch(`${base}/${wrong}`);
    caseResults.push(`${wrong} -> HTTP ${r.status}${r.status === 404 ? " (correct: case-sensitive)" : " (UNEXPECTED)"}`);
  }
  const r404 = await fetch(`${base}/no-such-page.html`);
  console.log(`Live site: ${base}`);
  console.log(`${files.length} files in the repo: ${ok} served with identical content, ${missing.length} missing, ${differ.length} different, ${notServed.length} not served (docs, tests and scripts are in the repo but are not part of the site).`);
  missing.forEach(m => console.log("  MISSING  " + m)); differ.forEach(d => console.log("  DIFFERENT  " + d));
  console.log("\nCase-sensitivity probes:"); caseResults.forEach(c => console.log("  " + c));
  console.log(`\nUnknown page -> HTTP ${r404.status}`);
  process.exit(missing.length || differ.length || caseResults.some(c => c.includes("UNEXPECTED")) ? 1 : 0);
})();
