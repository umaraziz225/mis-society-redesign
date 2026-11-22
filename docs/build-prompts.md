# MIS Society Website Redesign: Claude CLI Build Prompts

Paste these into Claude CLI (PowerShell) one stage at a time. Run them from your project folder. After each stage, test the result, fix anything that's off, and add a Vibe Coding Log entry before starting the next stage.

## Before you start (one-time, about 2 minutes)

1. Make the project folder and open Claude CLI in it:
   ```powershell
   mkdir $HOME\Projects\mis-society-redesign
   cd $HOME\Projects\mis-society-redesign
   claude
   ```
2. Copy the team context file into that folder and rename it to `CLAUDE.md`. Claude CLI reads `CLAUDE.md` automatically at the start of every session.
3. Put this file in the same folder at `docs/build-prompts.md`, so the team has a record of every prompt used.
4. Check that `gh auth status` shows you're signed in as `umaraziz225`.

Stage order: 0 Setup → 1 Skeleton + CSS → 2 Home → 3 Student Toolkit → 4 Careers + Quiz → 5 Events → 6 About → 7 Join → 8 QA pass → 9 Deploy to GitHub Pages → 10 Docs handoff.

---

## Stage 0: Project setup and build decisions

```text
Read CLAUDE.md fully. Then do the setup below. Don't build any pages yet.

1. Add a new section at the end of CLAUDE.md titled "## 12. Build decisions (defaults locked 11/22, revisit after the Nov 24 instructor meeting)". Copy in the decisions listed below word for word. Don't edit sections 1–11.

2. Create this folder structure (empty files are fine for now):
   index.html, resources.html, careers.html, events.html, about.html, join.html
   css/style.css
   js/main.js
   images/
   vendor/bootstrap/ (Bootstrap 5.3.x dist: bootstrap.min.css, bootstrap.bundle.min.js)
   vendor/bootstrap-icons/ (Bootstrap Icons CSS + fonts folder)
   quiz/ (empty for now)
   docs/
   VIBE_CODING_LOG.md
   MISSING_CONTENT.md
   README.md
   .nojekyll
   .gitignore

3. Download Bootstrap 5.3 (latest 5.3.x) and Bootstrap Icons from their official releases with PowerShell (Invoke-WebRequest, or npm pack and copy just the dist files). Save them in vendor/. Bundle them locally so the site works when opened straight from the folder, with or without internet. Don't commit node_modules.

4. Start git: git init, main branch. Don't create the GitHub repo yet; that's Stage 9.

5. Set up VIBE_CODING_LOG.md as a table template with these columns: #, Date, Stage, Goal, Prompt (exact text or a link to docs/build-prompts.md), What the AI suggested/did, What we accepted / changed / rejected, How we tested, What we learned, Team member.
   You (Claude) may fill in: Date, Stage, Goal, Prompt, What the AI suggested/did, How we tested (only tests you actually ran).
   Leave "accepted/changed/rejected", "what we learned" and "Team member" as "_(team fills in)_". These must reflect the team's own judgment. Never write them for us.
   Add entry #1 for this setup stage.

6. Set up MISSING_CONTENT.md as a checklist. Every fact we still need goes here, with the page it belongs on. Seed it with the "Flagged for team" items from the decisions below.

7. Make the first commit: "Stage 0: project setup, vendor Bootstrap, build decisions".

When you're done, list every file you created and every version you downloaded.

--- BUILD DECISIONS (paste into CLAUDE.md section 12) ---

Scope: class prototype the club could adopt later. Footer note: "Student-built mock redesign for MIS 410, Fall 2026, CSU San Marcos." Real club name, logo and officers are allowed (club leadership supports the project).

Base content: follow the current site at https://www.csusmmissociety.com (Home, About Us, Resources, Events, Meet The Team, Advisor, Openings, Join Us). Keep all of its real content and fix its problems: placeholder "Heading 4", empty headings, two h1s, missing alt text, the "More" link that goes nowhere, the unlinked "MIS Career Toolkit", the COBA and copyright links that point to /events, the "(c) 2008" footer, the Instagram icon that links to LinkedIn, and the empty Events, Openings and Join pages.

Sitemap: the six pages in section 5. The current Openings page is empty (0 jobs), so it's removed; officer openings are mentioned in the Join FAQ. Advisor info moves to About.

Primary CTA: "Join the Society" (join.html). Secondary CTA: "Explore free tools" (resources.html).

Voice: approachable but credible. Plain words, short sentences, "you."

Visual direction: CSUSM-aligned blue and white, but distinctly the MIS Society; not a copy of csusm.edu. Split hero: message and CTAs on the left, a visual on the right (logo or a CSS/SVG graphic). Modern and clean, with light "tech" touches: a subtle grid or dot pattern, gradients in the hero and section dividers.

Imagery: the real club logo (taken from the current site), Bootstrap Icons, and CSS/SVG graphics. No stock photos of people. No officer headshots; officer cards use initials avatars plus LinkedIn links. A past-events photo gallery is only added once the team supplies photos it has permission to use.

Technology: HTML, one external CSS file (css/style.css), Bootstrap 5.3 bundled locally in vendor/, Bootstrap Icons bundled locally. Modest vanilla JavaScript in js/main.js only for: Toolkit category filters, the Join demo-form message, the footer year, and the copied quiz. Every page must still read fine with JS off. No other frameworks, no build step, no backend.

Fonts: one Google Font (Inter or Plus Jakarta Sans) loaded with a <link>, falling back to the system sans-serif stack so it still looks right offline.

Content upkeep: page content stays in plain, well-commented HTML, which is easiest for future officers and best for the HTML grade. The only data file is the quiz's own quiz/js/data.js.

Events: the club has no confirmed upcoming events. Show a clearly labeled sample Spring 2027 schedule (a visible "Sample schedule for class demo" badge on the section). RSVP buttons open a modal that says RSVP links will be posted by the club and gives the club email. They never pretend to register anyone.

Join: the current site has no working signup form, so build a design-only form. On submit, JS stops the real submit and shows a Bootstrap alert: "This is a demo form for a class project. Nothing was sent. To join for real, email csusmmissociety@gmail.com." Never show a fake success message.

Quiz: copy Felix's quiz (repo https://github.com/FelixDoesMIS-csusm/mis-career-quiz) into quiz/, keep its scoring logic and js/data.js unchanged, and restyle it to match. Also link the live version (https://felixdoesmis-csusm.github.io/mis-career-quiz/) as a fallback and credit Felix.

Hosting: the folder submission must work on its own (relative links only). Also host on GitHub Pages from the repo umaraziz225/mis-society-redesign (main branch, root folder). Umar adds teammates as collaborators later.

Missing facts: never invent club facts. Visible page text must never contain placeholder text. That includes "[NEEDS CONTENT]", "Lorem ipsum", "Coming soon" and "TBD", because the rubric deducts for it. If a fact is missing, either leave that bit out or put an HTML comment <!-- NEEDS CONTENT: ... --> where it would go, and log it in MISSING_CONTENT.md. (This replaces the visible-marker rule in section 9.)

Flagged for team:
- Advisor vs. president: section 1 says "president: Fang Fang", but the current site lists Fang Fang as faculty advisor and Ryan Mohammadpour as President. The site follows the current website until the team confirms.
- Spelling: "Zachariah Yamsuan" (current site) vs. "Zechariah" (brief). Use whichever Zech confirms; the current site's spelling for now.
- Real Instagram URL (the current site's Instagram icon links to LinkedIn).
- Membership fee, eligibility, meeting times and location.
- Real past speakers or company visits with dates, and photos with permission.
- Whether the instructor allows JS (if not, swap the quiz for an external link and replace the filter JS with static grouped sections).
```

