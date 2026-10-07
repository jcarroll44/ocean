# DayBuoy — Tidewater handoff

## iPhone profiling round 3 — October 7, 2026, host diagnostics

Jacob's supplied round-2 JSON is retained at `night-report/iphone-round2.json` (run `2026-10-07T04:48:52.202Z`). Baselines were 12.30, 12.30 and 12.54 fps; atlas 12.33; DPR 1.0 18.93; DPR 1.5 14.00; all-ocean-off 12.48; grid128 12.52; lower LOD 12.79. Every reported ocean/output dimension matches the requested DPR. Atlas offered no measurable benefit and is not promoted into the ordinary app. No 30 fps result exists.

The all-off row did not disable the complete Tidewater renderer: native terrain, atmosphere, shadows and post remained, along with DayBuoy's layer draws/copies. Source inspection also found that the legacy fullscreen background (`renderOrder=-100`) still shades old water inside `backgroundFragment`, despite the old displaced mesh being hidden. Thus these results identify substantial retained work; they do not yet prove which renderer is the bottleneck or that all wave-related math is cheap.

**Run round 3 · host** on `/ocean-profile.html` runs baseline → proof alone → second layer removed → shadows off → background baked/atmosphere frozen → post/composition bypass → all four cuts → baseline. All six new rows retain the native ocean, High wave settings and DPR 2, with 15 s warm-up / 20 s measurement. Schema 3 / revision `2026-10-07-host-1` reports exact scopes, native post settings, cut flags and ocean/lip/spray visibility; stale revision, viewport/DPR/output mismatch, hidden ocean geometry or background interruption rejects the case.

- Proof alone loads the embedded native proof's actual `frame.html`/`tidewater.js` directly; it never loads the DayBuoy app document. It retains native terrain/sky and original proof post defaults, so AA/flare settings are recorded rather than concealed. The external frozen proof branch/site remains untouched.
- Single-layer removes the legacy foreground draw and its upload. The empty transparent overlay removes sun/path/weather foreground graphics in this diagnostic. The base draw/copy and all native ocean work remain.
- Shadows uses native SunShadows' enabled switch, which skips cascade updates/draws and shadow texture sampling, and disables WebGL shadowMap. Procedural/analytic background shading is still present.
- Sky bakes the original fullscreen background once at full resolution and replaces that expensive material with a texture lookup. The baked image includes sky, sand and the old-water background shader. Native atmosphere LUT/irradiance updates prime once in the fixture then freeze. Other scene objects, both host copies, reflection refresh and all ocean work remain.
- Post bypass replaces native PostFX rendering and the final mask/overlay composite with one direct scene HDR-to-display tone-map pass. It retains camera/target preparation, host draws/copies, native scene rendering and refraction; overlays and full post effects are absent. All-cuts combines exactly these four switches. These images deliberately differ and are diagnostic only.

Source/runtime tests verify each cut's isolation, one-time bake, preserved ocean update functions, disabled shadow uniform behavior, direct-proof routing and rejection conditions. The seven interaction checks and complete build pass; modified compositor/presentation pipelines validate on Dawn null, which renders no pixels. Full native GPU/device and WebGL bake pixels remain unverified in this environment. No new phone FPS, screenshot pair, or visual acceptance is claimed. Next: run round 3 on the phone and return JSON before selecting a structural optimization. Main, UI files, elapsed-time clock, fallback and MIT credits remain unchanged.

## iPhone profiling round 2 — October 7, 2026

This section supersedes the older "no per-pass phone results" statements below. Jacob supplied a real iPhone Safari run at 390×689, DPR 2, sunny 3 ft / 8 s / zero tide. Baselines were 12.82 and 14.08 fps (p95 90 and 85 ms); freezing only imported image copies reached 19.97 fps (p95 52 ms). Both legacy scene-layer draws remained active in that diagnostic. Copy/interop is the clearest measured lead; this does not isolate redundant rendering or prove wave work negligible. The ~10% baseline spread prevents confident ranking of the smaller gains and does not establish phone temperature. Swash is excluded from like-for-like comparison: its final output fell to 624×1102 despite the native ocean retaining 780×1378.

