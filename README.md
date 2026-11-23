# MIS Society Website Redesign

A mock redesign of the **CSUSM MIS Society** website, built for **MIS 410 (CSU San Marcos, Fall 2026)** with HTML, one custom CSS file, Bootstrap 5, and a documented "vibe coding" process.

**Live site:** https://umaraziz225.github.io/mis-society-redesign/
**Repository:** https://github.com/umaraziz225/mis-society-redesign

## Team

Umar Aziz, Felix Gross, Luis Quinonez, Zachariah Yamsuan (spelling to be confirmed), and Madeline Forsythe.

## Purpose and audience

The challenge: *How might we help CSUSM business and MIS students find the tools, careers, and community they already have access to, and see why the MIS Society is worth joining?*

The site is useful to non-members first, so that joining feels like the natural next step. It is written for:

| Audience | What they find first |
|---|---|
| New and transfer students | What MIS is, the free tools they already have, how to get involved |
| Current MIS and business students | Events, certifications, career paths, the career quiz |
| Prospective members | Benefits of joining, how joining works, the interest form |
| Employers and guest speakers | Who to contact and ways to work with the club |

This is a student-built prototype that the club could adopt later. It is not the club's official website.

## Pages

| Page | File | What it does |
|---|---|---|
| Home | `index.html` | States the site's purpose, explains MIS, previews the free tools and sample events, and points to the quiz and the Join page. |
| Student Toolkit | `resources.html` | Six free CSUSM student tools with filters, "how to get it" steps, and official links, plus more campus resources. |
| Careers | `careers.html` | Twelve MIS career families, certifications with vendor links, internship tips, and the Career Fit Quiz. |
| Career Fit Quiz | `quiz/index.html` | Felix's quiz, restyled to match the site. It matches your answers to the twelve career families. |
| Events | `events.html` | A clearly labeled **sample** Spring 2027 schedule with details and RSVP pop-ups. |
| About | `about.html` | Mission, history timeline, faculty advisor, and the twelve student officers. |
| Join | `join.html` | Benefits, three steps to join, a design-only interest form, FAQ, and contact for employers and speakers. |

## How to open it

- **From the folder:** double-click `index.html`. No install, server, or internet connection is needed. Bootstrap and the icons are included in `vendor/`. If you are offline, the page uses your computer's own font instead of Inter.
- **Online:** https://umaraziz225.github.io/mis-society-redesign/

## Tech used

- HTML5 with semantic tags, one custom stylesheet (`css/style.css`), and a small amount of vanilla JavaScript (`js/main.js`).
- **Bootstrap 5.3.9** and **Bootstrap Icons 1.13.2**, included locally in `vendor/`. No CDN scripts, no build step, no backend.
- **Inter** from Google Fonts, with a system-font fallback.
- Bootstrap components: navbar, grid, cards, buttons, button group, badges, carousel, accordion, collapse, modals, alerts, responsive tables, and form validation.
- Developer tools (only in the GitHub repo, not part of the site): Node.js, Playwright with Microsoft Edge, axe-core, and html-validate.

What the JavaScript does: the footer year, the Toolkit category filters, the Join form check and demo notice, closing the mobile menu with Escape, opening the FAQ answer a link points to, and Felix's quiz. Every page still reads fine with JavaScript off.

## Folder structure

```
index.html  resources.html  careers.html  events.html  about.html  join.html
css/style.css          the one custom stylesheet, with a section per page
js/main.js             the site's small script
images/                the club logo
vendor/                Bootstrap and Bootstrap Icons, included locally
quiz/                  the Career Fit Quiz (see credits)
VIBE_CODING_LOG.md     the AI process log
docs/                  summary and presentation outlines (the GitHub repo also has the
                       QA report, screenshots, and the build prompts)
tests/  scripts/       developer checks (GitHub repo only)
```

## Credits

- **Career Fit Quiz built by Felix Gross.** The scoring logic and content (`quiz/js/`) are unchanged from his project: https://github.com/FelixDoesMIS-csusm/mis-career-quiz. His live version: https://felixdoesmis-csusm.github.io/mis-career-quiz/. The only edits are in `quiz/index.html` (the site's navbar and footer, paths, and heading fixes) and a new `quiz/css/quiz-site.css`.
- Club name, logo, officer names, and mission come from the current MIS Society site (https://www.csusmmissociety.com) with the club's support.
- Free-tool facts come from CSUSM, Microsoft, and GitHub pages, checked on November 22, 2026.
- The site was built with the help of Claude (Anthropic) using the prompts in `docs/build-prompts.md` and logged in `VIBE_CODING_LOG.md`.

## Checking the site (developer tools, GitHub repo only)

```
npm install --prefix tests          # once
npm test --prefix tests             # 500+ browser checks against the folder and a local server
npm run qa --prefix tests           # also the audit, HTML validation, link check, and accessibility scan
BASE_URL=https://umaraziz225.github.io/mis-society-redesign npm run test:live --prefix tests
```

## Known limitations

These come from `MISSING_CONTENT.md`, which lists everything the team still has to confirm.

- **The events are samples.** The club has no confirmed Spring 2027 calendar, so the schedule, the "who it's for" labels, and the event descriptions are examples. They are labeled "Sample" on the pages. The RSVP buttons open a pop-up that explains how RSVPs work. They never register anyone.
- **The Join form is design only.** It checks the fields and then shows a notice that nothing was sent. To join for real, email csusmmissociety@gmail.com.
- **Some club facts are unknown.** The membership fee, who can join, and when and where meetings happen are not on the pages. The FAQ points to email instead. The club's Instagram link is missing.
- **No event photos yet.** The past-events gallery and the "where our alumni work" section are not built, because they need real photos and company names the club has approved.
- **Some links cannot be checked by a script.** LinkedIn, ASQ, and PMI block automated checks, so those links need a quick look by hand.
- **Some tool facts change.** The Toolkit facts were checked on November 22, 2026. ChatGPT Edu's limits, in particular, are changing, so re-check them before Dec 8.
- **The quiz needs JavaScript.** Without it, the quiz page explains that, and the Careers page still shows the same information.
- **Tested in Microsoft Edge only.** Not yet tried in Safari or Firefox, on a physical phone, or with a screen reader.
