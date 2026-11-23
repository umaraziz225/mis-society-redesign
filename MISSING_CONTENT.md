# Missing Content

Facts we still need. Never invent them. Where a fact would go on a page, leave an HTML comment `<!-- NEEDS CONTENT: ... -->` instead of visible text.

## Must confirm before Dec 8

- [ ] **Membership fee, eligibility, meeting times and location** (join.html FAQ, join.html steps)
- [ ] **Real Instagram URL** (footer on every page): the current site's Instagram icon links to LinkedIn.
- [ ] **Instructor answer on JavaScript** (careers.html quiz, resources.html filters, join.html form): if not allowed, swap quiz for an external link and use static sections.

## Should confirm

- [ ] **Spelling of Zech's name**: "Zachariah Yamsuan" (current site) vs. "Zechariah" (brief) (about.html)
- [ ] **Real past speakers or company visits with dates** (events.html)
- [ ] **Event photos with permission** (events.html past-events gallery, not built yet)
- [ ] **Real Spring 2027 event dates** (index.html carousel, events.html): sample schedule is labeled until then

## Not yet verified for the Student Toolkit (resources.html)

Don't publish until checked: LinkedIn Learning, Tableau for Students, Microsoft exam discounts, Career Center tools (Handshake, resume review), Library resources (O'Reilly, etc.).

## Added in Stage 1

- [ ] **Logo on the navy footer** (every page, footer): the logo is a black hexagon with a purple-to-cyan border, not blue and white. It sits on white in the navbar and on navy in the footer. Ask the club whether a white or blue version exists.
- [ ] **Real Instagram URL**: an HTML comment marks the spot in every page's footer (same item as above).

## Added in Stage 2

- [ ] **Real event dates**: the Home carousel shows three sample events, labeled "Sample schedule". Replace them when the club confirms Spring 2027 dates (same item as the Events list above).
- [ ] **Quiz length**: the Home page says "about 7 minutes", taken from the quiz's own README. Confirm if Felix changes the quiz.

## Added in Stage 3

- [ ] **Microsoft 365 details not confirmed by CSUSM**: "Copilot inside the apps" and the "drop cougars from the address" sign-in tip were not on CSUSM's pages, so they are left out. The card says only what CSUSM's pages say (sign in at Office.com with your campus username and password).
- [ ] **Adobe redemption steps**: the card points to CSUSM's Adobe page for the exact steps; the page text confirms redemption codes but the card does not spell out the steps.
- [ ] **Re-check all Toolkit and campus links the week before Dec 8** (ChatGPT Edu limits are changing; custom GPTs are retired Feb 11, 2027 per the CSUSM page).
- [ ] **Good-for badges and "Free for verified students" label** are the team's editorial choices, not from the official pages. Review the wording.

## Added in Stage 4

- [ ] **Two certification links could not be loaded by a script** (careers.html): ASQ and PMI block automated requests (403). Their page URLs were confirmed through search results, not by opening them. Open each link once by hand: ASQ Yellow Belt, ASQ Green Belt (points to ASQ's Six Sigma catalog because no direct Green Belt page was found), PMI CAPM, PMI-CPMAI (points to PMI's CPMAI FAQ page), PMI PMP. The IASSC link goes to its home page; no certification-level page was found.
- [ ] **Careers page copies the quiz's data** (careers.html): the 12 family cards and the certification table were generated from quiz/js/data.js and are plain HTML. If Felix changes data.js, update careers.html too. The automated test fails when they differ.
- [ ] **Quiz font and header changed** (quiz/index.html): the quiz now uses the site's Inter font and the site's navbar and footer, not its own Plus Jakarta Sans and header. Felix's files are unchanged apart from quiz/index.html (diff in docs/quiz-changes.diff).
- [ ] **Quiz needs JavaScript**: without it, the quiz page shows a notice and the Careers page still lists everything. Decide after the Nov 24 meeting whether to keep the copy in quiz/ or only link to the live version.
- [ ] **Credit wording**: "Career Fit Quiz built by Felix Gross" appears on careers.html and in the quiz page. Confirm Felix is happy with the wording and with the site using his quiz copy.

## Added in Stage 5

- [ ] **Past events photo gallery** (events.html): not built. An HTML comment marks the spot. It needs real photos from past events, with permission from the people in them.
- [ ] **Real Spring 2027 events** (events.html, index.html carousel): the six events, their months, and the "Who it's for" values are a labeled sample. In particular, which events are "Open to all students" and which are "Members" was chosen for the demo, not supplied by the club. Replace the rows, cards and modals, and remove the "Sample" alert and badges, when the club confirms its calendar.
- [ ] **How RSVPs really work** (events.html): the RSVP modal says the club posts RSVP links on LinkedIn and by email. That wording comes from the project brief; confirm it matches what the club does.
- [ ] **Event descriptions** (events.html): the "what you walk away with" lines are general and written for the sample events, based on the club's stated perks. Review the wording.

## Added in Stage 6

- [ ] **Where our alumni work** (about.html): not built. The current site shows unnamed company logos only. Needs company names the club can confirm.
- [ ] **Dr. Fang's contact details and bio** (about.html): the current club site publishes her email, phone and a research bio. They are not copied here; add them only with her permission.
- [ ] **Officer permissions** (about.html): all 12 officers and LinkedIn links come from the current club site. Each officer should confirm they are happy to be listed (CLAUDE.md section 11).
- [ ] **Name spelling** (about.html): "Zachariah Yamsuan" follows the current site; the brief says "Zechariah". Zech to confirm (already flagged).
- [ ] **ASI wording** (about.html): the page says "ASI at CSUSM" as the current site does. Confirm whether to spell it out (Associated Students, Inc.).


## Added in Stage 7

- [ ] **Real membership rules** (join.html FAQ): the answers to "Do I have to be an MIS major?", "Is there a membership fee?" and "When and where do meetings happen?" all say to email the club or follow it on LinkedIn, because we do not have the real rules. Replace them with the club's actual answers (same as the "Membership fee, eligibility, meeting times and location" item above). HTML comment `NEEDS CONTENT` marks the spot.
- [ ] **How officer openings are announced** (join.html FAQ): the answer says roles open periodically and to email about openings. Confirm how and when the club really does this, and whether the current board list is complete.
- [ ] **Where real form submissions should go** (join.html): the interest form is design only and sends nothing. If the club adopts the site, decide where submissions go (a Google Form, an email, or a service).
- [ ] **Employer and speaker process** (join.html): the page only promises that people can email the club. Add the real process (who replies, how far ahead to ask) if the club has one.
- [ ] **Interest-form fields** (join.html): the Year choices (First year to Graduate student) and the five Interests are the team's picks; confirm they match what the club wants to ask.