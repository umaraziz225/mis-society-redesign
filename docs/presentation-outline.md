# Presentation outline (8 to 10 minutes, plus Q&A)

**Target: 9 minutes of talking** (about 9:30 with hand-offs), leaving time for questions. The assignment asks for: the problem and audience, a demo, the CSS and Bootstrap choices, desktop versus mobile, one AI example and how it was tested, and one challenge and what was learned. Everyone needs a clear part.

The facts below are filled in. The parts marked **TEAM** are yours to write in your own words.

## Speaking plan: one slot for each of the five members

| Slot | Section | Time | Presenter (fill in) |
|---|---|---|---|
| 1 | Problem and audience | 1:15 | |
| 2 | Demo, part 1: Home, Student Toolkit, Careers and the quiz | 2:00 | |
| 3 | Demo, part 2: Events, About, Join | 1:30 | |
| 4 | CSS and Bootstrap choices, then desktop versus mobile | 2:00 | |
| 5 | One AI example and how we tested it | 1:15 | |
| (any) | One challenge and what we learned | 1:00 | TEAM: whoever lived it, or all five in one sentence each |

*Suggestion, not a rule:* Felix built the quiz, so slot 2 fits him. CLAUDE.md section 10 suggested one owner per page; use that if it matches what happened.

## 1. Problem and audience (slot 1, 1:15)

- The club's current site is hard to use: empty Events and Join pages, a placeholder heading, a link that goes nowhere, an Instagram icon that links to LinkedIn.
- Challenge statement (say it out loud): *How might we help CSUSM business and MIS students find the tools, careers, and community they already have access to, and see why the MIS Society is worth joining?*
- Four audiences and what each needs first: new and transfer students, current students, prospective members, employers and speakers.
- Our approach: useful to non-members first, so joining feels like the next step.

## 2 and 3. Demo path (slots 2 and 3, 3:30 in total)

Open the live site: https://umaraziz225.github.io/mis-society-redesign/ (have `index.html` from the folder open in another tab as a backup).

| Step | Do this | Say this |
|---|---|---|
| Home | Scroll the hero, point at the two buttons, click the carousel arrow once | The page says what it is for right away. The events are labeled "Sample" because the club has no confirmed calendar. |
| Student Toolkit | Click the **AI** filter, open "How to get it" on ChatGPT Edu | Every card links to the official page and shows when it was checked. We caught that ChatGPT Edu now has usage limits, which our brief did not say. |
| Careers | Click "Take the Career Fit Quiz" | Felix's quiz, restyled. Its scoring code is unchanged and a test proves it. |
| Quiz | Answer a few questions by pressing 1 to 5, then skip ahead to a prepared result, or open `docs/screenshots/state-quiz-results-1280.png` | It matches you to 12 career families and cites BLS outlook data. |
| Events | Open one **Details** pop-up, then **RSVP**. Close with Esc | RSVP never pretends to register anyone. It says how the club shares RSVPs. |
| About | Scroll the timeline and the officer cards | Officers and links come from the club's current site. |
| Join | Click **Send my interest** with the form empty, then fill it in and submit | Errors are read to screen-reader users. The notice says nothing was sent. We never show a fake "you're registered". |
| Phone | Resize the window to phone width and open the menu | The same site, one column, hamburger menu. |

**If the internet or the projector fails:** use the folder copy, or the screenshots in `docs/screenshots/`.

**Do not say:** that the events are real, that the form joins you to the club, or that facts about the club's fee or meetings are on the site (they are not; we do not have them).

## 4. CSS and Bootstrap choices (slot 4, about 1:00 of the 2:00)

- **One stylesheet, one place for colors.** `css/style.css` starts with CSS variables (navy `#002D72`, blue `#0B5FB0`, one amber accent `#F2A900`). Every text and background pairing has its contrast ratio written next to it, and all pass 4.5:1.
- **Beyond default Bootstrap:** we overrode the navbar (white, thin border, amber "Join" pill), buttons (rounded, one accent color), cards (rounded, soft shadow, hover lift that respects "reduce motion"), badges, accordion, tables, and form fields.
- **Custom pieces:** a hero with a dot-grid gradient, a history timeline made from a plain list, a numbered stepper made with CSS counters.
- **14 Bootstrap components:** navbar, grid, cards, buttons, button group, badges, carousel, accordion, collapse, modals, alerts, tables, forms, progress bar.
- **Bootstrap is included in the folder**, so the site works from a double-click with no internet.

