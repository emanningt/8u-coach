# 8U Coach

A complete static coaching app for one head coach and one assistant coach. No accounts, backend, subscriptions, build dependencies, or third-party runtime requests.

## Use it

- **Portable app:** open `8U-Coach.html` in a desktop browser. Everything is included in this file. Local-file storage depends on the browser; iOS Files previews may not execute HTML apps.
- **Hosted app:** publish the source to GitHub Pages, open the URL in iPhone Safari, and use Share → Add to Home Screen. Wait for **Settings → Offline ready** after the first online load.
- Set **Our League** rules before using game timers. Add the roster under **Team**. Pick the next session under **Practices**.
- Use one device as the game-time record. The other coach can follow practices and responsibilities independently. Data does not sync between devices.

## Included

- Five main tabs: Today, Practices, Game Day, Team, Rules.
- Ten core practices and two optional practices, each with a 60-minute plan.
- Forty-one drill guides with setup, schematic diagram, equipment, instructions, cues, success, common mistakes, assistant role, easier/harder and attendance variations.
- Live practice: previous, pause/resume, next, skip, add a minute, water break, progress, and automatic local persistence.
- Game-day arrival, warm-up, lineup, rotations, coaching, halftime, and postgame.
- Local roster, attendance, on-field/resting lists, coach-confirmed rotation suggestions, approximate time, periods, and position exposure.
- Local league settings kept separate from AYSO reference guidance. Unknown values remain **CONFIRM WITH LEAGUE**.
- Coach role preference, editable huddle, next game details, equipment checklists, safety, and hot-day reminders.
- Relative asset paths, manifest, PNG icons, and service worker for GitHub Pages/PWA use.

## Important behavior

- Timers use timestamps, not a count of browser ticks. Refreshing or locking the phone does not silently restart a running timer.
- Practice expiry pauses on the current activity. The coach chooses the next activity; it never skips ahead automatically.
- Water pauses the activity and shows a one-minute break timer. A coach ends the break, even if the break timer reaches zero.
- Next/skip/previous start the selected activity from its planned duration. Finishing asks for confirmation and records completion.
- Plan remaining includes the current and future activities. Added minutes and extra water breaks may extend the actual session beyond 60 minutes.
- Game clock starts only after format and at least one on-field player are set. Format requires players per side, goalkeeper, total minutes, and halves/quarters.
- Game time stops at the configured period length even if the phone was locked. The coach moves to the next period. It does not infer referee stoppages: pause manually when appropriate.
- Periods played means any tracked participation in that period, not a full period completed. Position exposure records a role only while time is running.
- Minimum playing time and substitution procedure are displayed exactly as entered. The app does not certify compliance with a league’s interpretation; suggestions prioritize less playing time and require confirmation.
- Changing the core game format asks before clearing the current game record. Starting a new game also asks before resetting it.
- Hot day mode emphasizes water, shade, and shorter bursts; it does not make a medical or weather safety decision.
- Player names exist only in localStorage. Clearing website data/private browsing can lose saved data. Avoid entering sensitive information.
- Use a single active tab for time tracking. This is not a multiuser synchronization system.

## GitHub Pages

The repository is ready for GitHub Pages but has **not been published**. The connected GitHub tools did not expose repository creation or Pages settings, and no target repository URL was supplied.

Owner action:

1. Create/connect a GitHub repository for this project and provide its URL to the coding agent (or upload the project files to its `main` branch).
2. In repository **Settings → Pages → Build and deployment**, choose **GitHub Actions**. The included `.github/workflows/pages.yml` publishes on pushes to `main` or manual dispatch.

No custom domain, secrets, paid hosting, or server is needed. GitHub account/plan restrictions on Pages may apply. Do not upload a real roster or browser localStorage dump.

If the repository already uses another branch name, adjust the workflow’s branch filter. All application paths are relative and were tested under a project subdirectory.

## Local development

From the project directory:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/`. A local HTTP server permits service-worker testing; a `file:` URL does not.

Files:

- `index.html`, `styles.css`, `app.js`: application shell, styling, interaction/state logic.
- `data/practices.js`: season sequence and activity durations.
- `data/drills.js`: all drill descriptions.
- `data/rules.js`: configurable field definitions and reference profile.
- `data/coaching-cues.js`: reusable cues, checklists, and sources.
- `sw.js`, `manifest.json`, `assets/`: offline installation assets.
- `build-standalone.py`: rebuilds `8U-Coach.html` from the source.
- `tests/`: browser checks; test players are synthetic and created only during tests.
- `TEST_REPORT.md`: coverage and remaining platform/deployment checks.

After changing source, run `python3 build-standalone.py`. When releasing changes, increment the cache version in `sw.js` so installed clients refresh their core files.

## Tests

Tests require Node and Playwright only in the development environment; the app itself has no dependency on them.

```sh
npm install --no-save playwright
npx playwright install chromium
BASE_URL=http://localhost:8000/ node tests/smoke.cjs
BASE_URL=http://localhost:8000/ node tests/final-check.cjs
```

Create `test-results/` first if needed. Optional `CHROMIUM_PATH` selects an existing Chromium binary. Both scripts use fresh isolated browser contexts. Test output and screenshots are ignored by git.

## Coaching source notes

The curriculum follows the supplied handoff. Drill wording and diagrams are original adaptations, not official licensed session plans. Activity grids are starting points and may be adjusted to player numbers, ability, space, and safety. Practices avoid long queues and permanent elimination.

The U.S. Soccer U7/U8 guide, AYSO 8U reference, U.S. Soccer weather resource, and CDC HEADS UP response guidance were reviewed on September 25, 2026. Links appear in Coach Tools. League rules always need local confirmation. Physical iPhone/Safari and real-league sideline acceptance are still required before relying on the app at a match.