The published runner adds **Run round 2**: baseline → one-transfer candidate → baseline → DPR 1.0 → DPR 1.5 → all-ocean-off → 3×128 FFT → lower mesh LOD → baseline. Each is independent, with 15 s warm-up and 20 s measurement. Separate buttons measure a two-minute baseline or candidate. Schema 2 / revision `2026-10-07-atlas-1` rejects stale results and checks native AND final-output dimensions every submitted frame. The profiling-only legacy resize wrapper prevents the former silent drop to DPR 1.6. The ordinary app remains unchanged pending acceptance.

One structural candidate only: `profile-pass=atlas` draws the original two full-resolution layers into scissored halves of one WebGL drawing buffer, then transfers it to WebGPU once. Both required layer draws and the same total source texel count remain. It removes a transfer/synchronization point, not all rendering or bandwidth cost. There is no smaller wave grid, cheaper lighting, reduced spray, reduced DPR, or stale-frame reuse in this candidate. Final output remains DPR 2. Atlas edge clamping preserves each layer's sampling boundary; phone pixels are not yet verified.

Diagnostic grid128 uses a reproducibly generated MIT derivative outside the untouched vendor tree: 128-point / seven-stage IFFT, three cascades, eight mip levels, adjusted midpoint strides and sampling footprints. CDLOD-only changes range factor 2.5→2.0, retaining tile size and all other budgets. All-ocean-off hides water/lip/spray and stops their associated simulation/lighting updates; it retains the legacy scene/copies, terrain, atmosphere, shadows and post/composition. It measures that retained pipeline's floor, not an empty frame.

Automated verification: all seven interaction-contract checks, source preservation, round-2 isolation/resize/order tests and complete build pass. Baseline and atlas compositor WGSL/pipelines validate on Dawn null. Derived FFT WGSL validates; complete FFT dispatch validation is blocked by that adapter's four-storage-texture limit versus five required by the upstream mip-A design. Null renders no pixels. No physical iPhone is attached, no new phone FPS or proof/candidate screenshot pair exists, and the 30 fps / two-minute acceptance gate remains unmet. Main and the standalone proof are untouched; MIT credits are retained. Next: Jacob runs round 2, returns JSON and phone images; reject the candidate if the look regresses, and combine no settings before measurement.

## iPhone profiling round — October 6, 2026, 9:38 PM request

Work continues only on `wip/tidewater-in-app`. The standalone proof and GitHub main are unchanged. Entry point: `https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-profile.html` after this round's publication.

This round adds opt-in instrumentation, not an appearance/performance optimization. The ordinary app keeps its existing quality selection and scene. The diagnostic fixture locks the resting proof camera, sunny 3 ft / 8 s / zero tide / 8 kt conditions, High detail and DPR 2. It excludes 15 seconds of warm-up, measures each ablation for 20 seconds, and repeats the baseline at the end. A separate baseline run measures 120 seconds. It aborts on backgrounding, renderer failure or changed viewport; JSON includes backend context, resolution, settings, average completed-frame cadence, lowest whole one-second count, p95/p99 frame intervals and longest frame. This is not display scanout measurement or an isolated GPU timestamp profiler.

The runner distinguishes FFT updates, shore evaluation in shaders, surface foam shading, spray, swash updates, the refraction render, transparent surf draws, reflection shading/cubemap refresh and cross-context image copies. Scope is recorded in every result. Several systems share computations and affect pixel coverage; ablation gains are not additive. The spray switch keeps the shared crest-update kernel, so the lip still moves. Normal profile settings never reduce resolution automatically.

