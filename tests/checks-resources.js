// Interactive checks for resources.html (Student Toolkit). Merged into page-checks.js.
const TOOLS = ["chatgpt-edu", "microsoft-365", "adobe-creative-cloud", "mis-software", "azure-students", "github-student-pack"];
const OFFICIAL = {
  "chatgpt-edu": "https://www.csusm.edu/iits/iitsforyou/generativeai/chatgpt/index.html",
  "microsoft-365": "https://csusm.edu/iits/iitsforyou/office365/download-msoffice/index.html",
  "adobe-creative-cloud": "https://www.csusm.edu/iits/iitsforyou/adobe/download-adobe/index.html",
  "mis-software": "https://www.csusm.edu/iits/iitsforyou/software/index.html",
  "azure-students": "https://azure.microsoft.com/en-us/pricing/offers/ms-azr-0170p/",
  "github-student-pack": "https://education.github.com/pack",
};
const FILTERS = { all: 6, ai: 3, productivity: 1, design: 1, data: 3, cloud: 1 };
const visibleTools = page => page.locator("#tool-grid > [data-category]:not([hidden])").evaluateAll(els => els.map(e => e.querySelector("article").id));

module.exports = [
  ["Toolkit: six tool cards with every required part", async page => {
    const errs = [];
    for (const id of TOOLS) {
      const c = page.locator("#" + id);
      if ((await c.count()) !== 1) { errs.push(id + " missing"); continue; }
      const txt = await c.innerText();
      if (!(await c.locator("i.bi").first().count())) errs.push(id + " no icon");
      if (!(await c.locator("h3").innerText()).trim()) errs.push(id + " no name");
      if (!(await c.locator(".badge-soft").count())) errs.push(id + " no Good-for badges");
      if (!/Provided by CSUSM|Free with student email|Free for verified students/.test(txt)) errs.push(id + " no provider label");
      if (!/Last checked: November 2026/.test(txt)) errs.push(id + " no last-checked date");
      if ((await c.locator(".steps-toggle").count()) !== 1) errs.push(id + " no steps toggle");
      const href = await c.locator("a.btn").getAttribute("href");
      if (href !== OFFICIAL[id]) errs.push(id + " official link is " + href);
    }
    return errs.join("; ");
  }],
  ["Toolkit: AI policy note on the AI tool cards only", async page => {
    const ids = await page.locator(".tool-card", { hasText: "Check each instructor's AI policy" }).evaluateAll(a => a.map(x => x.id));
    return JSON.stringify(ids) === JSON.stringify(["chatgpt-edu", "microsoft-365", "github-student-pack"]) ? "" : "AI note on: " + ids.join(", ");
  }],
  ["Toolkit: filter bar shows and defaults to All (6 tools)", async page => {
    if (!(await page.locator("[data-filter-bar]").isVisible())) return "filter bar not visible";
    const pressed = await page.locator("[data-filter][aria-pressed=true]").allInnerTexts();
    const ok = pressed.join() === "All" && (await visibleTools(page)).length === 6 && /Showing 6 tools/.test(await page.locator("#filter-status").innerText());
    return ok ? "" : "default state wrong: " + pressed;
  }],
  ["Toolkit: each filter shows the right cards, aria-pressed and count", async page => {
    const errs = [];
    for (const [k, n] of Object.entries(FILTERS)) {
      await page.locator(`[data-filter="${k}"]`).click();
      const v = await visibleTools(page);
      const pressed = await page.locator("[data-filter][aria-pressed=true]").evaluateAll(b => b.map(x => x.dataset.filter));
      const msg = await page.locator("#filter-status").innerText();
      if (v.length !== n) errs.push(`${k}: ${v.length} cards, expected ${n}`);
      if (pressed.join() !== k) errs.push(`${k}: pressed is ${pressed}`);
      if (msg !== `Showing ${n} ${n === 1 ? "tool" : "tools"}`) errs.push(`${k}: status "${msg}"`);
    }
    await page.locator("[data-filter=ai]").click(); const a = await visibleTools(page);
    await page.locator("[data-filter=productivity]").click(); const p = await visibleTools(page);
    if (!(a.includes("microsoft-365") && p.includes("microsoft-365"))) errs.push("a card with two categories should appear under both");
    await page.locator("[data-filter=all]").click();
    return errs.join("; ");
  }],
  ["Toolkit: filters work with the keyboard (Enter and Space)", async page => {
    await page.locator("[data-filter=design]").focus(); await page.keyboard.press("Enter");
    if ((await visibleTools(page)).join() !== "adobe-creative-cloud") return "Enter on Design did not filter";
    await page.locator("[data-filter=cloud]").focus(); await page.keyboard.press("Space");
    if ((await visibleTools(page)).join() !== "azure-students") return "Space on Cloud did not filter";
    await page.locator("[data-filter=all]").focus(); await page.keyboard.press("Enter");
    return (await visibleTools(page)).length === 6 ? "" : "All did not restore the cards";
  }],
  ["Toolkit: the status line is a polite live region", async page => {
    const r = await page.locator("#filter-status").evaluate(e => [e.getAttribute("role"), e.getAttribute("aria-live")]);
    return r[0] === "status" && r[1] === "polite" ? "" : "role/aria-live: " + r;
  }],
  ["Toolkit: How-to-get-it opens and closes by keyboard and sets aria-expanded", async page => {
    const b = page.locator("#chatgpt-edu .steps-toggle"), steps = page.locator("#steps-chatgpt-edu");
    if (await steps.isVisible()) return "steps should start closed";
    await b.focus(); await page.keyboard.press("Enter");
    await page.locator("#steps-chatgpt-edu.collapse.show").waitFor(); // wait out the animation: Bootstrap ignores toggles mid-transition
    if ((await b.getAttribute("aria-expanded")) !== "true") return "aria-expanded not true when open";
    if (!/San Marcos/.test(await steps.innerText())) return "steps missing the San Marcos sign-in step";
    await page.keyboard.press("Space");
    await page.locator("#steps-chatgpt-edu.collapse:not(.show):not(.collapsing)").waitFor({ state: "attached" });
    return (await b.getAttribute("aria-expanded")) === "false" ? "" : "aria-expanded not false when closed";
  }],
  ["Toolkit: deep link lands on the card, not under the sticky header", async (page, ctx) => {
    const errs = [];
    for (const id of TOOLS) {
      await page.goto(ctx.url.split("#")[0] + "#" + id);
      await page.waitForTimeout(250);
      const r = await page.evaluate(i => ({ top: document.getElementById(i).getBoundingClientRect().top, head: document.querySelector(".site-header").getBoundingClientRect().bottom }), id);
      if (r.top < r.head - 1) errs.push(`${id} hidden under header (top ${Math.round(r.top)}, header ${Math.round(r.head)})`);
    }
    return errs.join("; ");
  }],
  ["Toolkit: all external links open in a new tab safely", async page => {
    const bad = await page.locator("main a[href^=http]").evaluateAll(a => a.filter(x => x.target !== "_blank" || !/noopener/.test(x.rel) || !/opens in new tab/.test(x.textContent)).map(x => x.href));
    return bad.join(", ");
  }],
  ["Toolkit: More campus resources has 2 grouped cards and 8 links", async page => {
    const cards = await page.locator("[aria-labelledby=campus-heading] .card").count();
    const links = await page.locator("[aria-labelledby=campus-heading] .resource-list a").count();
    return cards === 2 && links === 8 ? "" : `${cards} cards, ${links} links`;
  }],
  ["Toolkit: with JavaScript off, all cards and steps show and the filter bar is hidden", async (page, ctx) => {
    const c = await ctx.browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
    const p = await c.newPage(); await p.goto(ctx.url.split("#")[0]);
    const errs = [];
    if ((await visibleTools(p)).length !== 6) errs.push("not all 6 cards visible");
    if (await p.locator("[data-filter-bar]").isVisible()) errs.push("filter bar visible without JS");
    for (const id of TOOLS) if (!(await p.locator("#steps-" + id).isVisible())) errs.push(id + " steps hidden without JS");
    await c.close();
    return errs.join("; ");
  }],
];
