# Missing Content and Open Questions

Facts we still need, sorted by priority. Never invent them. Where a fact would go on a page, there is an HTML comment `<!-- NEEDS CONTENT: ... -->` instead of visible text. Last reviewed November 22, 2026.

**Due dates:** instructor meeting Tue Nov 24; presentations and final submission Tue Dec 8 (late work loses 20% per day).

## Priority 1: Decide or do before Dec 8

These change what the site says or what you submit.

- [ ] **Instructor answers (ask on Nov 24)** (quiz, Toolkit filters, Join form, hosting, log format):
  - Is JavaScript beyond Bootstrap allowed? If not, swap the quiz for a clearly labeled link to Felix's live quiz, turn the Toolkit filters into static grouped sections, and make the Join form a plain HTML form with a visible "demo only" note. The quiz, the filters, the Join form, the modals and the carousel all use JavaScript.
  - Is GitHub Pages hosting acceptable alongside the folder submission?
  - What format should the Vibe Coding Log take (table or written paragraphs, screenshots of prompts)? It is currently a table.
  - Confirm the final submission deadline is Dec 8.
- [ ] **Fill in the team columns of `VIBE_CODING_LOG.md`**: every entry still needs "What we accepted / changed / rejected", "What we learned" and "Team member" in the team's own words.
- [ ] **Fill in each member's contributions** (`docs/project-summary-outline.md`) and the five speaking slots (`docs/presentation-outline.md`).
- [ ] **Open the links a script cannot check, once, by hand:** the 12 officer LinkedIn links and the club LinkedIn link, and the certification links for ASQ (Yellow Belt, Green Belt) and PMI (CAPM, CPMAI, PMP). ASQ Green Belt points to ASQ's Six Sigma catalog (no direct page was found), PMI-CPMAI points to PMI's CPMAI FAQ page, and the IASSC link goes to its home page.
- [ ] **Re-check every Toolkit and campus link the week before Dec 8** (`node scripts/check-links.js`, then read the pages). ChatGPT Edu usage limits are changing, and custom GPTs are retired Feb 11, 2027 per the CSUSM page.
- [ ] **Officer permissions** (about.html): each of the 12 officers should confirm they are happy to be listed with a LinkedIn link (CLAUDE.md section 11). Dr. Fang's contact details and bio are deliberately not copied; add them only with her permission.
- [ ] **Spelling of Zech's name** (about.html, README): "Zachariah Yamsuan" (current club site, used on the site) or "Zechariah" (project brief). Use whichever Zech confirms.
- [ ] **Felix's OK** (careers.html, quiz): Felix should confirm he is happy with the credit wording ("Career Fit Quiz built by Felix Gross"), with this site hosting a restyled copy of his quiz, and with the Home page saying the quiz takes "about 7 minutes" (from his README).

## Priority 2: Real club facts that would replace placeholders

The site is honest without them, but it is stronger with them. Each answer should come from the club.

- [ ] **Membership rules** (join.html FAQ and steps): is there a fee, who can join (must you be an MIS major?), and when and where are meetings? The FAQ currently points to email or LinkedIn. HTML comment `NEEDS CONTENT` marks the spot.
- [ ] **Real Instagram URL** (footer on every page): the current club site's Instagram icon links to LinkedIn, so no Instagram link is shown. An HTML comment marks the spot in every footer.
- [ ] **Real Spring 2027 events** (events.html, Home carousel): the six events, their months, the "Open to all students" / "Members" labels and the descriptions are a labeled sample. Replace the rows, cards and modals, and remove the "Sample" alert and badges, when the club confirms its calendar. Real past speakers or company visits with dates can go in a "past events" section.
- [ ] **How RSVPs really work** (events.html): the RSVP pop-up says the club posts RSVP links on LinkedIn and by email. That wording comes from the project brief; confirm it.
- [ ] **How officer openings are announced** (join.html FAQ): the answer says roles open periodically and to email about openings. Confirm how and when this really happens and whether the board list is complete.
- [ ] **Employer and speaker process** (join.html): the page only promises that people can email the club. Add the real process if there is one.
- [ ] **ASI wording** (about.html): the page says "ASI at CSUSM" as the current site does. Decide whether to spell it out (Associated Students, Inc.).

## Priority 3: Nice to have, or wording to review

- [ ] **Event photos, with permission** (events.html): the past-events gallery is not built. It needs real photos with permission from the people in them. An HTML comment marks the spot.
- [ ] **Where our alumni work** (about.html): not built. The current club site shows unnamed company logos only. Needs company names the club can confirm.
- [ ] **A white or blue logo version** (every footer): the logo is a black hexagon with a purple-to-cyan border. It sits on white in the navbar and on navy in the footer. Ask the club whether another version exists.
- [ ] **Where real form submissions should go** (join.html): the form is design only. If the club adopts the site, decide where submissions go (a form service or an email).
- [ ] **Interest-form fields** (join.html): the Year choices (First year to Graduate student) and the five Interests are the team's picks. Confirm they match what the club wants to ask.
- [ ] **Wording that is the team's own** (Toolkit, Events): the "Good for" badges and the "Free for verified students" label on the Toolkit, and the event descriptions on the Events page, are the team's wording, not from official pages. Review them.
- [ ] **Microsoft 365 and Adobe details** (resources.html): "Copilot inside the apps" and the "drop cougars from the address" tip were not on CSUSM's pages, so they are left out. The Adobe card points to CSUSM's page for the exact redemption steps. Add them if the team can confirm.
- [ ] **Toolkit items not verified, so not published:** LinkedIn Learning, Tableau for Students, Microsoft exam discounts, and Library resources (O'Reilly and others). The Career Center tools (Handshake, resume and cover letter critiques, headshots) were verified on November 22 and are in CLAUDE.md section 6.

## Notes for the team (no action unless you disagree)

- **The Careers page copies the quiz's data** (careers.html): the 12 family cards and the certification table were generated from `quiz/js/data.js` and are plain HTML. If Felix changes `data.js`, update careers.html too. The automated test fails when they differ.
- **The quiz looks different from Felix's original** (quiz/index.html): it uses the site's Inter font and the site's navbar and footer. His scoring logic, content and stylesheet are byte-for-byte the same; the only edits are listed in `docs/quiz-changes.diff`.
- **The quiz needs JavaScript:** without it, the quiz page shows a notice and the Careers page still lists everything.
- **Tested in Microsoft Edge only:** see `docs/QA_REPORT.md` for what was and was not tested.