Latest user-reported measurements supersede the older evidence inventory below: laptop 42 fps at 780×1688; iPhone approximately 6 fps at full resolution and 5–19 fps at 390×689–487×861 with blur. These are reports supplied in the takeover request, not measurements made by this round. There are no per-pass phone results, new phone screenshots or accepted 30 fps / two-minute run yet. A physical iPhone is not connected to the agent environment. Do not infer the largest costs from source or these aggregate measurements.

Source/CPU checks verify the diagnostic branches, real upstream shader-source transformations, switch isolation, elapsed-time statistics including stalls, and unchanged UI/camera files. The seven required interaction checks and build pass. The available Dawn null backend cannot run the whole native renderer: its 16 KB workgroup-memory limit is below the upstream 18,432-byte environment kernel, and its resource limits also reject existing pipeline layouts. This backend renders no pixels. Browser/phone render verification and same-moment proof comparison remain pending.

Next: Jacob opens the profiler in iPhone Safari, runs pass comparison and returns the exported JSON. Rank measured costs with the repeated baseline to account for drift, make one optimization, then collect matching phone/proof images and repeat the two-minute test before accepting it. Do not change the UI or wire new forecast behavior during this diagnostic round.

Updated October 6, 2026 (America/Chicago). This handoff supersedes older status notes. No application code was changed for this export. Use branches only; no tag was created. Do not merge either branch into main without Jacob's approval.

## Repository and checkpoints

Repository: https://github.com/jcarroll44/ocean

| Branch | Contents | GitHub code-snapshot commit | Original Sites source commit |
| --- | --- | --- | --- |
| `proof/tidewater` | Deployed standalone Tidewater proof: native ocean, 1/3/5 ft comparisons, phone quality controls, elapsed-time wave clock, diagnostics and recording controls. This is the separate laptop-reference proof, not the in-app compositor. | `132a0137c1875b3e7633794be2038a1864f24fa8` | `124632669171841898300055efaa26a333d0619d` |
| `wip/tidewater-in-app` | Current night-pass app: exact Verdict-first UI reference and native Tidewater ocean composition over the retained DayBuoy surroundings. Unapproved WIP; visual and phone acceptance remain outstanding. | `cedbf01f291953995f61d6dbefa63e6fe861bb56` | `a0a6c778c489fbea02a077136dace2859b972e1b` |

The final branch heads are documentation/archive-only children of these code snapshots. Obtain their current hashes with `git rev-parse HEAD` or `git ls-remote origin refs/heads/proof/tidewater refs/heads/wip/tidewater-in-app`. The code-snapshot trees exactly match their respective original Sites trees: proof `f426b4d8f4073d4c2cd7dab4fd9781d970549c58`, WIP `7d237b870dea5a88983348b01866b42eedee5656`.

GitHub main was `e7cdb9194b1a1df6f9e6beee16e85a7014097a46` at export; it was not moved. GitHub app-v2 remains `ce9fd044b535095fa230e3a482d2a50d847ab33b` (the GitHub parent used for both exported snapshots). The separate main Sites app remains at `30826de2b421b6fae157e69374433aa0fb75b701`. These are different repositories/checkpoints; do not confuse their hashes.

## Live previews

- Standalone proof: https://daybuoy-ocean-proof.jacobcarroll51.chatgpt.site
- Current in-app WIP: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site
- WIP diagnostics: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/?ocean-debug=1
- WIP UI reference comparison: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ui-review/
- Unchanged main app: https://daybuoy-app-v2-preview.jacobcarroll51.chatgpt.site

These are existing deployments, not newly published by this handoff. The standalone source is the deployed proof checkpoint; the historical laptop recording was not mapped to a separate exact commit in the available evidence. Do not claim a newer device or visual approval.

## Goal and boundaries

Open the app and quickly see your beach and whether to go. Jacob wants Tidewater's actual ocean and wave forms only, with DayBuoy's own beach, sky, sun/moon, approved beachPose camera, gestures and UI. A Tidewater island/scene replacement and the old two-formula wave approximation were rejected. Keep the current app and the proof distinct. Main stays untouched.

