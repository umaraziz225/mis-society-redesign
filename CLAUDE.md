# CLAUDE.md — MIS Society Website Redesign (MIS 410 Final Group Project)

Context file for any AI assistant (Claude, Copilot, etc.) helping build this project. Read this whole file before writing code or content. If something here conflicts with a request, ask the team.

---

## 1. The project in one paragraph

A 5-person team in **MIS 410 (CSUSM, Fall 2026, Dr. Yubo Fu)** is building a responsive mock redesign of the **CSUSM MIS Society** website with HTML, custom CSS, and Bootstrap, using a documented "vibe coding" process. Most of the team are MIS Society board members, and the club (president: Fang Fang) supports the project, so **real club name, logo, officers, and content may be used**. The site should be useful to non-members first, so that joining the club feels like the natural next step.

**Challenge statement:** How might we help CSUSM business and MIS students find the tools, careers, and community they already have access to, and see why the MIS Society is worth joining?

**Team:** Umar Aziz, Felix Gross, Luis Quinonez, Zechariah Yamsuan, Madeline Forsythe

## 2. Key dates

| Date | What |
|---|---|
| Tue Nov 24, 2026 | Group meeting with the instructor (bring the open questions in section 11) |
| Week of Dec 1 | Group work week |
| **Tue Dec 8, 2026** | **Group presentations (8–10 min + Q&A) and final submission** |

Late work loses 20% per day. There is no final exam. The project is worth 200 points (20% of the course grade).

## 3. Grading requirements (from the assignment sheet)

Treat these as hard requirements. Every page and prompt must respect them.

**HTML (35 pts):** at least 4 linked pages; a homepage that states the site's purpose; working navigation; meaningful content for the audience; headings, lists, links, images, tables, forms; semantic tags (`header`, `nav`, `main`, `section`, `footer`); **no placeholder text or empty pages.**

**CSS (35 pts):** one external CSS file; consistent colors and readable type; intentional spacing and hierarchy; customized buttons, cards, sections; a look that goes beyond default Bootstrap.

**Bootstrap and responsive (40 pts, the largest category):** Bootstrap grid; at least 3 components (navbar, cards, accordion, carousel, forms, tables, modal, badges, alerts); works on desktop and mobile; consistent styling across pages.

**UX and accessibility:** clear navigation; working links and images; readable contrast; descriptive alt text; consistent page titles and headings; at least one user-focused feature (FAQ, form, schedule, directory, comparison). Forms can be design-only and don't need to send data.

**Vibe coding (30 pts):** a log with at least 4 entries. Each entry covers: goal, prompt, what the AI suggested, what was accepted/changed/rejected, how it was tested, what was learned. Don't submit code nobody on the team can explain.

**Purpose and audience 20 · Presentation and teamwork 30 · Documentation 10.**

