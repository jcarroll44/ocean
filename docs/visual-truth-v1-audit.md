# Visual Truth — V1 technology audit and migration plan

Audited 2026-10-19. Audit complete; engine migration, new captures and device gate are not complete. This is a source/report checkpoint, not a changed or accepted scene build.

## Exact audited states

- Canonical Scene source: `ca42b26912675ba2d4253e7311631473b73007e9`.
- Currently deployed runtime: `5dca02d36d30bbf79a73063d27a6ca8d1d0832f0`, revision `2026-10-19-stormcells-rc15-startup4`.
- Accepted scene/control: `scene-baseline-rc14c-startup`, `c6d8241f1a2f248e62b3ad3c15ffc1203df65473`.
- Current Features source inspected read-only: `d52c2cebb888e88497a60d5d735fc8b55e38dfed`, private Features project `appgprj_6ad04f8df74c8191a0b60ae2e10fa300`.
- The new user program supersedes the pending RC15 startup4 device tests and the proposed four-cell approach. It does not retroactively pass RC15 or change accepted baseline tags.

## What runs now

| Component | Exact version/source | Actual role |
|---|---|---|
| Three.js | r170 / `0.170.0` | Embedded in `src/scene-data.js`; CPU host math and explicit legacy WebGL fallback. Not the active native renderer. |
| Tidewater | `4811ba48d795197de5621985f404e765c0b7c0ef` + project adapters | Custom WebGPU/WGSL ocean and native renderer. Four 256 FFT cascades, accepted surf-truth adaptation. |
| Water Pro | Not active or installed in this scene. Owned source is **3.5.1**. | No existing Water Pro dependency to bump. Integrating it replaces an engine boundary. |
| `@takram/three-clouds` | No installed npm version. Adapted WGSL/noise source pinned to `b012ad06d858fc035d88aacfd73f092f93c994e4`. | Existing 512x128 amortized cloud atlas, 18 primary/3 shadow steps, coherent publication; not the stock CloudsEffect API. |
| `@takram/three-atmosphere` | Not installed or active. | Native atmosphere is Tidewater's Hillaire 2020 LUT implementation. |

Source evidence: `src/scene-data.js`, `src/native-host.js`, `src/native-layer.js`, `ocean-proof/proof/inputs.js`, `BeachApp.js`, `native-weather.js`, `cloud-cache.js`, and `ocean-proof/vendor/tidewater/src/sky/Atmosphere.js`. The native entry graph has 261 local modules and zero external/npm imports. The ordinary native host disables the vendor cloud option; the adapted weather atlas is the active cloud path.

## Owned Water Pro package

- Verified original archive: `Three.js Water Pro v3.5.1 (1)(1).zip` (38,491,394 bytes); SHA-256 `593e3fec8ef51df9fa1a2beb8507071f9820c1d000bbc7820987aaabba9df1ee`.
- Recoverable from the user's existing Library item `libfile_61649af33ee081918a29d9b2cafe0e92`; no new purchase or upload is needed.
- Package version 3.5.1; changelog August 19, 2026. V3 began June 5, followed by persistent-foam, physical JONSWAP and performance updates. The exact owned version is preferable to an unverified latest-version claim.
- Peer dependency: Three `>=0.181.0`; basic example recommends `^0.183.0`. Candidate starting pin: **Three 0.183.0 + Water Pro 3.5.1**, subject to compilation and device results.
- `WaterSystem.create()` expects Three WebGPURenderer/Scene/PerspectiveCamera; rendering uses TSL and Three texture ownership. It cannot attach directly to the current raw-WGSL renderer.
- High preset uses 3x256 FFT, medium 2x256. Cascades are frequency bands, not independent marine forecast partitions. One public JONSWAP peak/direction is not an equivalent replacement for the accepted swell/wind-sea mixture.
- Persistent crest foam, probe-driven spray and wind-driven rain/water ripples exist. Forecast-driven breaking lips, bar depth/refraction, Iribarren type and crest spray require explicit integration; the package does not prove those behaviors.
- A custom SkyProvider is the relevant bridge for sourced sun, sky/environment lighting and fog.
- Commercial source, not MIT. License v2.2/August 14, 2026 permits private use and compiled finished-app deployment. Keep original ZIP, readable vendor source, demo credentials/certificates and source maps outside public GitHub and served trees. Retain Tidewater/Takram MIT notices separately. Do not copy private license text/source into the public handoff.

## Takram compatibility findings

The audited upstream cloud package is 0.7.6. Its exports are `.` and `/r3f`, not `/webgpu`; the official documentation still describes GLSL clouds and incomplete WebGPU support. The atmosphere package has a `/webgpu` path (audited upstream 0.19.1), requiring Three >=0.182.0. Neither fact means the current app runs those npm packages.