Read `INTERACTION-CONTRACT.md` on the WIP branch before further work. Scene drag looks around and never changes time; only the sun target, dock track, sheet curves and Watch change time. Preserve the approved Watch choreography and NOAA astronomy. No unlabelled fabricated forecast, no human/crowd reporting, no beach-vending/booking work. Never describe conditions as "safe". Estimates retain their labels and methods.

## Upstream pin and licensing

- Tidewater: https://github.com/dgreenheck/tidewater
- Pinned revision: `4811ba48d795197de5621985f404e765c0b7c0ef`.
- MIT, copyright 2026 DRG Software Solutions LLC. Retain LICENSE and CREDITS; the app exposes credits through Waves → source details → Open-source credits.
- All 214 retained upstream files match the recorded integrity hashes. Proof vendor path is `vendor/tidewater`; WIP vendor path is `ocean-proof/vendor/tidewater`.
- Native systems are OceanFFT, WaterSurface/WaterMaterial, ShoreWaves, Breakers, SurfFoam, ShoreSim and Spray. The separate TunedSpray adapter changes GPU slot budget, dispatch/draw counts and ring wrapping; it does not substitute a CPU spray system.
- The retained public upstream `SkyProClouds.js` is covered by Tidewater's own repository licensing/credits. No separately purchased Water Pro or Sky Pro package was supplied or added. Never publish separately licensed proprietary package source.

## Phone evidence — measured versus implemented

Only one physical-iPhone result is available: Jacob reported Safari WebGPU at approximately **6 fps, 1170 × 2532**, equivalent to DPR 3 for 390 × 844. Other settings for that run were not captured. The laptop appearance was liked, but that is not phone-performance evidence.

No subsequent physical-iPhone retest result, sustained 30 fps for two minutes, or completed ten-second phone timing clip is available. The following settings are implemented and CPU/source-tested, not individually benchmarked on an iPhone:

| Level | Preset | DPR cap | Wave CDLOD range factor | Active spray slots | Refraction scale | Environment refresh | Cloud buffer scale | iPhone result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | High | 1.5 | 2.5 | 32,768 | 0.5 | 3 s | 1.0 | Not retested |
| 1 | Balanced+ | 1.5 | 2.0 | 16,384 | 0.4 | 4 s | 0.85 | Not retested |
| 2 | Balanced | 1.25 | 1.75 | 8,192 | 0.3 | 5 s | 0.70 | Not retested |
| 3 | Phone | 1.0 | 1.5 | 4,096 | 0.25 | 6 s | 0.60 | Not retested |
| 4 | Low | 1.0 | 1.2 | 2,048 | 0.2 | 8 s | 0.45 | Not retested |
| 5 | Minimum | 1.0 | 1.0 | 512 | 0.125 | 12 s | 0.30 | Not retested |

Effective DPR is the smaller of device DPR and the preset cap. At 390 × 844, caps 1/1.25/1.5 correspond to approximately 390 × 844 / 488 × 1055 / 585 × 1266; read the actual framebuffer dimensions in the overlay because rounding and viewport size vary. Internal extra render scale remains 1. Phone reflection cubemaps are 64²; desktop 128². The original four 256² FFT cascades, 32-cell LOD tiles, 768² swash and breaker geometry remain. Quality reduces LOD range, spray, refraction/environment budgets and cloud resolution instead of removing the breaking system. In-app `noClouds=1` disables Tidewater's visible cloud pass, retaining DayBuoy's visible sky.

Auto starts at Balanced on phones and High on desktop. It uses completed GPU submissions in a trailing three-second window, drops for a severe miss below 24 fps or two below-30 windows, waits for settling and reports an unmet target at the minimum. The standalone host uses a four-second settling interval; the in-app host checks quality approximately every five seconds after warm-up. GPU-completion rate is a diagnostic, not proof of displayed smoothness, thermal stability or touch latency.

