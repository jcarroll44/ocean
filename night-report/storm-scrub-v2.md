# Storm and scrubber pass · 2026-10-12

Revision: `2026-10-12-storm-scrub-v2`.
Working branch: `wip/tidewater-verdict-first`.
Private gate: `/weather-fixtures.html?gate=1&build=storm-scrub-v2`.

## Changes

- Irregular multiscale lightning leader, three tapered forks and a soft halo.
  Lightning illuminates cached cloud folds and retains shared wet-sand/ocean light.
- Varying cloud condensation bases, density erosion and sun/moon optical-depth
  shading; faint night sky/city fill. Rain haze no longer erases the whole deck.
- Selected-hour sky charm with astronomical moon phase, drag label, solar-light
  track, sourced tide marks/rain patches, native hour/moment haptics and animated
  current readings. Reference CSS/fonts and gesture handlers remain unchanged.
- Coherent 128×32 cloud snapshots while scrubbing, then 256×128 at rest; both
  keep the same 512-pixel submitted-frame budget. Only complete generations
  publish through a 400 ms crossfade. Continuous drags cannot starve publication.
- Capture work waits while hidden. Mid-screenshot interruptions restore the draw
  hook and retry that fixture. Interrupted videos are discarded and restarted,
  even after repeated interruptions. The completed FPS result is never replaced.
- One automatic run measures the night-storm fixture for 120 seconds after the
  existing 15-second warmup, then records the storm clip, ten fixture images,
  contact sheet and a ten-second clear → storm → clearing day scrub. Everything
  uploads to `results/` on `wip/tidewater-in-app`.

## Verification

The full build and all seven registered-handler interaction checks pass:
scene look, sun drag, track scrub/compact, pinch/double-tap, water-sheet camera,
Back to now, and Watch pause/resume. DOM/data checks cover true moon phase,
selected-hour agreement, missing data, rain/tide marks and haptic bounds.
Capture tests include repeated hide/return during screenshots and both clips,
failed FPS retention and one measurement only. Cloud scheduler and WGSL pipeline
checks pass on Dawn null. Production material WGSL semantics pass; full GPU
execution exceeds this adapter's resource limits. These are not rendered tests.

Latest retrieved device baseline is run
`2026-10-12T01-23-23Z-d4722f36-e174-4ad6-8de4-4663f106f9c0`:
37.634 fps average, 34 minimum, zero seconds under 30. That older revision passed;
its gallery stopped after Clear when hidden. It does not validate this revision.

No supported browser controller/rendering GPU is available in this session.
New contact sheet, clip, photorealism review and physical iPhone FPS are pending
the one-link run. The scrub clip records the actual scene canvas; DOM charm and
readouts are logged with timestamps, not included as an OS screen recording.
Safari does not provide the native wrapper's haptic bridge.

Tidewater and Takram MIT credits remain. Ocean physics, breaking surf, thin rain,
camera, adaptive DPR/High/FXAA settings, GitHub main and Site audiences remain
unchanged. The public beta is not deployed by this pass.