**Deliverables:** (A) the website folder, organized and tested from the folder itself; (B) a 1–2 page summary (title, team, purpose and audience, pages and features, how to open it, known limitations, each member's contributions); (C) the vibe coding log; (D) the presentation (problem and audience, demo, CSS/Bootstrap choices, desktop vs. mobile, one AI example and how it was tested, one challenge and what was learned). Every member needs a clear role.

## 4. Audience

| Audience | What they need first |
|---|---|
| New and transfer students | What MIS is, what free tools they have, how to get involved |
| Current MIS and business students | Events, certifications, career paths, the career quiz |
| Prospective members | Benefits of joining, what meetings are like, how to join |
| Employers and guest speakers | Who to contact and why to partner with the club |

## 5. Site map (current plan, can still change)

Six pages share one navbar and one footer.

| Page | File | Purpose | Main sections | Bootstrap components |
|---|---|---|---|---|
| Home | `index.html` | Say what the site is for, route people quickly | Hero with mission and two buttons ("Explore free tools", "Join the Society"); "What your CSUSM email unlocks" teaser cards; featured events carousel; 3 "why join" benefit cards; career quiz call-out | Navbar, carousel, cards, buttons |
| Student Toolkit | `resources.html` | Free tools and perks students already have | Category filter buttons; tool cards; last-checked date | Cards, badges, button group, accordion |
| Careers | `careers.html` | Where MIS leads | Career Fit Quiz (embedded or linked); 12 career families overview; certifications table; internship tips | Tables, cards, accordion |
| Events | `events.html` | What's coming and what's happened | Semester schedule table; event cards (speaker, company visit, workshop, social); past-events gallery | Table, cards, badges, modal |
| About / Officers | `about.html` | Who runs the club | Mission and history; officer cards (name, role, photo, LinkedIn); partner companies | Cards, grid |
| Join / Contact | `join.html` | Turn interest into membership | Benefits; time and cost; membership form (design only); FAQ; employer/speaker contact | Forms, accordion, alerts |

**Navbar order:** Home · Student Toolkit · Careers · Events · About · Join (Join styled as a button; current page highlighted).
**Footer on every page:** club email, social links, CSUSM College of Business link, "Student-built mock site for MIS 410, Fall 2026", last-updated date.

## 6. Verified content: Student Toolkit

Re-verified 11/22 against each official page. Link to the official page on every card and show a "last checked" date. Re-check links the week before Dec 8.

| Tool | What students get (as the official page says now) | How to get it | Official source |
|---|---|---|---|
| ChatGPT Edu | CSU-wide ChatGPT Edu license with more powerful tools and enhanced privacy; chats are not used to train OpenAI's models. Optional sign-up. Since Sept 1, 2026 it has usage limits on most features, and CSUSM cannot reset them; Microsoft Copilot can be used in most cases without limits. | Request a license with the CSUSM form, open the invite email and select "Join Workspace" (or log in, not sign up), choose "San Marcos", use your campus username and password. | https://www.csusm.edu/iits/iitsforyou/generativeai/chatgpt/index.html |
| Microsoft 365 | Microsoft 365 for all active CSUSM students: Office apps in the browser, OneDrive cloud storage, installable on personal devices; access ends when you leave CSUSM (back up first). The page does not mention Copilot inside the apps. | Office.com with your campus username and password; install guides on the CSUSM page. (The "drop cougars" tip is not on the page.) | https://csusm.edu/iits/iitsforyou/office365/download-msoffice/index.html |
| Adobe Creative Cloud | Free for currently enrolled students on campus and home computers: Photoshop, Illustrator, Premiere Pro, and more. Access lasts while you are enrolled. | CSUSM redemption codes; steps are on the CSUSM page. | https://www.csusm.edu/iits/iitsforyou/adobe/download-adobe/index.html |
| MIS-relevant software | Listed for students on the CSUSM software page: SPSS, Visio, SQL Developer, SAP Logon, R and R Studio, StarUML, Minitab | Cougar Apps, or a personal-device download where the list shows one | https://www.csusm.edu/iits/iitsforyou/software/index.html |
| Azure for Students | $100 credit to use within 12 months, select free services, no credit card. Unused credit does not carry over. Must be 18+ and a full-time student at an accredited, degree-granting school. (No "renewable yearly" on the page.) | Apply on the Azure page and verify with your school email | https://azure.microsoft.com/en-us/pricing/offers/ms-azr-0170p/ |
| GitHub Student Developer Pack | Free GitHub Pro while you are a student, partner offers, and GitHub Copilot Student for verified students (unlimited code completions, limited chat and agent use) | Sign up and verify at education.github.com | https://education.github.com/pack |

**Verified 11/22 (CSUSM Career Center home page, https://www.csusm.edu/careers/index.html):** Handshake is where students make appointments, search for jobs, RSVP for events, and get resume/cover letter critiques. The page also lists free headshots, career counseling, mentorship, internship information, and the Cougar Career Closet (https://www.csusm.edu/careers/careercentercloset.html).

**Not yet verified, don't publish until checked:** LinkedIn Learning access, Tableau for Students, Microsoft exam discounts, Library resources (O'Reilly, etc.).

Add a reminder on AI tool cards: check each instructor's AI policy before using AI for coursework.

## 7. Career Fit Quiz (already built by Felix)

- Live: https://felixdoesmis-csusm.github.io/mis-career-quiz/
- Repo: https://github.com/FelixDoesMIS-csusm/mis-career-quiz
- Matches students to 12 MIS career families (process improvement, business analysis, business systems, automation/AI, analytics/BI, data governance, GRC and AI governance, cybersecurity, IT project delivery, UX, IT operations/cloud, tech consulting) with entry titles, certifications, BLS 2025–35 pay and growth, and AI-exposure notes.
- Built with HTML, Bootstrap 5, and plain JavaScript. Questions and career data live in `js/data.js`.
- **Plan:** copy it into a `quiz/` folder and restyle it to match the site, or link to the live version if the instructor limits JavaScript. Don't rebuild it.
- Related: Felix also built an MIS Career Hub with login and a database (https://felixdoesmis-csusm.github.io/mis-career-hub/). It is a separate project; reuse its career content and design ideas, not its backend.

## 8. Design rules (apply to every page)

- **Colors:** blue and white, matched to CSUSM and the club logo. Define everything as CSS variables in one place (`--primary`, `--primary-dark`, `--accent`, `--light-bg`, `--text`).
- **Type:** one sans-serif Google Font, body text 16px or larger.
- **Look:** rounded cards with soft shadows, generous white space, one accent color for buttons. Override Bootstrap's default buttons, cards, and navbar in `css/style.css`.
- **Tone:** written for a first-year transfer student. Plain words, short sentences, "you." Name specific tools, companies, and dates. No "Lorem ipsum" or "Coming soon."
- **Accessibility:** alt text on meaningful images (`alt=""` on decorative ones), 4.5:1 contrast for body text, one `h1` per page with headings in order, a label on every form field, keyboard-reachable with visible focus.

## 9. Technical rules

- Folder structure: pages at the root, plus `css/style.css`, `js/` (only if JavaScript is allowed), `images/`, `quiz/`.
- Bootstrap 5.3 via CDN, or downloaded files if the site must work offline from the folder (decide after Nov 24).
- **Relative links only** (`events.html`, not `/events.html`) so the site opens from the folder.
- Test at 375px (phone), 768px (tablet), and 1280px (desktop).
- GitHub Pages hosting is optional; it isn't required by the assignment.
- If a fact is missing, write `[NEEDS CONTENT: description]` so the team can find it. Never invent club facts.

## 10. How to build (recommended workflow)

One prompt won't produce the whole site well. Use these steps:
1. Fill in the club facts in section 11.
2. **Prompt 1** builds the shared skeleton: all six files with header, navbar, footer, an `h1` and an intro each, plus `style.css`. The team agrees on it.
3. **Prompt 2** builds one page at a time: give the AI that page's row from section 5 plus its content, and tell it not to change shared styles.
4. Integrate the quiz, then test everything from the folder and on a phone.
5. After each prompt, write a Vibe Coding Log entry. That gives the team its 4+ entries naturally.

Suggested ownership (proposal, swap freely): one person owns the skeleton and `style.css`; one each for Home, Student Toolkit, Events, About plus Join; Felix owns Careers and the quiz integration. Each owner builds, tests, and logs their page and presents part of the talk.

## 11. Open items

**Club facts the team must supply:**
- [ ] Official mission statement
- [ ] Officer names, roles, photos, LinkedIn links (with each officer's permission)
- [ ] Past speakers and company visits, with dates
- [ ] Spring 2027 event calendar (or clearly labeled sample events)
- [ ] Membership fee, requirements, and how to sign up
- [ ] Club email, Instagram, LinkedIn, Discord or group chat links
- [ ] Logo files

**Ask the instructor on Nov 24:**
- [ ] Is JavaScript beyond Bootstrap allowed? (Determines whether the quiz is embedded or linked.)
- [ ] Is GitHub Pages hosting acceptable alongside the folder submission?
- [ ] Vibe Coding Log format: table or written paragraphs? Screenshots of prompts?
- [ ] Confirm the final submission deadline is Dec 8.

**Already confirmed:** the team can use the real club name and content (club leadership supports the project).

---

## 12. Build decisions (defaults locked 11/22, revisit after the Nov 24 instructor meeting)


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

### Testing rule

After every stage, run `npm test --prefix tests`, fix every failure you can, re-run until it passes, and include the summary in your report and the Vibe Coding Log's "How we tested" column. Add interactive checks to tests/page-checks.js for any new feature you build. Only list for Umar what genuinely needs a human eye (visual look, wording).
