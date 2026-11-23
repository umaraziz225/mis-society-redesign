# QA report (Stage 8, November 22, 2026)

Full pass over the site against CLAUDE.md section 3. Everything below was run by script on the real files; nothing here is a guess.

**How to re-run everything:** `npm run qa --prefix tests` (static audit, HTML validation, link check, full axe scan, then the 513-check browser suite). Screenshots: `npm run qa:screenshots --prefix tests`.

## Result: all nine areas pass

| # | Area | Result | Evidence |
|---|---|---|---|
| 1 | Rubric checklist | PASS | `scripts/qa-static.js`: 29 of 29 checks. Six linked pages plus the quiz; `header`, `nav`, `main`, `section`, `footer` on every page; one custom CSS file (`css/style.css`) on every site page; Bootstrap grid on every page. |
| 2 | No placeholder text | PASS | No lorem, ipsum, coming soon, TBD or "Heading" in visible text on any page or in the quiz data; every `NEEDS CONTENT` is inside an HTML comment and logged in `MISSING_CONTENT.md`; no empty headings. The browser suite re-checks visible text on every page. |
| 3 | Accessibility | PASS | axe-core at every impact level: **0 violations** on 14 page loads (folder and server) and 11 interactive states (open modals, form errors, demo notice, quiz questions and results, open FAQ, mobile menu). One h1 per page, headings in order, alt on every image, labels on every field, visible focus, contrast checked by axe. |
| 4 | HTML validity | PASS | `html-validate` with **every** recommended rule on: 0 problems on 7 pages. |
| 5 | Links | PASS | `scripts/check-links.js`: 187 internal links, anchors and assets resolve; 52 distinct external links, 36 return 200/3xx, 16 are LinkedIn and PMI pages that block scripts (warnings, open once by hand). Nothing broken. |
| 6 | Responsive | PASS | 14 page loads at 375, 768, 1280 plus 320, 992, 1024 and 1440 px: no horizontal overflow; navbar stays on one row from 992 px up. Screenshots of every page at 375, 768 and 1280 px, plus 9 interactive states, are in `docs/screenshots/` and were looked at. |
| 7 | Works from the folder | PASS | Every page and the whole quiz run over `file://` and over a local server in the browser suite. No absolute `/` paths, no `fetch()`/XHR, no CDN scripts (Bootstrap and icons are in `vendor/`). |
| 8 | JavaScript off | PASS | Every page is readable with JavaScript disabled. Toolkit filters hide and all cards show; accordions and "How to get it" steps stay open; the Join form is replaced by a note with the club email; modal buttons are hidden. The quiz shows a notice and Careers still lists everything. |
| 9 | Consistency | PASS | Header and footer are identical on all pages (the quiz uses `../` paths); titles all follow `<Name> \| MIS Society at CSUSM`; same scripts on every page; exactly one correct current page marked in the navbar on each page. |

## Bootstrap components in use (3 needed; there are 14)

| Component | Where |
|---|---|
| Navbar (hamburger on phones) | every page |
| Grid (`container`, `row`, `col-*`) | every page |
| Cards | every page |
| Buttons (custom-styled) | every page |
| Button group | Student Toolkit (filter bar) |
| Badges | Home, Student Toolkit, Events |
| Carousel | Home (sample events) |
| Accordion | Careers (internship tips), Join (FAQ) |
| Collapse | Student Toolkit ("How to get it"), accordions |
| Modal | Events (6 detail modals, 1 RSVP modal) |
| Alerts | Events (sample notice), Join (demo notice), quiz |
| Tables (`table-responsive`) | Careers (certifications), Events (schedule) |
| Forms (`form-control`, `form-select`, `form-check`, validation) | Join, quiz |
| Progress bar | quiz |

User-focused features (1 needed; there are 7): the Career Fit Quiz, Toolkit category filters, the Join interest form, FAQ accordion, the sample Events schedule with details and RSVP modals, the certifications table, and the internship tips.

## Fixes made in this stage

1. **Quiz question screen had no h1** (axe, moderate). Added a visually hidden `h1` to that screen in `quiz/index.html`.
2. **Quiz results skipped a heading level** (axe, moderate): an `h3` came straight after the `h1`. Added a visually hidden `h2` ("Your top matches") before the cards. Felix's scripts are unchanged.
3. **HTML validation tightened.** Turned on the eight stylistic rules the test suite had switched off. Fixed what they found: `<!DOCTYPE html>` in uppercase on six pages, and the Home carousel is now a native `<section>` instead of `<div role="region">`. Three comments in Felix's quiz markup disable two rules for his progress bar and one for the question heading his script fills in.
4. **Events table scrolled sideways by a few pixels at 768 px**, clipping the Details buttons. Lowered its minimum width so it fits on tablets and desktops (it still scrolls inside its box on phones). New test.
5. **New checks:** extra widths (320, 992, 1024, 1440 px), navbar on one row at desktop widths, the quiz question screen has exactly one h1.
6. **New dev tools** (in `scripts/`, not part of the site): `qa-static.js`, `validate-html.js`, `check-links.js`, `axe-report.js`, `screenshots.js`.

(Earlier stages' fixes are in the Vibe Coding Log: shared link color, focus rings, form borders, the quiz badge collision, the page that scrolled sideways, and others.)

## Known limitations and things only a person can check

- **Only Microsoft Edge (Chromium) was used.** Not tried in Safari or Firefox, and not on a physical phone or with a real screen reader. The accessibility attributes are tested, but not heard.
- **LinkedIn and PMI links** block scripts, so 16 links are only "warnings". Open the officer LinkedIn links and the three PMI certification links by hand once. ASQ links passed in the last run.
- **Google Fonts** (Inter) loads from the internet. Offline, the site falls back to the system font and everything still works.
- **Alt text:** the Home hero logo has the alt text "MIS Society at CSUSM logo". The logos in the navbar and footer have `alt=""` because the words "MIS Society" sit right beside them. There are no photos yet, so there is no other alt text to review.
- **The quiz adds two extra CSS files** (`quiz/css/style.css` is Felix's, `quiz/css/quiz-site.css` maps it onto the site). The rubric's "one external CSS file" holds for all six main pages.
- **Quiz needs JavaScript.** Without it the page explains that and Careers still shows the same information.
- **Not run:** `pa11y` (it downloads its own browser; axe-core in Edge is the same engine family) and the W3C online validator (it would send the pages to an outside service; `html-validate` was used instead).
- **Open content questions** are in `MISSING_CONTENT.md` (membership rules, Instagram link, event photos, real dates, alumni, and others). None is visible on the pages.

## To review by eye

Overall look and colors, the wording on every page, the logo on the navy footer, and the screenshots in `docs/screenshots/` before using them in the presentation.
