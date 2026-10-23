# Implementation Plan

## How the roles work together

### Software Engineer

Turns the product requirements into screens, game rules, data structures, and browser behavior.

### Tester / QA

Checks expected behavior, edge cases, mobile usability, offline behavior, accessibility, and regressions. Automated tests repeat these checks whenever the code changes.

### DevOps

Makes builds repeatable, runs tests on GitHub, publishes successful builds, configures the domain, and provides evidence when deployment fails.

One coding agent may perform all three roles, but the responsibilities and checks remain separate.

## Delivery phases

### Phase 0 — Repository foundation

- Add durable repository guidance and this implementation plan.
- Confirm GitHub connectivity and a clean baseline.
- Acceptance: the planning documents are committed and visible on GitHub.

### Phase 1 — Application foundation

- Create a React, TypeScript, and Vite application.
- Add the player-name screen, category screen, difficulty screen, game screen, results, and score dashboard as navigable application states.
- Acceptance: the app builds and the primary screen flow works with placeholder game data.

### Phase 2 — Tested game engine

- Model levels, grid cells, letter wheels, target words, and solved words.
- Implement word submission, level completion, elapsed-time handling, and timeout behavior.
- Add unit tests before integrating the engine into the interface.
- Acceptance: engine tests cover correct, duplicate, invalid, complete, and timed-out cases.

### Phase 3 — Player progress and scoring

- Save the player name, uniquely solved words, category scores, and completed levels locally.
- Ensure repeated words do not increase the score.
- Acceptance: reload preserves progress and automated tests prove score deduplication.

### Phase 4 — PWA and offline behavior

- Add the web app manifest, install icons, service worker, and offline caching.
- Acceptance: the production build is installable and previously loaded game content works without a network connection.

### Phase 5 — Vocabulary library

- Add more than 1,000 practical words across Food, Travel, Accommodations, and Attractions.
- Validate English words, Thai translations, category, subcategory, and difficulty.
- Build playable levels from compatible word groups; normal levels contain 6–8 words and never exceed 15.
- Acceptance: the data validator passes and every shipped level has a valid grid and letter wheel.

### Phase 6 — Visual design and complete journey

- Apply an original travel-inspired visual system based on the reference mood: scenic backgrounds, bold letter tiles, rounded touch targets, and a thumb-friendly letter wheel.
- Implement success and timeout experiences, including the read-only answer modal.
- Run the critical journey in a mobile-sized browser.
- Acceptance: a new player can enter a name, select a mode, finish or time out, review words, restart, and see correct scores.

### Phase 7 — Continuous integration and GitHub Pages

- Add GitHub Actions to install dependencies, test, build, and deploy the `dist` output.
- Configure GitHub Pages to use GitHub Actions.
- Acceptance: the workflow succeeds and the public `github.io` URL serves the tested build.

### Phase 8 — Custom domain

- Add the chosen domain in GitHub Pages settings.
- Configure DNS records at the domain provider, verify ownership, and enable HTTPS.
- Acceptance: the custom domain resolves to the deployed PWA over HTTPS.
- Dependency: the user must own a domain and have access to its DNS settings.

## Definition of done

The first version is done only when the behavior in `PRODUCT_REQUIREMENTS.md` is implemented, automated tests and the production build pass, the PWA works in a mobile browser, GitHub Pages is live, and any domain work possible with the provided domain access is verified.

