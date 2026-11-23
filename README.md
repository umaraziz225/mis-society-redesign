# MIS Society Website Redesign

MIS 410 (CSUSM, Fall 2026) group project: a mock redesign of the CSUSM MIS Society website.

**Live site:** https://umaraziz225.github.io/mis-society-redesign/
**Repository:** https://github.com/umaraziz225/mis-society-redesign

Status: Stages 1-9 complete (all pages built, full QA pass in `docs/QA_REPORT.md`, published on GitHub Pages). Next: Stage 10 (documentation handoff).

See CLAUDE.md for project context and docs/build-prompts.md for the build stages.

## Opening the site from the folder

Open `index.html` in a browser. No install, server or internet connection is needed (Bootstrap and the icons are in `vendor/`; the font falls back to the system font offline).

## Checking the site (developer tools, not part of the site)

```
npm install --prefix tests                  # once
npm test --prefix tests                     # 500+ browser checks against the folder and a local server
npm run qa --prefix tests                   # everything: audit, HTML validation, links, accessibility, browser checks
BASE_URL=https://umaraziz225.github.io/mis-society-redesign npm run test:live --prefix tests    # the same checks against the live site
node scripts/check-live.js https://umaraziz225.github.io/mis-society-redesign                   # compare every live file with the repo
```
