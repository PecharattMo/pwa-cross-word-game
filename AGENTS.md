# Repository Guidance

## Purpose

Build an offline-first English vocabulary word-connect game for Thai-speaking travelers. `PRODUCT_REQUIREMENTS.md` is the source of truth for product behavior.

## Product boundaries

- Version 1 is a client-only Progressive Web App.
- Do not add accounts, passwords, a backend, cloud synchronization, ads, purchases, or multiplayer.
- Store the player name, scores, completed levels, and uniquely solved words in browser-local storage.
- A word awards one point only the first time that player solves it.
- A level is passed only when every target word is solved before time expires.
- Preserve the four categories and three timed difficulty modes defined in `PRODUCT_REQUIREMENTS.md`.

## Technical direction

- Use React, TypeScript, and Vite.
- Keep game rules in framework-independent TypeScript modules where practical.
- Use Vitest for unit tests and Playwright for the critical mobile journey.
- Use a service worker and web app manifest for installability and offline play.
- Deploy the production build to GitHub Pages through GitHub Actions.
- Prefer small, focused modules and descriptive names over clever abstractions.

## Quality requirements

- Work mobile-first while remaining usable on desktop.
- All primary controls must be keyboard accessible and have visible focus states.
- Do not communicate state by color alone.
- The timer must use elapsed time rather than assuming every interval fires exactly on schedule.
- Validate vocabulary data for duplicate words, missing translations, invalid categories, and invalid difficulty values.
- Never claim a test, build, offline check, or deployment passed unless it was actually observed.

## Working agreement

- Explain each phase in plain language before making material changes.
- Check `git status` before commits and keep unrelated work out of the commit.
- Run the focused tests first, then the broader verification commands.
- Commits, pushes, deployments, DNS changes, and credential changes are distinct operations and must be reported separately.

