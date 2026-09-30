# DayBuoy · app-v2

This branch owns the new DayBuoy interface and sun camera. Never push these preview changes to main without Jacob's instruction. The separate wave workstream owns the ocean/wave-surface algorithms.

## Current build

- `src/scene-data.js`: preserved bundled Three.js, ocean/wave, buoy, astronomy, forecast and UV modules. Only ocean-engine camera pose, ray origin and camera-relative grid coverage changed in Round 3.
- `src/daybuoy.js`: single global time and interaction state; new main screen.
- `src/sheets.js`: Sun, Water, Waves, Wind, Sky/Air; every chart controls global time.
- `src/scene-ui.js`: water-plane wind compass, flag and buoy ruler.
- `src/camera.js`: astronomy-derived 3D sun path, ticks, ground ring, drop line, camera trajectory, 20-second Watch the day.
- `src/style.css`, `src/index.html`, `src/font.css`: new glass UI and rounded type.
- `npm run build` creates self-contained `dist/index.html`; the same built bytes are committed as root `index.html` on GitHub app-v2.

The old tabs, panels and sheets are removed from the runtime. Sun opens to 40%; other sheets 55%. Skin/SPF and a user-set tanning budget persist locally. SPF never extends the unprotected burn estimate. The tanning timer is page-local, not a background notification service. The sunset action exports a real calendar event with a 15-minute alarm, using the phone share sheet when supported and a .ics download otherwise. The user must import the event; the app does not claim a notification has been scheduled. Past reminders and design-preview reminders are explicitly identified.

Normal mode uses the existing current-day forecast loader and labelled fallbacks. Live storm windows and sunset scores come from retained forecast/astronomy data. The source label becomes Back to now after time travel. `?review=1&hour=9` uses clearly labelled illustrative conditions on Saturday September 19, 2026, so the three reference times correspond to the intended solar framing. Review-only rip risk, visibility and set count are not presented as live measurements in normal mode.

## Verification and limits

390×844 captures and a 20-second clip use real WebGL with Chromium/ANGLE/SwiftShader. Global slider time, keyboard controls, selected day and close handle were checked. All five sheets fit without overflow. Camera samples move from beach level to an elevated pulled-back dome and back toward sunset. No JavaScript/shader errors in the captures. No physical iPhone performance claim.

The preserved procedural beach remains visibly less photoreal than the reference. The strict visual-match pass is not claimed. See ROUND-1-STATUS.md, ROUND-2-STATUS.md and ROUND-3-STATUS.md for round records.
