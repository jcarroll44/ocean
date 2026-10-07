# DayBuoy — Tidewater handoff

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
