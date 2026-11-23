# Project summary: outline (1 to 2 pages)

This is the outline for the written summary the assignment asks for (CLAUDE.md section 3, deliverable B). The factual parts are filled in. The team writes the contributions and checks the rest. Keep the final summary to 1 to 2 pages.

---

## Title

**MIS Society Website Redesign**: a mock redesign of the CSUSM MIS Society website
MIS 410, CSU San Marcos, Fall 2026 (instructor: Dr. Yubo Fu)

## Team

Umar Aziz, Felix Gross, Luis Quinonez, Zachariah Yamsuan (spelling to be confirmed), Madeline Forsythe.

## Purpose and audience

**Challenge:** How might we help CSUSM business and MIS students find the tools, careers, and community they already have access to, and see why the MIS Society is worth joining?

**Why:** The club's current site has empty pages, placeholder text, a link that goes nowhere, and an Instagram icon that links to LinkedIn. Students who are not yet members cannot see what the club offers. Our redesign is useful to non-members first, so joining feels like the natural next step.

**Audience:**

| Audience | What they need first |
|---|---|
| New and transfer students | What MIS is, what free tools they have, how to get involved |
| Current MIS and business students | Events, certifications, career paths, the career quiz |
| Prospective members | Benefits of joining, how joining works, the interest form |
| Employers and guest speakers | Who to contact and why to partner with the club |

## Pages and features

| Page | Main features |
|---|---|
| Home (`index.html`) | Purpose and two calls to action, "What is MIS?", free-tool teasers, sample-events carousel, member perks, quiz call-out |
| Student Toolkit (`resources.html`) | Category filters, six verified free tools with "how to get it" steps and official links, campus resources |
| Careers (`careers.html`) | Twelve career families, certifications table with vendor links, internship tips accordion |
| Career Fit Quiz (`quiz/index.html`) | Felix's quiz matching answers to the twelve career families, restyled to match the site |
| Events (`events.html`) | Labeled sample Spring 2027 schedule, event cards, details and RSVP pop-ups |
| About (`about.html`) | Mission, history timeline, faculty advisor, twelve officers with LinkedIn links |
| Join (`join.html`) | Benefits, three steps, design-only interest form with validation, FAQ, employer and speaker contact |

**Grading checklist at a glance** (details in `docs/QA_REPORT.md`):

- 6 linked pages plus the quiz; semantic `header`, `nav`, `main`, `section`, `footer` on every page.
- One custom stylesheet (`css/style.css`) with CSS variables; customized buttons, cards, navbar, tables, and forms.
- 14 Bootstrap components, including navbar, grid, cards, carousel, accordion, modals, alerts, tables, and forms.
- Works at phone, tablet, and desktop widths (checked at 320, 375, 768, 992, 1024, 1280, and 1440 px).
- User-focused features: quiz, filters, form, FAQ, schedule.
- Accessibility: one `h1` per page, labeled fields, visible focus, contrast checked; an automated scan found no violations.
- Vibe coding log: `VIBE_CODING_LOG.md` (12 entries so far).

## How to open it

- **From the folder:** double-click `index.html`. No install or internet connection is needed.
- **Online:** https://umaraziz225.github.io/mis-society-redesign/
- Code and history: https://github.com/umaraziz225/mis-society-redesign

## Known limitations

- The Spring 2027 events are a labeled sample; the club has not confirmed a calendar.
- The Join form is design only and sends nothing; it shows a notice saying so.
- The membership fee, who can join, and meeting times are not on the site because we do not have them. The Instagram link is missing for the same reason.
- No event photos or alumni section yet (they need photos and names the club has approved).
- Some tool facts change over time (for example ChatGPT Edu limits). They were checked on November 22, 2026 and should be re-checked before Dec 8.
- LinkedIn, ASQ, and PMI links could not be checked by a script and need a look by hand.
- The quiz, filters, form, modals, and carousel use JavaScript; every page still reads fine with JavaScript off.
- Tested in Microsoft Edge only; not yet on a physical phone, in other browsers, or with a screen reader.

(Full list with priorities: `MISSING_CONTENT.md`.)

## Each member's contributions

*The team fills this in. Write what each person did in your own words. Every member needs a clear role (CLAUDE.md section 3).*

| Member | Role on this project | Pages and files they owned or built | Prompts, tests, or fixes they did | What they learned |
|---|---|---|---|---|
| Umar Aziz | | | | |
| Felix Gross | | | | |
| Luis Quinonez | | | | |
| Zachariah Yamsuan | | | | |
| Madeline Forsythe | | | | |

*Facts that may help you fill this in (confirm them, do not copy blindly):* Felix built the Career Fit Quiz before this project (credit is on the site). The Vibe Coding Log has a "Team member" column for each prompt. The project plan in CLAUDE.md section 10 suggested one owner per page.

## Before you submit

- [ ] Fill in the contributions table above.
- [ ] Fill in the team columns of `VIBE_CODING_LOG.md`.
- [ ] Check the length: 1 to 2 pages.
- [ ] Build the submission zip with `scripts/make-submission-zip.ps1` and open `index.html` from it once.
