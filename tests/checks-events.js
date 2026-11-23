// Interactive checks for events.html. Merged into page-checks.js.
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");

const EVENTS = [
  ["spring-kickoff", "Spring Kickoff & Info Night", "Social", "Late January 2027"],
  ["resume-linkedin-workshop", "Resume & LinkedIn Workshop", "Workshop", "February 2027"],
  ["speaker-panel", "Industry Speaker Panel: Careers in MIS", "Speaker", "March 2027"],
  ["sql-power-bi-workshop", "SQL & Power BI Hands-On Workshop", "Workshop", "March 2027"],
  ["company-visit", "Company Visit", "Company visit", "April 2027"],
  ["end-of-year-mixer", "End-of-Year Mixer & Officer Elections Info", "Social", "May 2027"],
];
// Run an action and wait for Bootstrap's "shown" / "hidden" event on the modal. Bootstrap ignores Esc while a modal is
// still animating, so waiting for the class alone is not enough.
const waitEvent = async (page, sel, evt, action) => {
  await page.evaluate(([s, e]) => { window.__modalEvt = new Promise(r => document.querySelector(s).addEventListener(e + ".bs.modal", r, { once: true })); }, [sel, evt]);
  await action();
  await page.evaluate(() => window.__modalEvt);
};
const openWith = (page, sel, action) => waitEvent(page, sel, "shown", action);
const closeWith = (page, sel, action) => waitEvent(page, sel, "hidden", action);

// Open a modal from a trigger with the keyboard, then close it with Escape; focus must return to the trigger.
async function modalRoundTrip(page, trigger, modalSel, expectText) {
  await trigger.focus();
  await openWith(page, modalSel, () => page.keyboard.press("Enter"));
  const errs = [];
  const inside = await page.evaluate(s => document.querySelector(s).contains(document.activeElement), modalSel);
  if (!inside) errs.push("focus did not move into the modal");
  if (expectText && !expectText.test(await page.locator(modalSel).innerText())) errs.push("modal text missing " + expectText);
  await closeWith(page, modalSel, () => page.keyboard.press("Escape"));
  const back = await trigger.evaluate(el => el === document.activeElement);
  if (!back) errs.push("focus did not return to the button after Escape");
  return errs;
}