**Log it:** entry #1 is drafted for you. Fill in the team columns.

---

## Stage 1: Shared skeleton and style.css

```text
Read CLAUDE.md (including section 12). Build ONLY the shared foundation in this stage.

CURRENT SITE REFERENCE: fetch https://www.csusmmissociety.com and find the MIS Society logo image URL (hosted on static.wixstatic.com). Download the highest-quality version into images/ as mis-society-logo.png (and a smaller copy for the navbar if useful). If you can't get it, build a clean text wordmark "MIS Society" in CSS instead and add the logo to MISSING_CONTENT.md.

ALL SIX PAGES (index, resources, careers, events, about, join):
- <!doctype html>, lang="en", meta viewport, a unique <title> like "Student Toolkit | MIS Society at CSUSM", a meta description.
- Link vendor/bootstrap/bootstrap.min.css, vendor/bootstrap-icons/bootstrap-icons.css, the Google Font, then css/style.css last. Scripts at the end of body: vendor/bootstrap/bootstrap.bundle.min.js, then js/main.js.
- A "Skip to main content" link as the first focusable element.
- <header> with a Bootstrap navbar (expand-lg, collapses to a hamburger on phones): logo + "MIS Society" brand linking to index.html, then links in this order: Home, Student Toolkit, Careers, Events, About, and Join as a styled button. Mark the current page with .active and aria-current="page" (hard-coded per page, no JS).
- <main id="main"> containing one <section> with the page's single <h1> and a 1–2 sentence intro, using real content (no placeholders).
- <footer> on every page with: logo/name; the tagline "Connecting, collaborating, and engaging."; email csusmmissociety@gmail.com (mailto); LinkedIn https://www.linkedin.com/in/mis-society-203880251/ (only add Instagram if you can confirm the club's real account; otherwise log it as missing); the CSUSM College of Business Administration link (find and verify the correct csusm.edu URL); the CSUSM MIS program link (verify, use https); the address "CSU San Marcos, 333 S. Twin Oaks Valley Rd., San Marcos, CA 92096"; quick links to all six pages; the student-project note from section 12; "Last updated: November 2026"; and "(c) <current year> CSUSM MIS Society", with the year filled in by JS and the static text as fallback.
- External links: target="_blank" rel="noopener", plus visually hidden "(opens in new tab)" text.

css/style.css:
- At the top: :root variables --primary, --primary-dark, --accent, --light-bg, --text, plus --radius, --shadow-sm, --shadow-md and a spacing scale. Base the blues on CSUSM blue (a deep navy around #002D72 for --primary-dark), use a brighter blue for --primary, and pick ONE accent for buttons. Every text/background pairing must pass 4.5:1. Put a comment next to each pairing with its contrast ratio.
- Body text 16px+ (1.0625rem is fine), comfortable line-height, a clear heading scale.
- Clearly override Bootstrap defaults: navbar (white with a subtle shadow on scroll or a thin bottom border; Join as a pill button), .btn-primary / .btn-outline-primary (custom colors, radius, hover/active/focus states), .card (rounded, soft shadow, hover lift with prefers-reduced-motion respected), badges, accordion, tables, form controls.
- Reusable pieces: .section (vertical rhythm), .section-alt (light-bg band), .hero (split layout, gradient with a subtle CSS dot or grid pattern), .eyebrow labels, .icon-tile for Bootstrap Icons in tinted circles, .avatar-initials, .page-header (shorter hero for inner pages).
- Visible keyboard focus everywhere (:focus-visible outline in the accent color, never removed).
- Organize the file with comment headers: 1 Variables, 2 Base, 3 Layout, 4 Components, 5 Utilities, then one block per page added in later stages.

js/main.js: only the footer year for now, wrapped so it can't throw on pages that lack an element.

Don't build page content beyond each page's h1 and intro yet.

TEST: open index.html straight from the folder (file://) and confirm Bootstrap and the CSS load and the navbar collapses at 375px. Check that each page has exactly one h1 and the nav links all work.

When done:
1. List every file you created or changed.
2. Explain the main CSS choices in plain language (5–8 bullets), so the team can explain them in the presentation.
3. List the colors with their contrast ratios.
4. Add VIBE_CODING_LOG.md entry #2 and update MISSING_CONTENT.md.
5. Commit: "Stage 1: shared skeleton, navbar, footer, style.css".
```

