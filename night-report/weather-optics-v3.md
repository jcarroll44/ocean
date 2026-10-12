# Weather optics v3 · 2026-10-12

Working branch: `wip/tidewater-verdict-first`. Revision:
`2026-10-12-weather-optics-v3`. GitHub main, the public beta deployment and
platform access controls are unchanged. The Sites source repository is separate.

Accepted baseline: uploaded run
`2026-10-12T02-13-15Z-d51c2ff3-8a93-4a95-9940-7a5d89ebb9c4`:
120.02 seconds, 4,482 completions, 37.344 average, 33 minimum, zero seconds
below 30. Ten images, contact sheet, storm clip and day-scrub clip were present.
Those pixels and FPS validate the previous revision only.

## Changes

- The sun's disc and halo follow selected forecast cover, visibility and rain.
  A cloud in the sun's actual direction further attenuates the hard disc.
- Full overcast closes onto a neutral background; dense volume coverage retains
  underside relief. Dense fog replaces the whole sky with neutral gray-white.
  Heavy rain keeps its existing horizon haze and visible clouds overhead.
- The approved Takram 3D cloud cache is 512×128 at rest, 128×32 while scrubbing.
  Both still bake 512 pixels per submitted frame. The same erosion lookup samples
  finer detail. A six-second rest refresh retains the prior average bake duty.
  The original 18 primary/3 shadow steps and 400 ms complete-image fade remain.
- Immutable cache snapshots use the selected forecast itself. The former first
  eased transition frame could be published as a completed target-hour sky.
- Sky and distant water converge to the same extinction colour through a smooth
  horizon band. Above the wet reflection band, cloudy daytime quartz sand keeps
  its luminance and a warm neutral response. Wet lightning reflections remain.
- Approaching shelf clouds and irregular rain extinction use supported offshore
  forecast bearing/range. A bounded eight-step shelf volume runs only in the
  cloud bake, and skips local heavy rain. The squall fixture has a central
  approaching offshore sector, with consistent low/mid/high cloud data. The
  accepted night-storm fixture's offshore layer values remain unchanged.
- Clear nights enable the existing sparse star shader and physical directional
  moonlight specular path. Moon phase and position remain astronomical. Opaque
  weather skips star work; the approved heavy-storm key-light intensity remains.
- Night-clear gallery evidence is explicitly moon-facing, from the approved night
  beach position through the existing manual-look path. Its real timestamp is
  2026-10-18 03:30 UTC: Moon ~233.9° bearing, ~7.9° altitude, ~45.1% illuminated.
  Default/live camera behavior is unchanged. This fixture hook is stripped from
  production output. The other nine fixtures retain their usual framing.

No changes to Tidewater vendor sources, H/2, wave period/bearing, breaking waves,
384 thin rain particles, flash geometry, wet-sand reflections, camera/gestures,
High/FXAA, adaptive DPR or the strict completed-frame gate. Tidewater and Takram
MIT notices remain included. Appearance remains an estimate attributed to
Open-Meteo; synthetic fixtures remain labelled.

## Verification and evidence boundary

Required seven registered input checks and full build, weather-optics CPU/source
checks, cloud-cache scheduler and real WGSL dispatch validation, actual visible
sky pipelines, water/terrain/rain/lip shader semantics, minified production checks
and Sites asset packaging are run before publication. Test outputs accompany this
report. Dawn null cannot render pixels or establish physical iPhone throughput;
its resource limits also prevent full environment/water pipeline execution.
The managed Sites environment has no control-browser preview tool, so there is
no new local contact sheet or visual acceptance claim.

One private link runs the same 15-second warmup and strict 120-second iPhone
night-storm gate, then storm clip, all ten fixture images, contact sheet and
10-second day scrub, and uploads them to `results/` on `wip/tidewater-in-app`.
Capture work pauses/resumes after visibility loss; hidden timing still fails.
A fresh phone run is required to accept this revision's pixels and >=30 FPS in
every measured whole second.

Gate: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&build=weather-optics-v3
