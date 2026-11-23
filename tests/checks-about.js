// Checks for about.html. Merged into page-checks.js.
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const L = "https://www.linkedin.com/in/";

// Exactly the officers on the current club site (checked Nov 22, 2026), in display order.
const TEAM = [
  ["Executive board", [
    ["Ryan Mohammadpour", "President", "ryan-mohammadpour-09b9112ba/"],
    ["Sharif Word", "Vice President", "sharif-word/"],
    ["Zachariah Yamsuan", "Chief Financial Officer", "yamsu001/"],
    ["Umar Aziz", "Chief Outreach Officer", "umaraziz05/"],
    ["Felix Gross", "Chief Information Officer", "felix-r-gross/"],
    ["Taylor Dyal", "Chief Technology Officer", "taylor-dyal/"],
  ]],
  ["Brand & Social", [
    ["Madeline Forsythe", "Brand Manager", "madeline-forsythe-741440155/"],
    ["Zachary Ratzlaff", "Social Media Manager", "zachary-ratzlaff-a068613a9/"],
    ["Darren Allen", "Social Media Manager", "darren-allen-2a1b70365/"],
  ]],
  ["Ambassadors", [
    ["Lesley Marquina", "Ambassador", "lesley-marquina-15523a279/"],
    ["Ronin Ross", "Ambassador", "ronin-ross/"],
    ["Javier Garcia-Ornelas", "Ambassador", "javier-garcia-ornelas-93550223b/"],
  ]],
];
const FOUNDERS = ["Richard Morris", "Chris James", "Aaron Hansen", "Juan Johnson", "Wendy Babu", "Casey Davidson", "Nathaniel Keifer"];
const source = () => fs.readFileSync(path.join(ROOT, "about.html"), "utf8");
const firstRowCount = page => page.evaluate(() => { const t = [...document.querySelectorAll(".officer-card")].map(e => Math.round(e.getBoundingClientRect().top)); return t.filter(x => x === t[0]).length; });

