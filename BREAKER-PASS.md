# Rough-wave preview · October 6, 2026

Baseline: `d63b1e13622934c472f56c706de39c23706f2846`.

- Before: ordinary app URL, unchanged water shader bytes.
- After: same app URL with `?breakers=tidewater`.
- Both use the same real forecast. Choose the same hour with at least 3 ft waves to compare. Conditions at or below 2.5 ft are deliberately unchanged.

## Changed

The existing crest event now develops an attached forward-thrown lip with quadratic fall. The face curves back beneath it, then resolves into the existing type of travelling bore. A local 1.45-second plunge maps the app's crest-age clock to the ballistic progression; it is an artistic simulation parameter, not a forecast measurement. The existing alongshore delay makes the segment break progressively.

Whitewater starts at the lip's mean-water contact point, spreads and becomes a rolling foam source. It replaces the broad foam injection centred on an airborne crest. The existing foam buffer, advection, lace shading, wet-sand memory and decay remain in use. A small amount of crest spray remains. Calm water is unchanged.

The throw/fall and impact calculations are adapted from the actual MIT Tidewater source at `4811ba48d795197de5621985f404e765c0b7c0ef`: `src/ocean/Breakers.js` (`_buildMesh` shader) and `src/ocean/ShoreWaves.js` (`shoreWhitewater`). They are adapted formulas, not a claim that the complete Tidewater ocean is running. MIT license and attribution ship under `assets/licenses/`, reached through the Waves sheet's existing source details.

## Preserved

No engine swap, new water mesh, extra render pass, new dependency, lowered resolution or altered quality setting. Camera, story, controls, sky, sun/moon, light/colour calculations, beach, wave spectrum and forecast data remain unchanged. The only change to the water fragment shader is the crest-foam coverage expression; colours, reflections, refraction and lighting remain the original calculations. Changed surface normals naturally affect the reflections.

`scripts/wave-source.mjs` inserts the isolated module at build time with unique-anchor assertions. The original scene bundle remains untouched. The off path is checked against every original shader byte, so the default remains a genuine baseline.

## Verification

- `node scripts/check-interactions.cjs`: all seven gesture checks pass at 390×844 using actual registered handlers, a mocked DOM and synthetic test forecasts. Scene look, sun drag, timeline compacting, pinch/reset, water-locked tide scrubbing, Back to now and Watch/pause all pass.
- `node scripts/build.mjs`: passes the existing interaction, presentation, menu and celestial gates plus the new breaker checks.
- `node scripts/check-breakers.mjs --export-shaders`: tests 1, 2.5, 3, 5 and 8 ft **test inputs**, several tides/crest elevations and the full event lifetime. Finite, continuous profiles; no calm-water change; overturned lip during the plunge; no overturn after collapse; no impact-source foam before contact. The 3 ft and 5 ft fixtures land about 0.93 m and 1.55 m forward respectively, with the prescribed crest fixture. These are internal geometry checks, not measured shoreline predictions.
- `python scripts/check-wave-shaders.py <export directory>`: the ocean and foam shader pairs compile and link under Mesa EGL/GLES3. No browser was installed or used.

## Still required before enabling by default

Rendered before/after clips at 390×844, identical 3 ft and 5 ft test inputs, and an iPhone performance/visual check. Browser capture is unavailable in this session. No phone FPS, rendered improvement or visual acceptance is claimed. This pass stays isolated behind its review URL; do not promote it solely because numerical tests passed. Preserve the baseline if lip attachment, foam continuity, appearance or phone performance is worse.
