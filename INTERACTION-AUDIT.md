# Interaction audit — October 5, 2026, America/Chicago

Current authority: `INTERACTION-CONTRACT.md`. Implementation base: published commit `2a0d053ebe19e2e6366ab5042fd8f0abf371e75e`.

Executed `node scripts/check-interactions.cjs` against the actual registered pointer/click handlers and actual Three.js camera projection at 390×844. DOM geometry and forecast inputs are test fixtures; no fabricated data is inserted into the application.

| Required check | Automated result |
|---|---|
| Scene drag rotates view; time unchanged | PASS |
| Sun drag changes time and moves along its true path toward finger | PASS |
| Scrubber changes time and compacts dock | PASS |
| Pinch zooms; double-tap resets current-time view | PASS |
| Water/tide scrub keeps camera on water | PASS |
| Back to now returns live and default home | PASS |
| Watch plays; first touch pauses and hands camera back | PASS |

Additional assertions cover scene drags crossing sun/dock without changing ownership; held camera through timeline changes; ±90° yaw and −20°/+60° pitch bounds; 35°–80° FOV; two-finger promotion including a first contact on the sun; cancellation/lost-contact cleanup; day-edge containment; same-hour day selection; full-header release state; sheet peek persistence; resumed playback; and restoring a pre-story manual view.

The build now executes this audit before generating output. A failed assertion prevents packaging. Repository `AGENTS.md` requires the contract/checklist in subsequent rounds. The approved automatic `beachPose` is still checked against its exact reference function hash.

Visual/device verification remains unavailable: no browser QA capability or iPhone session was present. These results do not claim a recording, physical-device touch feel, or measured 60 fps. Water/sky/lighting/NOAA source and the removed lifeguard stand were not modified.