module.exports = [
  ["About: h1 and tagline", async page => {
    const h = (await page.locator("h1").innerText()).trim(), t = (await page.locator(".page-header .lead").innerText()).trim();
    return h === "About the MIS Society" && t === "Connecting, collaborating, and engaging." ? "" : `h1 "${h}", tagline "${t}"`;
  }],
  ["About: mission names students, CoBA faculty and staff, industry, events and seminars, and the IT industry", async page => {
    const t = (await page.locator("[aria-labelledby=mission-heading]").innerText()).replace(/\s+/g, " ");
    const need = ["student to professional", "College of Business Administration faculty and staff", "industry", "events and seminars", "career development", "professional networking", "IT industry", "Management Information Systems"];
    const miss = need.filter(n => !t.includes(n));
    return miss.length ? "mission is missing: " + miss.join(", ") : "";
  }],
  ["About: history timeline is a list with ASI Fall 2008 and all seven founders", async page => {
    const errs = [], items = await page.locator("ol.timeline > li").count();
    if (items < 3) errs.push(items + " timeline entries");
    const t = await page.locator("ol.timeline").evaluate(e => e.textContent); // textContent: the date labels are uppercased by CSS
    if (!/Fall 2008/.test(t) || !/ASI at CSUSM/.test(t)) errs.push("Fall 2008 / ASI missing");
    const got = await page.locator(".founders li").allInnerTexts();
    if (JSON.stringify(got.map(s => s.trim())) !== JSON.stringify(FOUNDERS)) errs.push("founders: " + got.join(", "));
    const dot = await page.locator("ol.timeline > li").first().evaluate(li => getComputedStyle(li, "::before").content);
    if (dot === "none" || dot === "normal") errs.push("timeline dots are not drawn");
    return errs.join("; ");
  }],
  ["About: faculty advisor card (no photo, no contact details) and a comment recording the confirmed answer", async page => {
    const errs = [], card = page.locator(".advisor-card");
    const t = await card.innerText();
    if (!/Fang Fang/.test(t) || !/Faculty Advisor/.test(t)) errs.push("name or title missing");
    if (await card.locator("img").count()) errs.push("advisor card has an image");
    if (/\(\d{3}\)|@csusm\.edu|\d{3}-\d{4}/.test(t)) errs.push("advisor contact details published");
    if (!/Confirmed by the team 11\/22: Dr\. Fang Fang is the faculty advisor/.test(source())) errs.push("no HTML comment recording the confirmed advisor/president answer");
    if (/NEEDS CONFIRMING/.test(source())) errs.push("a stale NEEDS CONFIRMING comment is still in about.html");
    return errs.join("; ");
  }],
  ["About: 12 officers with exactly the right names, roles and LinkedIn links, grouped 6 / 3 / 3", async page => {
    const errs = [];
    const groups = await page.locator(".team-group").allInnerTexts();
    if (JSON.stringify(groups) !== JSON.stringify(TEAM.map(g => g[0]))) errs.push("groups: " + groups.join(" | "));
    const cards = await page.locator(".officer-card").evaluateAll(cs => cs.map(c => ({
      name: c.querySelector("h4").textContent.trim(), role: c.querySelector(".officer-role").textContent.trim(),
      href: c.querySelector("a").getAttribute("href"), label: c.querySelector("a").getAttribute("aria-label"),
      ext: c.querySelector("a").target === "_blank" && /noopener/.test(c.querySelector("a").rel),
      avatar: (() => { const a = c.querySelector(".avatar-initials"); return a && a.getAttribute("aria-hidden") === "true" ? a.textContent.trim() : null; })() })));
    const want = TEAM.flatMap(g => g[1]);
    if (cards.length !== 12) errs.push(cards.length + " officer cards");
    want.forEach(([n, r, u], i) => {
      const c = cards[i] || {};
      if (c.name !== n || c.role !== r) errs.push(`card ${i + 1}: "${c.name}, ${c.role}"`);
      if (c.href !== L + u) errs.push(`${n}: link ${c.href}`);
      if (c.label !== `${n} on LinkedIn`) errs.push(`${n}: aria-label "${c.label}"`);
      if (!c.ext) errs.push(`${n}: link does not open safely in a new tab`);
      const w = n.split(" "), ini = (w[0][0] + w[w.length - 1][0]).toUpperCase();
      if (c.avatar !== ini) errs.push(`${n}: avatar ${c.avatar} (expected ${ini}, aria-hidden)`);
    });
    const per = await page.locator(".team-group").evaluateAll(gs => gs.map(g => g.nextElementSibling.querySelectorAll(".officer-card").length));
    if (per.join() !== "6,3,3") errs.push("cards per group: " + per);
    if (await page.locator("[aria-labelledby=team-heading] img").count()) errs.push("team section has an image (no headshots)");
    return errs.join("; ");
  }],
  ["About: officer grid is 2 per row on phone, 3 on tablet, 4 on desktop", async page => {
    const got = {};
    for (const w of [375, 768, 1280]) { await page.setViewportSize({ width: w, height: 900 }); got[w] = await firstRowCount(page); }
    await page.setViewportSize({ width: 1280, height: 900 });
    return got[375] === 2 && got[768] === 3 && got[1280] === 4 ? "" : "cards in first row: " + JSON.stringify(got);
  }],
  ["About: no officer name is split in the middle of a word on a 375px phone", async page => {
    await page.setViewportSize({ width: 375, height: 900 });
    const broken = await page.locator(".officer-card h4").evaluateAll(hs => {
      const out = [];
      for (const h of hs) {
        const node = h.firstChild; const text = node.textContent; let i = 0;
        for (const w of text.split(/(?<=-)| /)) { // a line break after a hyphen (Garcia-Ornelas) is fine; breaking inside a piece is not
          const r = document.createRange(); r.setStart(node, i); r.setEnd(node, i + w.length); i += w.length + (w.endsWith("-") ? 0 : 1);
          if (r.getClientRects().length > 1) out.push(w); // one word drawn on two lines
        }
      }
      return out;
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    return broken.length ? "words broken across lines: " + broken.join(", ") : "";
  }],
  ["About: no 'Where our alumni work' section; a comment marks it", async page => {
    if (/alumni work/i.test(await page.locator("main").innerText())) return "alumni section is on the page";
    return /WHERE OUR ALUMNI WORK: not built/.test(source()) ? "" : "no marker comment";
  }],
  ["About: closing call-out asks the question and links to join.html#officer-roles", async page => {
    const s = page.locator("[aria-labelledby=next-year-heading]");
    const h = (await s.locator("h2").innerText()).trim(), href = await s.locator("a.btn").getAttribute("href");
    return h === "Want to be on this page next year?" && href === "join.html#officer-roles" ? "" : `"${h}" -> ${href}`;
  }],
  ["About: officer buttons can be reached and activated by keyboard in order", async page => {
    const first = page.locator(".officer-card a").first();
    await first.focus();
    const seen = [];
    for (let i = 0; i < 12; i++) { seen.push(await page.evaluate(() => document.activeElement.getAttribute("aria-label"))); await page.keyboard.press("Tab"); }
    const want = TEAM.flatMap(g => g[1]).map(m => m[0] + " on LinkedIn");
    return JSON.stringify(seen) === JSON.stringify(want) ? "" : "tab order: " + seen.join(" | ");
  }],
];