**Stop here as a team:** look at the skeleton together and agree on the look before anyone builds pages. If the colors or fonts need changing, change them now with one follow-up prompt and log it.

---

## Stage 2: Home page (index.html)

```text
Using the existing navbar, footer and css/style.css (don't change shared styles; add Home-specific CSS at the end of style.css under "/* ===== Home ===== */"), build the full content of index.html.

SECTIONS IN ORDER:
1. Hero (split): eyebrow "CSUSM College of Business Administration"; h1 "Management Information Systems Society"; subhead using the current site's vision line "Bridging the transition from student to professional." plus one plain sentence on what the club does; primary button "Join the Society" -> join.html; secondary outline button "Explore free tools" -> resources.html. Right side: the club logo or an SVG/CSS graphic (decorative = alt="").
2. "What is MIS?": rewrite the current site's text in plain words. MIS sits at the intersection of business and technology. Show the areas it lists (emerging technologies, database management, cybersecurity, product management, consulting, business analytics, systems design) as icon tiles in a responsive grid (2 columns on phone, 4 on desktop).
3. "What your CSUSM email unlocks": 4 teaser cards (ChatGPT Edu, Microsoft 365 + Copilot, Adobe Creative Cloud, Azure for Students), using only the verified facts in CLAUDE.md section 6. Each has a one-line pitch and a "See how to get it" link to resources.html#<tool-id>. A "See all free tools" button below.
4. "Upcoming events" Bootstrap carousel with 3 slides taken from the sample Spring 2027 schedule (Stage 5 will use the same events, so define them now in a comment block at the top of the section so Stage 5 can copy them). The section heading area shows a "Sample schedule" badge. Accessible controls and indicators, no autoplay (or pause on hover/focus), a link to events.html.
5. "Why join": 4 benefit cards from the current site's member perks: Guest speakers and real Q&A; Internship prep (resume, LinkedIn, interviews, recruiting strategy); Career clarity (roles explained, paths mapped); Community. Don't add perks the current site doesn't list.
6. Career quiz call-out band: "Not sure which MIS career fits you? Take the 5-minute Career Fit Quiz." -> careers.html#quiz. Only say "5-minute" if the quiz's own README or page says so; otherwise drop the time.
7. Closing CTA band: "Ready to get involved?" + Join button + "Partner with us" link to join.html#partners.

SAMPLE EVENTS (use these for the carousel and for Stage 5; all clearly labeled as sample):
- Spring Kickoff & Info Night (Social), late January 2027
- Resume & LinkedIn Workshop (Workshop), February 2027
- Industry Speaker Panel: Careers in MIS (Speaker), March 2027
- SQL & Power BI Hands-On Workshop (Workshop), March 2027
- Company Visit (Company visit), April 2027, company to be announced by the club
- End-of-Year Mixer & Officer Elections Info (Social), May 2027
Use month-level dates and "Location: CSUSM campus (room posted by the club)". Don't invent specific days, rooms, speakers or companies.

Components used here: navbar, carousel, cards, buttons, badges, grid.

TEST: 375 / 768 / 1280 px widths, keyboard-only tab-through, one h1, every link resolves, carousel works with the keyboard.

When done: tell me what you built, which Bootstrap components you used, and what to check on a phone. Add VIBE_CODING_LOG.md entry #3, update MISSING_CONTENT.md, and commit "Stage 2: Home page".
```

