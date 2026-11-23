// html-validate over every page. Dev tool (not shipped). Run: node scripts/validate-html.js 
// Every recommended rule is on, except two in Felix's quiz markup (see the config below).
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const { HtmlValidate } = require(path.join(ROOT, "tests/node_modules/html-validate"));
const hv = new HtmlValidate({
    extends: ["html-validate:recommended"],
    // Every recommended rule is on. The only exceptions are three comments in Felix's quiz markup (in quiz/index.html).
  });
const pages = fs.readdirSync(ROOT).filter(f => f.endsWith(".html")).concat(["quiz/index.html"]);
(async () => {
  const byRule = {}; let total = 0;
  for (const p of pages) {
    const rep = await hv.validateFile(path.join(ROOT, p));
    for (const m of rep.results.flatMap(r => r.messages)) { total++; (byRule[m.ruleId] ||= []).push(`${p}:${m.line} ${m.message.slice(0, 80)}`); }
  }
  console.log("html-validate, all recommended rules on");
  for (const [r, list] of Object.entries(byRule)) { console.log(`  ${r}: ${list.length}`); list.slice(0, 3).forEach(l => console.log("      " + l)); }
  console.log(`${total} problems across ${pages.length} pages`);
  process.exit(total ? 1 : 0);
})();
