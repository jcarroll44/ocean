# Ocean App — overnight handoff, 23 September 2026

Live app: https://jcarroll44.github.io/ocean/
Repository: jcarroll44/ocean, main. Final app commit: 4d870167d4c8f01d15863fb38fe4428e98e3d24c (v45; release-label correction only after the tested functionality commit).

## What shipped

1. **Phone experience — v43, commit 5dbb2eb3d8ca59d1563c35fbca9c862872060bcd.** Reduced the fixed phone dock to 208 px, with a 131 px controls header at 390 × 844. Synchronized floating and main playback clocks. Prevented buoy labels from overlapping the header or sheet. Day/evening playback limits pan and tilt to preserve Bo in the ocean view. The nighttime Sun tab leads with the next daylight UV peak, using today after midnight and tomorrow after sunset. Folded secondary Water/Sun details. Added prominent sample/offline notices.

2. **Person and explanation — v44, commit 5ce05f56e509b0a95509d886060ce29d9d5704b3.** Improved the existing figure with smoother torso/limb profiles, swim shorts, hair and facial details. Preserved standing, lying on back and lying on front; rotation and height controls remain. Skin, clothing and hair share lighting. Daytime comparison uses the actual sun; nighttime comparison is labelled illustrative daylight. The person stands on dry ground beside a metre-scaled wave-height comparison: this is not a prediction of water depth around a swimmer.

   **The premium character goal remains incomplete.** A further MakeHuman anatomical-mesh candidate rendered but failed visual review: hand deformation produced long spikes when posed. It was reverted completely before publishing. No MakeHuman mesh or application code is in the shipped app. Retained the working stylized figure; do not describe it as a finished realistic character. The next character attempt should use an authored, properly rigged adult in beachwear, with pose deformation verified before integration. A seated beach-chair pose was not added.

3. **Focused ocean refinement — v45, commit ce10e6e38baa967a6f32cffc0332f84b6c29a833.** Fine ripples now respond more distinctly to calm versus strong wind. Sun and moon highlights use normal-variation filtering to reduce subpixel sparkle. Underwater light patterns lose contrast as wind increases. Existing depth colour, refraction, foam and wave geometry remain. Fixed the Sunset postcard estimate label colliding with its score. This is a modest shading refinement, not a claim of photorealism or validated coastal simulation.

## Verification

Each working delivery was tested before its app commit. v43 and v44 were subsequently fetched from GitHub Pages and matched their tested files byte-for-byte. The v45 functionality commit also matched its deployed file byte-for-byte; the final label-only correction was separately verified.

- Chromium with software WebGL, 390 × 844 phone viewport; additional overflow checks at widths 375, 430 and 1280.
- All five tabs; midnight Sun correctly chooses today's peak and hides the empty study.
- Playback panel stays stable/inert, stop/completion work, camera zoom returns; floating and main clocks matched in sampled playback frames. Bo remained within the viewport at all sampled day-playback positions. Day/evening camera movement is bounded; dedicated night playback still prioritizes the sky.
- Figure rendering, camera persistence, 120/175/220 cm height settings and all three poses checked. The anatomical replacement failed visual review and was discarded.
- Calm fixture: 1.2 ft waves, 7 s period, 2 kt wind. Rough fixture: 6 ft, 7 s, 22 kt. Both before/after screenshots captured with fixed view and static wave time. No JavaScript or shader errors in the successful runs.
- Screenshots show clearly labelled sample data because external forecast requests were disabled for repeatable browser checks. They are phone-sized browser captures, not iPhone screenshots or live forecast validation.
- Main scene rendering was paused during interaction checks; dedicated scene captures actually rendered. Sunset postcard capture retained its real render path. Tests do not establish frame rate or battery usage.
- A test-harness browser closed when its last page closed; its next-page attempt was rerun in a fresh browser. This was not an app crash.

## Decisions and remaining work

- User controls: the person matters; Bo stays in the hero during playback where possible. Ocean App is a temporary app name. Do not rename the app Bo.
- Retained one beach and the five tabs. No new locations, push-report navigation system, feature expansion, full physics rewrite or UV dose-model changes.
- Expanded details use native disclosure sections rather than a new routing/navigation system.
- Exact buoy displacement remains illustrative; it is not sampled from the rendered local wave field. Do not claim exact wave-following physics.
- Actual iPhone Safari operation was demonstrated in the user's earlier recording. Precise device FPS, heat/battery and forecast-feed reliability still need real-device measurement. The earlier apparent startup failure was opening a downloaded HTML file in an iOS preview; do not assume Safari still fails to start.
- No calibrated live-webcam comparison was completed. Screenshot fixtures are sufficient to compare this shading change, not to validate realism against actual conditions.
- Settings diagnostics: tap the wordmark five times to expose rendering statistics. Do not confuse software renderer results with iPhone performance.

## Source layout and recovery

The app remains self-contained in index.html. Named module boundaries (`/* ===== figure.js ===== */`, `panels.js`, `ocean-engine.js`, `app.js`) remain inside the bundle. Do not rewrite the bundled Three.js library casually.

The v43 and v44 commits are independent recovery points. Revert the relevant app commit if a deployed regression is confirmed; preserve unrelated user changes. GitHub Pages serves the root index.html. The user does not need to manually upload this release.

Screenshot bundle includes all five tabs, nighttime Sun, retained person poses, and calm/rough comparisons. No rejected character screenshots are included.