---

## Stage 3: Student Toolkit (resources.html)

```text
Using the existing shared layout and CSS (add page CSS under "/* ===== Toolkit ===== */"), build resources.html.

SECTIONS:
1. Page header: h1 "Student Toolkit". Intro: your CSUSM account already unlocks paid software; here's what it is and how to turn it on.
2. Filter bar: a Bootstrap button group with category filters: All, AI, Productivity, Design, Data & Coding, Cloud. JS in js/main.js shows and hides cards by data-category (a card can have several categories), sets aria-pressed on the active button, and announces the count in an aria-live region ("Showing 3 tools"). With JS off, all cards show and the filter bar is hidden (add the bar via a class JS sets on <html>).
3. Tool cards, ONE per tool in CLAUDE.md section 6 (ChatGPT Edu; Microsoft 365 + Copilot; Adobe Creative Cloud; MIS-relevant software; Azure for Students; GitHub Student Developer Pack). Each card has: an id (for deep links from Home), a Bootstrap Icon, the name, a one-line plain-English pitch, "Good for" badges (Coursework, Coding, Data, Design, Career), "Provided by CSUSM" or "Free with student email" label, a "How to get it" collapsible (accordion or collapse) with the steps from section 6, a button to the official source URL from section 6, and "Last checked: November 2026".
   AI tools (ChatGPT Edu, Copilot, GitHub Copilot via the Pack) get a small note: "Check each instructor's AI policy before using AI for coursework."
4. BEFORE writing the cards, fetch each official URL in section 6 and confirm the page loads and still supports the claim. If a claim no longer matches, use what the official page says now, and tell me what changed. If a URL is dead, find the current official URL on the same domain. Don't add the "not yet verified" tools from section 6.
5. "More campus resources" section: the COBA links from the current site's homepage (Advising Office, Degrees, Signature Programs, Cougar Career Closet, Student Success Grants) and the Career Center links (Career Center home, Career Services, Events). Find and verify each real csusm.edu URL. Show them as two grouped link-list cards. Drop any you can't verify and log them.

Components: cards, badges, button group, accordion/collapse, grid.

TEST: filters work and are keyboard and screen-reader friendly; the page works with JS disabled; all external links open; layout at 375/768/1280.

When done: report what you verified (URL + what it confirmed), what you built, the components used, and phone checks. Add log entry #4, update MISSING_CONTENT.md, commit "Stage 3: Student Toolkit".
```

