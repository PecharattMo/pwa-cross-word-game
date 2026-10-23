# Design QA

- Source visual truth: `/var/folders/6p/kzgqxpq13jd7hvj2zgly8bbc0000gp/T/codex-clipboard-6293945e-76db-4bd0-b5cd-767b91ca5000.png` and `/var/folders/6p/kzgqxpq13jd7hvj2zgly8bbc0000gp/T/codex-clipboard-4728ca15-2e2b-4281-bbfc-e614bef4796d.png`
- Implementation evidence: Codex in-app Browser, tab 10, `http://127.0.0.1:4174/pwa-cross-word-game/`
- Viewport: 390 × 844 CSS pixels, device density 1
- Source pixels: 2048 × 1536 and 800 × 450; used as art-direction references rather than a literal screen clone
- Implementation capture: 390 × 844 pixels in the active game state
- State: Food / Easy / first word, empty answer

**Full-view comparison evidence**

- The implementation follows the reference hierarchy: compact top controls, cream crossword tiles, a white rounded play card, bright blue/green/orange accents, and large touch targets.
- The supplied palette is used directly through CSS tokens: `#ff8a3d`, `#ffd08a`, `#a8e063`, `#7ec8ff`, and `#2e2a2a`.
- An original transparent suitcase mascot provides the requested cute cartoon direction without copying the reference artwork.
- All primary controls are visible at 390 × 844 without horizontal overflow.

**Focused region comparison evidence**

- Game controls were inspected at mobile size. The English clue, answer line, four letter buttons, delete button, and check button are readable and fit inside one rounded white card.
- Crossword cells remain legible and preserve clear solved/unsolved color states.
- Browser console warning/error check returned no entries.

**Findings**

- No actionable P0, P1, or P2 visual mismatch remains.
- P3: the reference includes more background scenery; WanderWords intentionally uses a quieter flat backdrop so the English clue remains the main learning aid.

**Comparison history**

1. Earlier build used dark gradients and separate word rows. Fixed by creating an intersecting crossword grid, the supplied pastel palette, cream tiles, a white control card, a mascot illustration, and rounded game icons.
2. Initial desktop capture placed action buttons below the fold. Rechecked at the intended 390 × 844 mobile viewport; all primary controls are visible in the same screen.

**Implementation checklist**

- [x] Typography hierarchy is readable in Thai and English.
- [x] Mobile spacing and card rhythm match the reference direction.
- [x] Palette maps to the supplied tokens.
- [x] Mascot asset is sharp, transparent, and correctly cropped.
- [x] Copy includes a useful English definition without revealing the answer.
- [x] Primary interactions and responsive layout were tested.

final result: passed