module.exports = [
  ["Events: sample alert is visible, has the exact wording, and sits above the table", async page => {
    const a = page.locator(".sample-alert");
    if (!(await a.isVisible())) return "alert not visible";
    const t = (await a.innerText()).replace(/\s+/g, " ").replace(/ \(opens in new tab\)/, "");
    if (!t.includes("Sample schedule for class demo. Check the club's LinkedIn or email us for real dates.")) return "wording differs: " + t;
    const [ay, ty] = [(await a.boundingBox()).y, (await page.locator(".events-table").boundingBox()).y];
    return ay < ty ? "" : "alert is not above the table";
  }],
  ["Events: table has the right columns and the six sample events (type, month, who it's for)", async page => {
    const heads = await page.locator(".events-table thead th").allInnerTexts();
    if (heads.join("|") !== "Event|Type|Month|Who it's for|Details") return "columns: " + heads.join("|");
    const rows = await page.locator(".events-table tbody tr").evaluateAll(r => r.map(x => [...x.children].map(c => c.textContent.trim())));
    const errs = [];
    if (rows.length !== 6) errs.push(rows.length + " rows");
    EVENTS.forEach(([, name, type, month], i) => {
      const r = rows[i] || [];
      if (r[0] !== name || r[1] !== type || r[2] !== month) errs.push(`row ${i + 1}: ${r.slice(0, 3).join(" / ")}`);
      if (!["Open to all students", "Members"].includes(r[3])) errs.push(`row ${i + 1} who: ${r[3]}`);
    });
    return errs.join("; ");
  }],
  ["Events: the six events match the comment block in index.html (shared with the Home carousel)", async () => {
    const home = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
    const titles = [...home.matchAll(/^\s+\d\. (.+?)\s+\|/gm)].map(m => m[1].replace(/ \(company to be announced by the club\)/, "").replace(/&amp;/g, "&").trim());
    const want = EVENTS.map(e => e[1]);
    return JSON.stringify(titles) === JSON.stringify(want) ? "" : "index.html lists: " + titles.join(" | ");
  }],
  ["Events: each type has its own badge color and every badge passes 4.5:1 contrast", async page => {
    const info = await page.locator(".badge-type").evaluateAll(bs => bs.map(b => {
      const cs = getComputedStyle(b), p = s => s.match(/[\d.]+/g).slice(0, 3).map(Number);
      const lum = c => { const v = c.map(x => x / 255).map(x => x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4)); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
      const [l1, l2] = [lum(p(cs.color)), lum(p(cs.backgroundColor))].sort((a, b) => b - a);
      return { type: b.textContent.trim(), bg: cs.backgroundColor, ratio: (l1 + .05) / (l2 + .05) };
    }));
    const errs = info.filter(i => i.ratio < 4.5).map(i => `${i.type} ${i.ratio.toFixed(1)}:1`);
    const byType = {}; info.forEach(i => (byType[i.type] ||= new Set()).add(i.bg));
    const types = Object.keys(byType), colors = new Set(Object.values(byType).map(s => [...s].join()));
    if (types.sort().join() !== "Company visit,Social,Speaker,Workshop") errs.push("types: " + types.join());
    if (colors.size !== 4) errs.push("badge colors are not distinct per type");
    return errs.join("; ");
  }],
  ["Events: six event cards each have name, type badge, month, who it's for, description and RSVP", async page => {
    const errs = [];
    for (const [id, name, type, month] of EVENTS) {
      const c = page.locator("#" + id);
      if ((await c.count()) !== 1) { errs.push(id + " missing"); continue; }
      const t = await c.innerText();
      if (!t.includes(name) || !t.includes(month) || !/Open to all students|Members/.test(t)) errs.push(id + " missing name/month/who");
      if ((await c.locator(".badge-type").innerText()).trim() !== type) errs.push(id + " wrong type badge");
      if ((await c.locator("p:not(.mb-0)").last().innerText()).trim().length < 40) errs.push(id + " description too short");
      if (!(await c.locator("button", { hasText: "RSVP" }).count())) errs.push(id + " no RSVP button");
    }
    return errs.join("; ");
  }],
  ["Events: every Details button opens its own modal; Esc closes it and focus returns to the button", async page => {
    const errs = [];
    const btns = page.locator(".events-table button");
    if ((await btns.count()) !== 6) return (await btns.count()) + " Details buttons";
    for (let i = 0; i < 6; i++) {
      const sel = "#modal-" + EVENTS[i][0];
      const e = await modalRoundTrip(page, btns.nth(i), sel, new RegExp(EVENTS[i][1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      errs.push(...e.map(x => `${EVENTS[i][0]}: ${x}`));
      if (!/Sample event/.test(await page.locator(sel).evaluate(m => m.textContent))) errs.push(EVENTS[i][0] + ": modal not labeled as a sample");
    }
    return errs.join("; ");
  }],
  ["Events: the Close button and the X also close a modal and return focus", async page => {
    const errs = [], b = page.locator(".events-table button").first(), sel = "#modal-" + EVENTS[0][0];
    for (const how of [`${sel} .btn-close`, `${sel} .modal-footer .btn`]) {
      await b.focus(); await openWith(page, sel, () => page.keyboard.press("Space"));
      await closeWith(page, sel, () => page.locator(how).click());
      if (!(await b.evaluate(el => el === document.activeElement))) errs.push(`focus not returned after ${how.split(" ").pop()}`);
    }
    return errs.join("; ");
  }],
  ["Events: RSVP opens a modal that points to LinkedIn and email and never claims a registration", async page => {
    const errs = [], b = page.locator("#spring-kickoff button", { hasText: "RSVP" });
    errs.push(...(await modalRoundTrip(page, b, "#rsvp-modal", /LinkedIn/)));
    await b.focus(); await openWith(page, "#rsvp-modal", () => page.keyboard.press("Enter"));
    const t = await page.locator("#rsvp-modal").innerText();
    if (!(await page.locator('#rsvp-modal a[href="mailto:csusmmissociety@gmail.com"]').count())) errs.push("no mailto link to the club email");
    if (!/LinkedIn/.test(t) || !/email/i.test(t)) errs.push("does not mention LinkedIn and email");
    if (/you('re| are| have been)? (registered|signed up|confirmed|in)|thank you|successfully|spot (is )?(reserved|saved)|your rsvp (has been|was|is) (received|recorded|confirmed)|see you there/i.test(t)) errs.push("sounds like a registration: " + t.slice(0, 80));
    if (await page.locator("#rsvp-modal form, #rsvp-modal input").count()) errs.push("RSVP modal contains a form field");
    await closeWith(page, "#rsvp-modal", () => page.keyboard.press("Escape"));
    return errs.join("; ");
  }],
  ["Events: every RSVP button opens the shared RSVP modal", async page => {
    const bad = await page.locator(".event-card button").evaluateAll(b => b.filter(x => x.dataset.bsTarget !== "#rsvp-modal").map(x => x.getAttribute("aria-label")));
    const n = await page.locator(".event-card button").count();
    return n === 6 && !bad.length ? "" : `${n} RSVP buttons; wrong target: ${bad.join(", ")}`;
  }],
  ["Events: four 'Types of events' icon cards with general descriptions", async page => {
    const cards = await page.locator("[aria-labelledby=types-heading] .card").evaluateAll(c => c.map(x => ({ h: x.querySelector("h3").textContent.trim(), i: !!x.querySelector(".icon-tile i.bi") })));
    const txt = await page.locator("[aria-labelledby=types-heading]").innerText();
    const ok = cards.map(c => c.h).join("|") === "Guest speakers|Workshops|Company visits|Socials" && cards.every(c => c.i);
    return ok && !/\b(Microsoft|Deloitte|Google|Amazon|Intel|Qualcomm)\b/.test(txt) ? "" : "cards: " + JSON.stringify(cards);
  }],
  ["Events: no past-events gallery yet; a comment marks the spot", async () => {
    const h = fs.readFileSync(path.join(ROOT, "events.html"), "utf8");
    const main = h.slice(h.indexOf("<main"), h.indexOf("</main>"));
    if (/<img\b/.test(main)) return "main contains an image; the gallery must wait for real photos";
    return /PAST EVENTS GALLERY/.test(main) && /NEEDS CONTENT: real photos/.test(main) ? "" : "no marker comment for the gallery";
  }],
  ["Events: the table scrolls inside its wrapper on a 375px phone, not the page", async page => {
    await page.setViewportSize({ width: 375, height: 800 });
    const r = await page.evaluate(() => { const w = document.querySelector(".table-responsive"); return { sw: w.scrollWidth, cw: w.clientWidth, page: document.documentElement.scrollWidth, vw: document.documentElement.clientWidth }; });
    await page.setViewportSize({ width: 1280, height: 900 });
    if (r.sw <= r.cw) return `table does not scroll (scrollWidth ${r.sw}, width ${r.cw})`;
    return r.page <= r.vw ? "" : `page scrolls sideways (${r.page} > ${r.vw})`;
  }],
  ["Events: the whole table fits without scrolling on a 768px tablet and 1280px desktop", async page => {
    const errs = [];
    for (const w of [768, 1280]) {
      await page.setViewportSize({ width: w, height: 900 });
      const r = await page.evaluate(() => { const x = document.querySelector(".table-responsive"); return [x.scrollWidth, x.clientWidth]; });
      if (r[0] > r[1] + 1) errs.push(`${w}px: table is ${r[0]}px wide in a ${r[1]}px box`);
    }
    await page.setViewportSize({ width: 1280, height: 900 });
    return errs.join("; ");
  }],
  ["Events: a modal fits a 375px phone (no sideways scroll, buttons reachable)", async page => {
    await page.setViewportSize({ width: 375, height: 800 });
    const b = page.locator(".events-table button").nth(4), sel = "#modal-company-visit";
    await b.scrollIntoViewIfNeeded(); await openWith(page, sel, () => b.click());
    const r = await page.evaluate(s => { const d = document.querySelector(s + " .modal-dialog").getBoundingClientRect(); return { l: d.left, r: d.right, vw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth }; }, sel);
    const closeVisible = await page.locator(sel + " .btn-close").isVisible();
    await closeWith(page, sel, () => page.keyboard.press("Escape"));
    await page.setViewportSize({ width: 1280, height: 900 });
    if (r.l < 0 || r.r > r.vw) return `dialog [${Math.round(r.l)}..${Math.round(r.r)}] outside ${r.vw}px viewport`;
    if (r.sw > r.vw) return "page scrolls sideways while the modal is open";
    return closeVisible ? "" : "close button not visible on phone";
  }],
  ["Events: with JavaScript off the table, cards and alert show; modal buttons are hidden", async (page, c) => {
    const k = await c.browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
    const p = await k.newPage(); await p.goto(c.url.split("#")[0]);
    const errs = [];
    if (!(await p.locator(".sample-alert").isVisible())) errs.push("alert hidden");
    if (!(await p.locator(".events-table").isVisible())) errs.push("table hidden");
    if ((await p.locator(".event-card:visible").count()) !== 6) errs.push("cards hidden");
    if ((await p.locator(".js-only:visible").count()) !== 0) errs.push("modal buttons visible although they cannot work");
    await k.close();
    return errs.join("; ");
  }],
];
