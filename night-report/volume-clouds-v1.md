# Volumetric weather candidate · 2026-10-11

Branch: `wip/tidewater-verdict-first`. Main is unchanged.
Revision: `2026-10-11-volume-clouds-v1`.

The rejected device upload was
`2026-10-11T22-25-52Z-f0b85086-fdf0-47d5-ab14-f25645871a55`:
33.058 fps average, 27 minimum, eight seconds below 30.
It is not evidence for this candidate.

## Replacement

- 3D Perlin-Worley density and detail erosion, continuous height profiles,
  Beer-Lambert integration and secondary sun/moon optical depth.
- Takram three-clouds MIT adaptation and noise assets, pinned to
  `b012ad06d858fc035d88aacfd73f092f93c994e4`; full license in
  `ocean-proof/proof/takram-LICENSE.txt` and all credits pages.
- 256×128 RGBA16F hemisphere, triple-buffered. Two rows (512 pixels) per
  submitted frame; 18 primary/3 secondary steps. No volumetric march in the
  full-screen sky or water shader. Front-to-back early exit skips hidden layers.
- One immutable weather/light snapshot per bake; only complete atlases are
  published. 400 ms crossfade, refresh about every three seconds. One sampled
  texture outside crossfades. No refresh-time texture allocation or shader compile.
- Separate forecast low/mid/high layers, wind offsets and advected offshore
  fields. Continuous curved-earth projection replaces fixed horizon silhouettes.
- 384 narrow, tapered rain particles; all eight large curtain quads removed.
  Rain dimples, wet sand, haze/visibility, heat, gust spray and lightning retained.
- Readable night sky/reflection glow and foam. Actual moon phase/direction
  retained; ambient display adaptation is not an invented forecast reading.
- Ocean physics, vendor tree, quality, FXAA, adaptive DPR, camera and gestures
  remain unchanged. All descriptions remain conditions, not advice.

## Verification boundary

CPU/DOM interaction, data, gate/capture-order, strict failure retention and
cache-scheduler tests; actual WGSL/pipeline validation on Dawn null.
Dawn null does not render pixels or measure iPhone performance. Full water
pipeline execution exceeds that adapter's resource limits, as disclosed in
`weather-material-checks.json`.

No browser controller or rendering GPU was available for fresh captures here.
The unchanged 120-second iPhone gate must still demonstrate at least 30 GPU
completions in every whole second. It waits for the selected fixture's completed
cache, measures before recording, then uploads JSON, clip, all ten authentic
screenshots and one contact sheet to `results/` on `wip/tidewater-in-app`.

New device FPS: **not yet measured**. New rendered contact sheet: **pending**.