## 4. Desktop versus mobile (slot 4, about 1:00)

Show these screenshots from `docs/screenshots/` side by side:

| Idea | Desktop | Mobile |
|---|---|---|
| Layout reflows | `index-1280.png` | `index-375.png` |
| Navigation | the full bar | `state-mobile-menu-375.png` (hamburger) |
| Tablet in between | `toolkit-768.png` (two columns) | |
| Tables | `events-1280.png` | the table scrolls inside its box (`events-375.png`) |
| Pop-ups | `state-events-modal-1280.png` | `state-events-modal-375.png` |
| Forms | `state-join-demo-notice-1280.png` | `state-join-errors-375.png` |

Talking points: the grids reflow: the officer cards go from 4 columns to 3 to 2, and the "What is MIS?" tiles from 4 to 2 (these show it best). The hamburger appears below 992 px. Wide tables scroll inside their own box so the page never scrolls sideways. We checked seven widths from 320 to 1440 px.

## 5. One AI example and how we tested it (slot 5, 1:15)

**TEAM: pick one and tell it in your own words.** Three good entries in `VIBE_CODING_LOG.md`:

| Log entry | The story | Why it works for the talk |
|---|---|---|
| **#5, Student Toolkit** | The AI was told to check every official page before writing the cards. It found four claims in our own brief that were out of date or unsupported (for example "higher limits" for ChatGPT Edu, "renewable yearly" for Azure). The cards say what the official pages say now. | Shows checking AI output and our own notes against real sources. |
| **#6, Careers and quiz** | The AI copied Felix's quiz without changing his scoring. A test compares fingerprints of his files. Screenshots then caught our own CSS turning his "Strong match" badge into a huge pill because two classes had the same name. | Shows a test, a bug found by looking, and a fix. |
| **#10, Full QA pass** | Our audit scripts had bugs themselves (a wrong pattern, a check that could never fail). Scanning interactive states, not just page loads, found issues that page-only scans missed. | Shows "don't trust the first result", and how we tested. |

Also available: **#3** (the first tests found that Bootstrap hid the keyboard focus ring on the navigation).

For whichever you choose, answer four questions: what did you ask, what did the AI do, what did you accept, change, or reject, and how did you test it. **The accepted, changed, rejected and learned columns in the log are the team's to write.**

Numbers you can quote: 513 automated browser checks pass on the folder and on a local server, and 225 pass on the live site; an accessibility scan found no violations on 7 pages and 11 interactive states.

## 6. One challenge and what we learned (1:00)

**TEAM: write this.** Prompts to help you choose (use one that really happened to you):

- Something that worked locally but not for another reason (for example, Windows ignores letter case in file names and GitHub Pages does not, so we added a check).
- A fact we could not verify and had to leave out instead of guessing.
- Putting a teammate's quiz into a different design without changing how it scores.
- A tool that the AI wrote correctly the first time versus one that needed three rounds.

End with one sentence about what you would do differently.

## Q&A preparation

| Likely question | Short answer |
|---|---|
| Is this the club's real site? | No. It is a student-built prototype the club could adopt. The club supports the project. |
| Are the events real? | No. They are a labeled sample because the club has no confirmed calendar. |
| Does the form work? | It is design only and says so. Nothing is sent. |
| How do you know the tool facts are right? | We checked each official page on November 22, 2026 and show the date on every card. |
| What is missing? | The membership fee and meeting times, the club's Instagram link, event photos, and an alumni list. All are in `MISSING_CONTENT.md`. |
| Does it work without JavaScript? | Every page reads fine. The quiz, filters, pop-ups, and form need it to be interactive. |
| What did the AI get wrong? | See your chosen log entry. Be specific. |

## Rehearsal checklist

- [ ] Time the full run; cut the demo before cutting the others.
- [ ] Each person says their own slot out loud once.
- [ ] Open the live site and the folder copy before you start.
- [ ] Have the screenshots folder open as a backup.
- [ ] Decide who answers which kind of question (design, code, AI process, content).