---

## Stage 4: Careers + Career Fit Quiz (careers.html, quiz/)

Felix owns this stage. He should run it or be present for it.

```text
Using the existing shared layout and CSS (add page CSS under "/* ===== Careers ===== */"), build careers.html and integrate Felix's quiz.

QUIZ INTEGRATION:
1. Clone https://github.com/FelixDoesMIS-csusm/mis-career-quiz into a temp folder outside the project. Read its README and code first and summarize for me how it's structured (files, where the questions and careers live, how scoring works).
2. Copy the quiz files into quiz/ (not the .git folder). Keep quiz/js/data.js and the scoring logic byte-for-byte unchanged. Only change: the Bootstrap paths (point to ../vendor/bootstrap/... if it used a CDN, so it works offline), adding our navbar and footer with ../ relative links, and adding a quiz-specific stylesheet or a link to ../css/style.css so it matches our colors, fonts, buttons and cards.
3. Add a visible credit on the quiz page and on careers.html: "Career Fit Quiz built by Felix Gross" with a link to the original live version https://felixdoesmis-csusm.github.io/mis-career-quiz/.
4. Confirm the quiz runs when opened straight from the folder (file://) and from a local server. Run `npx serve .` or `python -m http.server` to test. Take the quiz once end to end.
5. Show me a diff of every change you made to Felix's files.

CAREERS PAGE SECTIONS:
1. Page header: h1 "MIS Careers". Intro: where an MIS degree can take you.
2. Quiz call-out (id="quiz"): a big card with a "Take the Career Fit Quiz" button -> quiz/index.html, plus the live-version link as a fallback.
3. "12 career families": cards in a responsive grid, one per family, using names, short descriptions, and entry-level titles read from the quiz's data.js, so the page and the quiz always agree. Don't add pay or growth numbers on this page; send people to the quiz results for those, which already cite BLS.
4. "Certifications worth knowing": a responsive Bootstrap table (table-responsive) of certifications the quiz data mentions, grouped by career family, with each certification's official vendor link. Only include certs that appear in data.js, and verify each vendor link.
5. "Landing an internship": an accordion with 4–5 practical tips (resume, LinkedIn, Handshake/Career Center, informational interviews, how the MIS Society helps: guest speakers, internship prep). Link to the verified CSUSM Career Center URL. No uncited statistics.

Components: cards, table, accordion, grid.

When done: summarize the quiz structure (for Felix's presentation part), list changes to the quiz files, the components used, and phone checks. Add log entry #5, update MISSING_CONTENT.md, commit "Stage 4: Careers page and quiz integration".
```

---

## Stage 5: Events (events.html)