The frozen standalone proof contains a **20-second benchmark**. The newer embedded proof inside WIP extends that to **120 seconds** and records rolling-window minimum FPS. Do not describe the frozen proof's old button as a two-minute test.

The WIP embedded proof adds same-moment full/tuned captures. Full uses High ocean detail and native DPR up to 3; both phone captures retain the 64² reflection cube. Wave time and stateful swash/whitewater updates are held. Spray buffers reset on budget changes, so individual spray particles are not identical. No full/tuned phone stills were obtained; inspect curl, foam and clear shallows before accepting a preset.

## Clock, forecast and physical calibration

The original loop lost elapsed time under GPU backpressure and clamped frame delta to 0.1 s. WaveClock now derives absolute wave phase from `performance.now()` and seeds both G.time and FFT.time. Simulation integration delta is bounded to 0.25 s for particle stability during stalls; absolute wave phase keeps real time. CPU tests cover 1/6/15/30/60/120 fps and backpressure: an eight-second phase takes eight real seconds. This has not yet been confirmed with the requested phone recording.

The ten-second recorder uses actual rendered frames at 390 × 844 and overlays elapsed clock, wave phase, quality and resolution. It chooses MP4 when supported, otherwise WebM; use native screen recording if canvas recording fails. Encoding adds load: run FPS benchmarks separately, foregrounded, without recording.

The WIP forecast adapter maps wave height in feet to metres and amplitude H/2, plus period, incoming wave direction, wind/chop and tide. Source/CPU unit checks pass. FFT energy remains a relative mapping, not a validated significant-wave-height calibration. Controlled 1/3/5 ft inputs are tests, not measured field conditions. The physical beach slope is 0.105; upstream swash retains a nominal internal 0.066 slope. The visual/physical mismatch remains open. WIP's separate sugar-white adapter changes dry-sand pigment toward #EFEBE2, preserving original wetness/lighting logic; the frozen standalone proof predates that addition.

## Current in-app implementation and known issues

`src/ocean-layer.js` automatically loads `ocean-proof/proof/ocean-only.html?noClouds=1&quality=auto` on supported WebGPU browsers. It forwards the original camera transform/projection and selected forecast every native frame. The original scene supplies sky, celestial objects, beach and weather overlays; its old displaced water and spray are suppressed when native rendering is active. `OceanComposite.js` replaces ocean coverage only. Original WebGL framebuffer alpha changes from false to true in a build adapter for transparent composition. The native ocean uses DPR 1–1.5; final composition retains the original sky/land dimensions. Share capture selects the displayed native canvas.

- **Appearance remains unverified:** native cross-context canvas copying, coverage boundaries, transparent foreground composition, night/storm rendering and share output need a real WebGPU browser review. Source tests cannot prove that these pixels look correct.
- **GPU validation limits:** new background/final WGSL pipelines compile on the Dawn null backend, which renders no pixels. The complete ocean check is blocked by this environment's 16 KB workgroup-memory limit versus 18,432 bytes required upstream, and its 16 sampled-texture limit. No features/limits were disabled to manufacture a pass.
- **Phone performance remains open:** startup time, sustained 30 fps, memory use, thermals and quality changes were not measured on the device. This is the first acceptance gate, before more visual tuning.
- **Lighting calibration:** native water radiance still uses Tidewater atmospheric lighting with supplied sun/moon direction and cloud cover. Visible sky stays DayBuoy's. Their visual match has not been checked.
- **Fallback is deliberate and disclosed:** unsupported/failed/lost WebGPU keeps the standard WebGL ocean and forecast with a visible `Standard ocean · Tidewater unavailable` message. Native loading or missing marine data has a status. Scrubbing, story, night and storms do not deliberately switch back to old water. Diagnose backend first if old waves appear.
- **Diagnostics:** native startup shows a six-second acknowledgement; `?ocean-debug=1` keeps backend, resolution, FPS and preset visible. `window.__tidewater` exposes pin, metrics and errors. This is diagnostic disclosure, not a claimed phone result.
- **Exact UI journey issue:** the selected-day reference replaces Play with Back to now, so there is no visible selected-day → Watch starting button. This requires a design decision; do not silently invent another control.
- **Reference validation scope:** CSS and fonts match the supplied reference; six-state binding tests pass. No physical-iPhone screenshots, ≤2 px rendered match or full-journey video has been established.
- **Old documentation:** older round files describe superseded UI/camera/water states. Use this handoff plus the latest interaction-contract addendum and OCEAN-INTEGRATION.md. Do not promote an archived adapter or formula patch because a historical test passes.

