// Interactive checks for join.html. Merged into page-checks.js.
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");

const DEMO = "This is a demo form for a class project. Nothing was sent. To join for real, email csusmmissociety@gmail.com.";
const REGISTERED = /you('re| are| have been)? (now )?(registered|signed up|a member|in\b)|registration (complete|successful)|thank you for (joining|registering|signing)|welcome to the (society|club)|successfully|congratulations/i;
const FIELDS = ["firstName", "lastName", "email", "major", "year"];
const fresh = (page, ctx) => page.goto(ctx.url.split("#")[0], { waitUntil: "load" });
const alertText = page => page.locator("#form-result .alert").allInnerTexts();

async function fillValid(page, email = "ada@csusm.edu") {
  await page.fill("#firstName", "Ada"); await page.fill("#lastName", "Lovelace"); await page.fill("#email", email);
  await page.selectOption("#major", "MIS"); await page.selectOption("#year", "Second year");
}
// The text a screen reader would read as a field's description (aria-describedby targets, visible or not)
const description = (page, id) => page.evaluate(i => (document.getElementById(i).getAttribute("aria-describedby") || "").split(" ").filter(Boolean).map(x => (document.getElementById(x) || {}).textContent || "").join(" ").trim(), id);

module.exports = [
  ["Join: the page has id=officer-roles, id=partners and id=faq (the Home and About links)", async page => {
    const miss = ["officer-roles", "partners", "faq"].filter(i => !fs.readFileSync(path.join(ROOT, "join.html"), "utf8").includes(`id="${i}"`));
    return miss.length ? "missing ids: " + miss.join(", ") : "";
  }],
  ["Join: h1 and the 'What you get' checklist (the four club perks, with icons)", async page => {
    if ((await page.locator("h1").innerText()).trim() !== "Join the MIS Society") return "wrong h1";
    const items = await page.locator(".perk-list li").evaluateAll(l => l.map(x => ({ t: x.textContent.replace(/\s+/g, " ").trim(), i: !!x.querySelector("i.bi") })));
    const want = ["Guest speakers", "Internship prep", "Career clarity", "Community"];
    return items.length === 4 && want.every((w, i) => items[i].t.startsWith(w) && items[i].i) ? "" : "perks: " + JSON.stringify(items.map(i => i.t.slice(0, 20)));
  }],
  ["Join: three numbered steps drawn by CSS, and no fees, rules or meeting times stated", async page => {
    const errs = [], n = await page.locator("ol.stepper > li").count();
    if (n !== 3) errs.push(n + " steps");
    // Computed style gives the raw "counter(step)", so check the wiring; the screenshot shows the digits 1, 2, 3
    const wired = await page.locator("ol.stepper > li").evaluateAll(l => l.map(x => getComputedStyle(x).counterIncrement + " | " + getComputedStyle(x, "::before").content));
    if (!wired.every(w => /step 1 | counter(step)/.test(w))) errs.push("step counter not wired: " + wired.join("; "));
    const w = await page.locator("ol.stepper > li").first().evaluate(x => { const b = getComputedStyle(x, "::before"); return [b.width, b.height, b.display]; });
    if (parseFloat(w[0]) < 30 || w[2] === "none") errs.push("step number circle not drawn: " + w);
    const t = await page.locator("main").innerText();
    const m = t.match(/\$\s?\d|\b\d{1,2}(:\d{2})?\s?(a\.?m\.?|p\.?m\.?)\b|every (mon|tues|wednes|thurs|fri)day|\bper semester\b|\bdues\b/i);
    if (m) errs.push(`states a fee or time: "${m[0]}"`);
    return errs.join("; ");
  }],
  ["Join: form has every field with a label, the right types and options, and the right fields required", async page => {
    const errs = [], f = page.locator("[data-demo-form]");
    for (const [id, label] of [["firstName", "First name"], ["lastName", "Last name"], ["email", "CSUSM email"], ["major", "Major"], ["year", "Year"], ["message", "Message"]]) {
      if (!(await page.locator(`label[for="${id}"]`).innerText()).startsWith(label)) errs.push(`label for ${id}`);
    }
    if ((await page.locator("#email").getAttribute("type")) !== "email") errs.push("email is not type=email");
    const pat = await page.locator("#email").getAttribute("pattern");
    if (!pat || !/csusm\\\.edu/.test(pat) || !/cougars/.test(pat)) errs.push("email pattern: " + pat);
    const major = await page.locator("#major option").allInnerTexts(), year = await page.locator("#year option").allInnerTexts();
    if (JSON.stringify(major.slice(1)) !== JSON.stringify(["MIS", "Other business concentration", "Undeclared", "Other"])) errs.push("major options: " + major);
    if (year.length < 5) errs.push("year options: " + year);
    const interests = await page.locator('input[type=checkbox]').evaluateAll(c => c.map(x => document.querySelector(`label[for="${x.id}"]`).textContent.trim()));
    if (JSON.stringify(interests) !== JSON.stringify(["Workshops", "Guest speakers", "Company visits", "Officer roles", "Socials"])) errs.push("interests: " + interests);
    if (!(await page.locator("fieldset legend").innerText()).includes("Interests")) errs.push("checkbox group has no legend");
    const req = await f.locator("[required]").evaluateAll(r => r.map(x => x.id));
    if (req.join() !== FIELDS.join()) errs.push("required: " + req);
    if ((await page.locator("#message").getAttribute("required")) !== null) errs.push("message must be optional");
    if ((await page.locator("textarea").count()) !== 1) errs.push("expected one textarea");
    if (await f.getAttribute("action")) errs.push("form has an action; it must never submit anywhere");
    return errs.join("; ");
  }],
  ["Join: submitting an empty form shows errors, focuses the first one, sends nothing and shows no notice", async (page, ctx) => {
    await fresh(page, ctx);
    const url = page.url(); await page.click("#submit");
    const errs = [];
    if (page.url() !== url) errs.push("the page navigated (a real submit)");
    if ((await alertText(page)).length) errs.push("a notice showed for an invalid form");
    if (!(await page.locator("[data-demo-form]").evaluate(f => f.classList.contains("was-validated")))) errs.push("no validation styling");
    if ((await page.evaluate(() => document.activeElement.id)) !== "firstName") errs.push("focus is not on the first invalid field");
    for (const id of FIELDS) {
      const f = page.locator("#" + id), inv = await f.getAttribute("aria-invalid"), d = await description(page, id), err = page.locator(`#${id}-error`);
      if (inv !== "true") errs.push(`${id}: aria-invalid is ${inv}`);
      if (!(await f.getAttribute("aria-describedby") || "").includes(id + "-error")) errs.push(`${id}: aria-describedby does not point at its error`);
      if (!d.includes((await err.textContent()).trim())) errs.push(`${id}: description "${d}" lacks the error text`);
      if (!(await err.isVisible())) errs.push(`${id}: error text not visible`);
    }
    if (await page.locator("#message[aria-invalid], #int-workshops[aria-invalid]").count()) errs.push("optional fields marked invalid");
    return errs.join("; ");
  }],
  ["Join: fixing a field clears its error state; the others keep theirs", async (page, ctx) => {
    await fresh(page, ctx); await page.click("#submit");
    await page.fill("#firstName", "Ada");
    const errs = [];
    if ((await page.locator("#firstName").getAttribute("aria-invalid")) !== null) errs.push("firstName still aria-invalid after fixing");
    if ((await page.locator("#firstName").getAttribute("aria-describedby")) !== null) errs.push("firstName still points at its error");
    if ((await page.locator("#lastName").getAttribute("aria-invalid")) !== "true") errs.push("lastName lost its error state");
    await page.selectOption("#major", "MIS");
    if ((await page.locator("#major").getAttribute("aria-invalid")) !== null) errs.push("major still aria-invalid after choosing");
    return errs.join("; ");
  }],
  ["Join: email must end in @csusm.edu or @cougars.csusm.edu (case ignored, spaces trimmed)", async (page, ctx) => {
    const errs = [];
    const cases = [["ada@gmail.com", false], ["ada@csusm", false], ["ada@csusm.edu.evil.com", false], ["ada@mail.csusm.edu", false], ["ada", false], ["@csusm.edu", false],
      ["ada@csusm.edu", true], ["ada.lovelace@cougars.csusm.edu", true], ["ADA@CSUSM.EDU", true], ["  ada@csusm.edu  ", true]];
    for (const [email, ok] of cases) {
      await fresh(page, ctx); await fillValid(page, email); await page.click("#submit");
      const shown = (await alertText(page)).length === 1;
      if (shown !== ok) errs.push(`"${email}" should be ${ok ? "accepted" : "rejected"}`);
      if (!ok && (await page.locator("#email").getAttribute("aria-invalid")) !== "true") errs.push(`"${email}": email not marked invalid`);
    }
    return errs.join("; ");
  }],
  ["Join: a valid form shows the demo notice (role=status, exact words), never a success message, and sends nothing", async (page, ctx) => {
    await fresh(page, ctx);
    const requests = []; page.on("request", r => { if (r.method() !== "GET" || /\?/.test(r.url())) requests.push(r.method() + " " + r.url()); });
    const url = page.url(); await fillValid(page); await page.check("#int-speakers"); await page.fill("#message", "Hello");
    await page.click("#submit");
    const errs = [], a = page.locator("#form-result .alert");
    if ((await a.count()) !== 1) return "no notice shown";
    if ((await a.getAttribute("role")) !== "status") errs.push("notice is not role=status");
    if ((await page.locator("#form-result").getAttribute("aria-live")) !== "polite") errs.push("notice container is not a polite live region");
    if (!(await a.isVisible())) errs.push("notice not visible");
    const t = (await a.innerText()).replace(/\s+/g, " ").trim();
    if (t !== DEMO) errs.push(`notice text: "${t}"`);
    if (!(await a.locator('a[href="mailto:csusmmissociety@gmail.com"]').count())) errs.push("no mailto link in the notice");
    if (REGISTERED.test(await page.locator("main").innerText())) errs.push("page says the person is registered");
    if (page.url() !== url) errs.push("the page navigated to " + page.url());
    if (requests.length) errs.push("requests were made: " + requests.join(", "));
    if (await page.locator(".alert-success, .alert-danger").count()) errs.push("a success/danger alert is on the page");
    return errs.join("; ");
  }],
  ["Join: after checking, only invalid fields are styled; valid and optional fields are not painted green", async (page, ctx) => {
    await fresh(page, ctx); await fillValid(page); await page.click("#submit");
    const errs = [];
    const info = await page.evaluate(() => ["firstName", "major", "message", "int-workshops"].map(id => { const e = document.getElementById(id), c = getComputedStyle(e); return { id, border: c.borderTopColor, icon: c.backgroundImage.includes("svg") && id !== "major" && id !== "int-workshops" }; }));
    for (const i of info) {
      if (i.border === "rgb(20, 108, 67)") errs.push(i.id + " has a green success border");
      if (i.icon) errs.push(i.id + " shows a success check icon");
    }
    const green = await page.locator(".form-check-label").evaluateAll(l => l.filter(x => getComputedStyle(x).color === "rgb(20, 108, 67)").length);
    if (green) errs.push(green + " checkbox labels are green");
    return errs.join("; ");
  }],
  ["Join: breaking the form again after a notice removes the notice", async (page, ctx) => {
    await fresh(page, ctx); await fillValid(page); await page.click("#submit");
    if ((await alertText(page)).length !== 1) return "no notice to start with";
    await page.fill("#lastName", ""); await page.click("#submit");
    return (await alertText(page)).length === 0 && (await page.evaluate(() => document.activeElement.id)) === "lastName" ? "" : "notice stayed or focus did not move to lastName";
  }],
  ["Join: the whole form works with the keyboard alone, in a sensible tab order", async (page, ctx) => {
    await fresh(page, ctx);
    await page.locator("#firstName").focus();
    const order = [await page.evaluate(() => document.activeElement.id)];
    const next = async () => { await page.keyboard.press("Tab"); order.push(await page.evaluate(() => document.activeElement.id)); };
    await page.keyboard.type("Ada"); await next();
    await page.keyboard.type("Lovelace"); await next();
    await page.keyboard.type("ada@csusm.edu"); await next();
    await page.keyboard.press("ArrowDown"); await next();   // Major: MIS
    await page.keyboard.press("ArrowDown"); await next();   // Year: First year
    await page.keyboard.press("Space"); await next();       // Workshops
    for (let i = 0; i < 4; i++) await next();               // the other four checkboxes
    await page.keyboard.type("Hi"); await next();           // message -> submit button
    await page.keyboard.press("Enter");
    const want = ["firstName", "lastName", "email", "major", "year", "int-workshops", "int-speakers", "int-visits", "int-officer", "int-socials", "message", "submit"];
    const errs = [];
    if (JSON.stringify(order) !== JSON.stringify(want)) errs.push("tab order: " + order.join(" > "));
    if (!(await page.locator("#int-workshops").isChecked())) errs.push("Space did not tick the checkbox");
    if ((await alertText(page)).length !== 1) errs.push("pressing Enter on the button did not show the notice");
    const ring = await page.locator("#submit").evaluate(b => { const c = getComputedStyle(b); return c.outlineStyle !== "none" && parseFloat(c.outlineWidth) > 0; });
    if (!ring) errs.push("submit button shows no focus ring");
    return errs.join("; ");
  }],
  ["Join: checkboxes and fields show a visible focus ring", async (page, ctx) => {
    await fresh(page, ctx); const errs = [];
    for (const id of ["firstName", "email", "major", "int-workshops", "message"]) {
      await page.locator("#" + id).focus(); await page.waitForTimeout(250); // Bootstrap fades the border in
      const ok = await page.locator("#" + id).evaluate(e => { const c = getComputedStyle(e); return (c.outlineStyle !== "none" && parseFloat(c.outlineWidth) > 0) || (c.boxShadow !== "none" && /rgba?\((?!0, 0, 0, 0)/.test(c.boxShadow)); });
      if (!ok) errs.push(id + " has no visible focus");
    }
    return errs.join("; ");
  }],
  ["Join: FAQ has the five questions; they open and close by keyboard", async (page, ctx) => {
    await fresh(page, ctx);
    const qs = await page.locator("#faq .accordion-button").allInnerTexts();
    const want = ["Do I have to be an MIS major?", "Is there a membership fee?", "When and where do meetings happen?", "How do I become an officer?", "I'm an employer or speaker. How can we work together?"];
    if (JSON.stringify(qs.map(q => q.trim())) !== JSON.stringify(want)) return "questions: " + qs.join(" | ");
    const b = page.locator('[data-bs-target="#faq-fee-body"]'), body = page.locator("#faq-fee-body");
    await b.focus(); await page.keyboard.press("Enter");
    await page.locator("#faq-fee-body.show").waitFor();
    await page.waitForFunction(() => !document.querySelector("#faq-fee-body.collapsing"));
    if ((await b.getAttribute("aria-expanded")) !== "true") return "aria-expanded not true";
    if (!/csusmmissociety@gmail\.com/.test(await body.innerText())) return "fee answer does not point to email";
    await page.keyboard.press("Space");
    await page.locator("#faq-fee-body.collapse:not(.show):not(.collapsing)").waitFor({ state: "attached" });
    return (await b.getAttribute("aria-expanded")) === "false" ? "" : "aria-expanded not false after closing";
  }],
  ["Join: FAQ answers never invent membership rules; they point to email, LinkedIn, or the page", async (page, ctx) => {
    await fresh(page, ctx);
    const t = (await page.locator("#faq").evaluate(e => e.textContent)).replace(/\s+/g, " ");
    return /\$\s?\d|\d\s?(dollars|per (semester|year))|must be a(n)? (mis|business) major|no fee|free to join|\bTBD\b/i.test(t) ? "FAQ states a rule we do not have: " + t.slice(0, 80) : "";
  }],
  ["Join: officer FAQ lists the current board roles and opens when you arrive from #officer-roles", async (page, ctx) => {
    await page.goto(ctx.url.split("#")[0] + "#officer-roles", { waitUntil: "load" });
    await page.locator("#officer-roles-body.show").waitFor();
    await page.waitForFunction(() => !document.querySelector("#officer-roles-body.collapsing"));
    const t = await page.locator("#officer-roles-body").innerText(), errs = [];
    for (const r of ["President", "Vice President", "Chief Financial Officer", "Chief Outreach Officer", "Chief Information Officer", "Chief Technology Officer", "Brand Manager", "Social Media Managers", "Ambassadors"]) if (!t.includes(r)) errs.push("missing " + r);
    if (!/openings/i.test(t) || !(await page.locator('#officer-roles-body a[href="mailto:csusmmissociety@gmail.com"]').count())) errs.push("no way to ask about openings");
    const r = await page.evaluate(() => ({ top: document.getElementById("officer-roles").getBoundingClientRect().top, head: document.querySelector(".site-header").getBoundingClientRect().bottom }));
    if (r.top < r.head - 1) errs.push("question hidden under the sticky header");
    return errs.join("; ");
  }],
  ["Join: the employer FAQ answer links down to #partners", async (page, ctx) => {
    await fresh(page, ctx);
    const href = await page.locator("#faq-partners-body a").getAttribute("href");
    await page.goto(ctx.url.split("#")[0] + "#partners", { waitUntil: "load" });
    await page.waitForTimeout(200);
    const r = await page.evaluate(() => ({ top: document.getElementById("partners").getBoundingClientRect().top, head: document.querySelector(".site-header").getBoundingClientRect().bottom }));
    return href === "#partners" && r.top >= r.head - 40 ? "" : `link ${href}; section top ${Math.round(r.top)} header ${Math.round(r.head)}`;
  }],
  ["Join: partners section has 3 ways to help and a Contact us mailto with the subject 'Partnership inquiry: MIS Society'", async (page, ctx) => {
    await fresh(page, ctx);
    const titles = await page.locator("#partners .card-title").allInnerTexts(), errs = [];
    if (titles.map(t => t.trim()).join("|") !== "Give a guest talk|Host a company visit|Lead a workshop") errs.push("ways: " + titles.join("|"));
    const href = await page.locator("#partners a.btn", { hasText: "Contact us" }).getAttribute("href"), u = new URL(href);
    if (u.protocol !== "mailto:" || u.pathname !== "csusmmissociety@gmail.com") errs.push("mailto address: " + href);
    if (u.searchParams.get("subject") !== "Partnership inquiry: MIS Society") errs.push("subject: " + u.searchParams.get("subject"));
    if (/formal process|application process|we will respond within|guarantee/i.test(await page.locator("#partners").innerText())) errs.push("promises more than contact");
    return errs.join("; ");
  }],
  ["Join: contact card has email, LinkedIn and the CSUSM address", async page => {
    const t = await page.locator("[aria-labelledby=contact-heading] .contact-card").innerText(), errs = [];
    if (!t.includes("csusmmissociety@gmail.com")) errs.push("email");
    if (!/LinkedIn/.test(t)) errs.push("LinkedIn");
    if (!t.includes("333 S. Twin Oaks Valley Rd.") || !t.includes("San Marcos, CA 92096")) errs.push("address");
    return errs.join(", ");
  }],
  ["Join: on a 375px phone the fields fill the card width and the errors stay inside the screen", async (page, ctx) => {
    await fresh(page, ctx); await page.setViewportSize({ width: 375, height: 800 });
    await page.click("#submit");
    const r = await page.evaluate(() => { const c = document.querySelector(".form-card").getBoundingClientRect(); return { card: c.width, fields: ["firstName", "lastName", "email", "major", "year", "message"].map(i => Math.round(document.getElementById(i).getBoundingClientRect().width)), sw: document.documentElement.scrollWidth, vw: document.documentElement.clientWidth }; });
    await page.setViewportSize({ width: 1280, height: 900 });
    const errs = [];
    if (r.fields.some(w => w < 240)) errs.push("a field is narrower than 240px: " + r.fields);
    if (r.sw > r.vw) errs.push("page scrolls sideways");
    return errs.join("; ");
  }],
  ["Join: with JavaScript off the form is hidden, a note gives the club email, and FAQ answers show", async (page, ctx) => {
    const k = await ctx.browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
    const p = await k.newPage(); await p.goto(ctx.url.split("#")[0]);
    const errs = [];
    if (await p.locator("[data-demo-form]").isVisible()) errs.push("form visible although it cannot work");
    if (!(await p.locator(".no-js-note").isVisible()) || !(await p.locator('.no-js-note a[href="mailto:csusmmissociety@gmail.com"]').count())) errs.push("no note with the club email");
    for (const id of ["faq-major-body", "faq-fee-body", "faq-meetings-body", "officer-roles-body", "faq-partners-body"]) if (!(await p.locator("#" + id).isVisible())) errs.push(id + " hidden");
    if (!(await p.locator("#partners").isVisible())) errs.push("partners hidden");
    await k.close();
    return errs.join("; ");
  }],
];