```text
Using the existing shared layout and CSS (add page CSS under "/* ===== Events ===== */"), build events.html.

Use the same SAMPLE Spring 2027 events defined in Stage 2 (see the comment block in index.html). Everything is clearly labeled as a sample: a visible Bootstrap alert at the top of the schedule says "Sample schedule for class demo. Check the club's LinkedIn or email us for real dates."

SECTIONS:
1. Page header: h1 "Events". Intro: the kinds of events the club runs (from the current About page: events and seminars on career development and professional networking) and how to hear about them (email, LinkedIn).
2. "Spring 2027 schedule (sample)": a responsive Bootstrap table with columns Event, Type (colored badge per type: Speaker, Workshop, Company visit, Social), Month, Who it's for ("Open to all students" or "Members"), and Details (a button that opens a modal).
3. Event cards below the table (grid): name, type badge, month, "who it's for", a 1–2 sentence description of what attendees walk away with, and an "RSVP" button.
4. One reusable Bootstrap modal (or one per event) with the event details. RSVP buttons open a modal that says the club posts RSVP links on LinkedIn and by email, with a mailto link to csusmmissociety@gmail.com. Don't fake a registration.
5. "Types of events we run": 4 icon cards (Guest speakers, Workshops, Company visits, Socials) describing each type in general terms. No claims about specific past speakers or companies.
6. Past events gallery: do NOT build it yet. Add an HTML comment where it goes and log in MISSING_CONTENT.md that it needs real photos with permission.

Components: table, badges, cards, modal, alert.

TEST: modals open and close with the keyboard (Esc, focus returns to the button); the table scrolls on a 375px phone; badges pass contrast.

When done: report what you built, the components, and phone checks. Add log entry #6, update MISSING_CONTENT.md, commit "Stage 5: Events page".
```

---

## Stage 6: About / Officers (about.html)

```text
Using the existing shared layout and CSS (add page CSS under "/* ===== About ===== */"), build about.html from the current site's About Us, Meet The Team and Advisor pages.

SECTIONS:
1. Page header: h1 "About the MIS Society". Tagline "Connecting, collaborating, and engaging."
2. Mission: rewrite the current site's mission in plain words. The club eases the move from student to professional by connecting students with each other, College of Business Administration faculty and staff, and industry professionals. It runs events and seminars on career development and networking, and helps members understand the IT industry and the role of MIS in business.
3. History: officially recognized by ASI at CSUSM in Fall 2008. Founding student members: Richard Morris, Chris James, Aaron Hansen, Juan Johnson, Wendy Babu, Casey Davidson, Nathaniel Keifer. Show this as a short timeline component (custom CSS on a list), not just a paragraph.
4. Faculty advisor: a card for Fang Fang, Faculty Advisor (per the current site). Add an HTML comment noting the advisor/president conflict flagged in CLAUDE.md section 12. Don't add a bio or photo we don't have.
5. "Meet the team": officer cards in a responsive grid (2 per row on phone, 3 on tablet, 4 on desktop), each with an initials avatar (decorative, aria-hidden), name, role, and a LinkedIn button with aria-label "Name on LinkedIn". Use exactly this list from the current site:
   - Ryan Mohammadpour, President: https://www.linkedin.com/in/ryan-mohammadpour-09b9112ba/
   - Sharif Word, Vice President: https://www.linkedin.com/in/sharif-word/
   - Zachariah Yamsuan, Chief Financial Officer: https://www.linkedin.com/in/yamsu001/
   - Umar Aziz, Chief Outreach Officer: https://www.linkedin.com/in/umaraziz05/
   - Felix Gross, Chief Information Officer: https://www.linkedin.com/in/felix-r-gross/
   - Taylor Dyal, Chief Technology Officer: https://www.linkedin.com/in/taylor-dyal/
   - Madeline Forsythe, Brand Manager: https://www.linkedin.com/in/madeline-forsythe-741440155/
   - Zachary Ratzlaff, Social Media Manager: https://www.linkedin.com/in/zachary-ratzlaff-a068613a9/
   - Darren Allen, Social Media Manager: https://www.linkedin.com/in/darren-allen-2a1b70365/
   - Lesley Marquina, Ambassador: https://www.linkedin.com/in/lesley-marquina-15523a279/
   - Ronin Ross, Ambassador: https://www.linkedin.com/in/ronin-ross/
   - Javier Garcia-Ornelas, Ambassador: https://www.linkedin.com/in/javier-garcia-ornelas-93550223b/
   Group them: Executive board (President through CTO), then Brand & Social, then Ambassadors.
6. "Where our alumni work": the current site shows unnamed logos only, so skip this section. Log it in MISSING_CONTENT.md (needs company names the club can confirm).
7. CTA band: "Want to be on this page next year?" -> join.html#officer-roles.

Components: cards, grid, buttons (plus the custom timeline).

When done: report what you built, the components, and phone checks. Add log entry #7, update MISSING_CONTENT.md, commit "Stage 6: About page".
```