## Verification at export

Both source trees and all uploaded blobs were hash-checked. The standalone `node scripts/build.mjs` passed upstream integrity, imports, syntax, matched projection/slope and clock/quality CPU tests. WIP `node scripts/check-interactions.cjs` and `node scripts/build.mjs` passed without source changes:

1. Scene drag rotates view; time unchanged — PASS.
2. Sun drag changes time along the projected path — PASS.
3. Track drag changes time and compacts dock — PASS.
4. Pinch zooms; double-tap resets without changing time — PASS.
5. Water curve scrub stays water-locked — PASS.
6. Back to now returns live/default view — PASS.
7. Watch plays; touch pauses and releases control — PASS.

These are registered-event/geometry tests with mocked DOM and synthetic inputs, not physical-device results. Reference-state/data bindings, preservation checks, celestial tests, native adapter/fallback/share selection and archived overnight tests also passed. The full renderer limitation above remains, and no new clip was fabricated for the handoff.

## Continue from a clean clone

The GitHub API exported exact code snapshots; it did not recreate original Sites commit identities in their ancestry. To preserve historical regression checks and all prior source work, original Git history is included as split Git bundles. No credentials or repository configuration are included.

On `wip/tidewater-in-app`, restore its original history before running the preservation tests:

```sh
cat handoff-history/night-pass-source.bundle.part* > /tmp/daybuoy-night-pass-source.bundle
sha256sum /tmp/daybuoy-night-pass-source.bundle
git bundle verify /tmp/daybuoy-night-pass-source.bundle
git fetch /tmp/daybuoy-night-pass-source.bundle HEAD:refs/remotes/sites-archive/night-pass
npm ci
node scripts/check-interactions.cjs
node scripts/build.mjs
```

Expected bundle: 101,924,677 bytes; SHA-256 `d357be9650e4a15e013300e24b84047b040767f374bef3204c777feb1b158f44`. Fetching this history adds objects/a remote-tracking ref; it does not move the checked-out branch or main. Tests reference original commits such as `d008588a`, `93a10eb91d888f40984d3edacadd67ced0642778` and `30826de2b421b6fae157e69374433aa0fb75b701`.

On `proof/tidewater`, original proof history is optional for its build:

```sh
cat handoff-history/proof-source.bundle.part* > /tmp/daybuoy-proof-source.bundle
sha256sum /tmp/daybuoy-proof-source.bundle
git bundle verify /tmp/daybuoy-proof-source.bundle
git fetch /tmp/daybuoy-proof-source.bundle HEAD:refs/remotes/sites-archive/proof
node scripts/build.mjs
```

Expected bundle: 2,584,275 bytes; SHA-256 `080cf31d8c0eca6267431b437868caa5c51afbc9aca7a8a67a19b0fb7a0dd78d`. Serve `dist/` from HTTPS or localhost for WebGPU. Preserve each branch's existing hosting identity; never deploy one to the other's Site accidentally. Keep main unchanged until explicit approval.

Next useful action: test the diagnostic WIP and isolated proof on Jacob's iPhone Safari, record backend/resolution/preset and sustained FPS, then compare 3 ft and 5 ft shapes against the approved laptop reference. Resolve composition or GPU failures before additional styling or wave changes.