`localWeatherTexture` channels are layer-weather signals. `localWeatherRepeat` and `localWeatherOffset` use cube-sphere UV; they are not an affine scene-metre transform. A north-up radar/GOES image cannot be bound as-is. The native cloud adapter must explicitly convert geographic samples into layer coverage, vertical bounds and extinction while retaining the canonical footprint. Do not run a second full WebGL renderer just to add stock clouds.

Official references:

- https://www.linkedin.com/posts/danielgreenheck_ive-spent-the-last-6-months-and-200-hours-activity-7468044659509014528-vPvB
- https://threejsroadmap.com/assets/threejs-water-pro (storefront denied this audit; owned package is the exact version authority)
- https://github.com/takram-design-engineering/three-geospatial/blob/main/packages/clouds/README.md
- https://github.com/takram-design-engineering/three-geospatial/blob/main/packages/clouds/package.json
- https://github.com/takram-design-engineering/three-geospatial/blob/main/packages/atmosphere/WEBGPU.md
- https://github.com/takram-design-engineering/three-geospatial/blob/main/packages/atmosphere/package.json

## V1 implementation order

1. Preserve the exact accepted Tidewater runtime as an unchanged comparison/control. Keep the existing API, UI, forecast units, camera, astronomy, capture clock and uploaded-result persistence. Retain startup fixes; no extra startup4 device batch is requested.
2. Add a private, isolated Water Pro 3.5.1/Three 0.183.0 renderer adapter. Compile only the finished candidate bundle; never publish vendor source. Run one renderer/device at a time with complete disposal between comparisons.
3. Port the accepted independent swell/wind-sea partitions, period spacing/arrival, set envelope, tide/depth/bar breakup, refraction and connected shorebreak to the new engine boundary. Verify actual simulation output; do not pass truth checks by merely echoing input targets. Preserve small-day appearance and no-cell weather as references.
4. Bridge the existing beach, profile camera, sun/moon, atmosphere and cloud lighting. Align world axes/metres and render origin before any appearance tuning. Do not replace the accepted atmosphere solely because a newer package exists.
5. Export/validate every generated candidate WGSL module and complete pipeline descriptor at WebGPU defaults: at most 12 uniform buffers, 10 storage buffers, 16 samplers and 16 sampled textures per stage. No requested raised limits. Verify bounded allocation, async pipeline/startup recovery and disposal locally.
6. Produce matched before/after captures using identical profile, forecast timestamp, camera, light and simulation age. Candidate-only 120-second iPhone measurement retains every whole second, >=30 FPS, existing surf truth and original captures. Preserve prior >=36 average, DPR>=1.1 and measured GPU/drift budgets unless explicitly changed. No capture/encode/network work in the FPS window. Record actual per-pass timings; no synthetic phone result.
7. Promote/tag only after a fresh matching candidate pass and reviewed comparison. Until then V1 remains pending; do not apply an accepted baseline tag to this audit or experimental migration.

## Subsequent cards and cross-lane dependency

V2 follows V1's engine decision: canonical ~150 km, north-up georeferenced weather data drives both the map and native cloud density. Draft format is `docs/visual-truth-field-contract.md`; no Data-lane acknowledgment has been obtained. Do not call the draft an agreed or live endpoint.

The inspected Features build has 4h radar tile history, GOES Band13 IR imagery, three-frame cell tracking, and HRRR temperature/wind nodes. It does not have echo-top ingestion, a cloud-mask/height field, full raster nowcasting or HRRR simulated reflectivity. Existing map and scene share selected time, not geometry. Public GitHub Data/Features branch names were absent at audit time; actual Features private source was inspected instead. Keep other lanes' source and hosting identity untouched.

V3 adds dBZ-driven precipitation curtains and local rain from overhead cells. V7 adds observed past2h, motion-extrapolated next1h and HRRR1–6h, with explicit source/time and est. labels. V4 wind, V5 GLM lightning and V6 fog remain later cards. Missing data stays missing; a successful fixture is never live data evidence.

Cloud boundaries can share a verified georeferenced footprint, but reflectivity does not observe cloud base, optical darkness or exact visible cloud volume. EchoTop_18 is the height of the 18-dBZ radar echo; GOES quantitative mask/height products are needed beyond IR picture brightness. Derived 3D geometry, attenuation and forecasts remain `est. · <source>`.

## Truth gate design requirements

Five matched cases: light offshore rain, a strong approaching line, overhead heavy rain, non-precipitating cloud edge, and tracked/model forecast transition. Capture the actual map and scene at the same valid time and shared field ID. Check bearing <=5 degrees, calibrated width/edge/intensity class, visible original source times, shared uncertainty and no independent advection. Metric tolerances for size/edge are proposed in the draft contract and must be fixed before acceptance, not tuned to a failing run. Pixel comparisons supplement simulation/projection measurements; an input round trip alone is not visual truth.

Require the existing full iPhone performance gate on each changed build, and tag only genuinely passing builds. V1 audit contains no new rendered captures, no before/after comparison and no iPhone measurement. Current publication remains unchanged.