---

## Stage 7: Join / Contact (join.html)

```text
Using the existing shared layout and CSS (add page CSS under "/* ===== Join ===== */"), build join.html. Keep the current site's heading idea: "Join the MIS Society today!"

SECTIONS:
1. Page header: h1 "Join the MIS Society". Intro: who it's for and what you get.
2. "What you get": the same 4 perks as Home (guest speakers and Q&A, internship prep, career clarity, community), shown as a compact checklist with icons, not a copy of the Home cards.
3. "How joining works": 3 numbered steps (custom CSS stepper): 1) fill out the interest form or email us, 2) come to a meeting or event, 3) get involved (attend, volunteer, run for an officer role). Don't state fees, eligibility rules or meeting times we don't have.
4. Membership interest form (design only), in a card: First name, Last name, CSUSM email (type=email, pattern check for @csusm.edu or @cougars.csusm.edu, helpful error text), Major (select: MIS, Other business concentration, Undeclared, Other), Year (select), Interests (checkboxes: Workshops, Guest speakers, Company visits, Officer roles, Socials), an optional message textarea, and a submit button. Every field has a <label>. Use Bootstrap validation styles. On submit, JS calls preventDefault, runs the validation, and if valid shows a Bootstrap alert (role="status"): "This is a demo form for a class project. Nothing was sent. To join for real, email csusmmissociety@gmail.com." Never show a "You're registered" message.
5. FAQ accordion (id="faq"): include a question only if we can answer it truthfully.
   - "Do I have to be an MIS major?" Answer: the club is built around MIS and business-tech careers; email us to confirm current membership rules. Log the real rule as missing.
   - "Is there a membership fee?" Email us for current details. Log it as missing.
   - "When and where do meetings happen?" Follow the club on LinkedIn or email us for the current schedule. Log it as missing.
   - "How do I become an officer?" (id="officer-roles"): officer roles open periodically; the current board includes President, VP, CFO, COO, CIO, CTO, Brand Manager, Social Media Managers and Ambassadors; email us to ask about openings. This replaces the old Openings page.
   - "I'm an employer or speaker. How can we work together?" Short answer pointing to the section below.
6. Partners section (id="partners"): "For employers and guest speakers": 3 ways to collaborate (guest talk, company visit, workshop), with a "Contact us" mailto button with a prefilled subject "Partnership inquiry: MIS Society". Only promise contact, not a formal process.
7. Contact card: email, LinkedIn, CSUSM address.

Components: forms, accordion, alerts, cards.

TEST: the form is fully keyboard usable; error messages are announced (aria-describedby); the demo alert shows; mobile layout works at 375px.

When done: report what you built, the components, and phone checks. Add log entry #8, update MISSING_CONTENT.md, commit "Stage 7: Join page".
```

---

## Stage 8: Full QA pass

