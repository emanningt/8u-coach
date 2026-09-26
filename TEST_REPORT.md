# Validation report — 8U Coach V1

## Passed

Automated checks ran in isolated headless Chromium 153 contexts at 320px and 390px phone widths and 1440px desktop width.

- Twelve plans; every plan totals 60 minutes; 41 drills include all required guidance fields.
- All five navigation tabs, tools, safety, settings, league setup, and all 72 practice activity routes.
- Phone layouts without document-level horizontal overflow.
- Live timer pause/resume, previous/next/skip, extra minute, water break, expiry, refresh persistence, completion, and next-practice progress.
- Hot-day preference and assistant-coach preference persistence.
- League settings persistence and Practice 11 reading configured restarts; unknown rules stay unconfirmed.
- Six synthetic players added, saved, and restored; attendance and editing; HTML in a name renders as text, not code.
- Four-player lineup, suggested rotation requiring confirmation, real substitution, playing-time distribution, and paused time not counting.
- Period transitions, period participation, and timestamp recovery capped at the current period length.
- All seven game-day stages.
- Manifest contents, service-worker installation and complete core-cache readiness.
- Browser offline reload and navigation to practice content after disabling network access.
- Assets and routing under `/8u-coach/`, equivalent to a GitHub project Pages subdirectory.
- Standalone HTML opens from a local file without external CSS, scripts, or content assets; practice completion survives reload.
- Final live mode hides normal navigation. Roster rows were widened after screenshot review; player-name width is checked.
- 200% text scaling check on the game-day screen.
- No JavaScript page errors observed in the browser suites.

Visual review included Today (phone/desktop), Live Practice, and Rotations. Navigation specificity and cramped roster rows were fixed during validation.

## Not verified / not deployed

- Physical iPhone Safari, Add to Home Screen, iOS background eviction, and browser-specific private-mode persistence. Chromium emulation is not a Safari certification.
- Real-device outdoor readability, touch usability, and a live-team sideline rehearsal.
- Real GitHub Actions execution / GitHub Pages URL: no remote repository was created or supplied. Workflow and relative-path readiness are implemented; publication remains pending.
- An actual local league rule set. No league rules or real players are prepopulated.

## Handoff review decisions

- “One hour” is the planned activity total. Unplanned water pauses and added minutes extend wall-clock time; this is explicit in live mode.
- The opening five minutes use a ball each, even in weeks that introduce paired activities.
- Knockout and festival activities have immediate re-entry and no permanent elimination.
- Passing challenges encourage choices without a mandatory pass-before-scoring rule.
- Rules reference values never become local defaults. A game clock requires explicitly confirmed format fields.
- Concussion guidance includes removal for the day and healthcare clearance; coaches do not diagnose with this app.
- Because V1 excludes cloud sync, the two coaches do not share roster edits or simultaneous clocks. This is clearly stated in the app and README.

## Reproduction

See README for `tests/smoke.cjs` and `tests/final-check.cjs`. Tests create synthetic local state in isolated contexts and leave no roster in the shipped source.