```text
Run a full QA pass on the whole site against CLAUDE.md section 3 (grading requirements). Fix problems as you go, but list each fix.

Check and report pass/fail for each:
1. Rubric checklist: 4+ linked pages; semantic header/nav/main/section/footer on every page; one external CSS file; Bootstrap grid; list every Bootstrap component used and where (we need 3+, so show we have many more); at least one user-focused feature (FAQ, form, schedule, filters, quiz).
2. No visible placeholder text anywhere. Search every HTML file for: lorem, ipsum, coming soon, TBD, NEEDS CONTENT outside HTML comments, "Heading", and empty headings.
3. Accessibility: exactly one h1 per page and headings in order; alt text on meaningful images, alt="" on decorative ones; every form field labeled; visible focus; color contrast. Run an automated check (for example `npx pa11y` or `npx @axe-core/cli`) on every page via a local server, and fix everything it flags.
4. HTML validity: run `npx html-validate` (or the W3C validator) on every page and fix errors.
5. Links: write a small script (in a scripts/ folder, not shipped with the site) that checks every internal link and asset path resolves, and that every external link returns 200/3xx. Report broken ones and fix them.
6. Responsive: take screenshots of every page at 375, 768 and 1280 px with Playwright (`npx playwright screenshot`, or a short script). Save them to docs/screenshots/ so the team can use them in the presentation. Look at them and fix layout issues (overflow, cramped cards, navbar wrapping).
7. Works from the folder: confirm every page and the quiz work over file:// (no absolute "/" paths, no fetch() calls that break on file://).
8. JS-off check: every page is still readable with JS disabled.
9. Consistency: same navbar, footer, title pattern and spacing on all pages; the active nav state is correct on each page.

Then add log entry #9 (testing/debugging, a good one for the presentation's "how we tested" part) and commit "Stage 8: QA pass and fixes".
```

---

## Stage 9: Push to GitHub and turn on Pages

```text
Publish the site to GitHub Pages under my account.

1. Make sure .gitignore excludes node_modules, temp clone folders, OS files and any test output except docs/screenshots.
2. Create the public repo with the gh CLI: gh repo create umaraziz225/mis-society-redesign --public --source . --remote origin --description "MIS 410 group project: mock redesign of the CSUSM MIS Society website" --push
3. Turn on GitHub Pages from the main branch, root folder (gh api -X POST repos/umaraziz225/mis-society-redesign/pages with source branch main, path /). If it's already enabled, skip this step.
4. Wait for the build, then give me the live URL (https://umaraziz225.github.io/mis-society-redesign/). Check that every page, the CSS, the vendor files and the quiz load there. Paths are case-sensitive on Pages, so fix any filename case mismatches.
5. Add the live URL to README.md and commit.
6. Don't add collaborators. I'll do that myself later. Instead, print the exact command I'll use per teammate: gh api -X PUT repos/umaraziz225/mis-society-redesign/collaborators/<their-github-username> -f permission=push

Add log entry #10 and commit "Stage 9: deploy to GitHub Pages".
```

---

## Stage 10: Documentation handoff

```text
Prepare the documentation the team will finish. Don't write our reflections or contributions for us.

1. README.md: project title, team, purpose and audience, a page list with one line each, how to open it (double-click index.html, or the live URL), tech used, folder structure, credits (quiz by Felix Gross), and a "Known limitations" list drawn from MISSING_CONTENT.md (sample events, design-only form, unverified facts, no event photos).
2. docs/project-summary-outline.md: an outline for the 1–2 page summary required in CLAUDE.md section 3 (title, team, purpose and audience, pages and features, how to open, known limitations, each member's contributions). Fill in the factual parts. Leave "each member's contributions" as a table with empty cells for the team.
3. docs/presentation-outline.md: an 8–10 minute outline covering problem and audience, demo path through the site, CSS/Bootstrap choices, desktop vs. mobile (use docs/screenshots), one AI example and how it was tested (suggest the 2–3 best log entries to choose from), and one challenge and what was learned (leave this for the team). Include a slot for each of the 5 members.
4. Review VIBE_CODING_LOG.md: make sure every entry has its prompt and test info. List which entries still need the team columns filled in.
5. Final check of MISSING_CONTENT.md, sorted by priority (what must be confirmed before Dec 8).

Commit "Stage 10: documentation" and push.
```

---

## After the Nov 24 instructor meeting

If the instructor's answers change anything, run a short prompt like this one and log it:

```text
Update CLAUDE.md section 12 with the instructor's answers from Nov 24: [paste answers]. Then apply them across the site. For example, if JavaScript isn't allowed: replace the quiz folder with a clearly labeled external link to Felix's live quiz, turn the Toolkit filters into static grouped sections, and make the Join form a plain HTML form with a visible "demo only" note. List every change, re-run the Stage 8 checks that apply, and commit.
```
