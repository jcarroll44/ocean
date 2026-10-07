# DayBuoy — Tidewater handoff

## iPhone round 7 — October 7, 2026, adaptive production resolution

Jacob reports round 6 at DPR 1.5 + FXAA + lens flare on: **36.5 GPU-completed fps average over 120 seconds, minimum 28, seven seconds below 30**. No raw round-6 JSON or phone images accompanied this request. The strict every-second gate remains unmet. Reported DPR-2 drift from 25 to 23 does not establish device temperature.

By explicit user instruction, the ordinary native WIP now starts at **DPR 1.5, FXAA, flare on** with full High ocean detail. This supersedes the earlier DPR-2/TAA default restriction. Adaptive resolution counts confirmed GPU completions in consecutive one-second windows: below 32, lower by 0.05 toward 1.35; if cadence stays low, continue to the hard floor 1.25. Above 38, raise by 0.05 up to 1.6. At 32–38, hold. It changes no wave, foam, spray, refraction or scene settings. At most one resize is pending. New submissions pause until the existing window empties; resize never destroys targets used by outstanding frames. That pause stays in measured FPS. WaveClock continues real elapsed time; the next camera packet restores the approved projection after resize. The two-frame pipeline and asynchronous readback throttles remain.

Open [the profiler](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-profile.html) and choose **Run round 7 · adaptive · 2 minutes**. It uses the same sunny 3 ft / 8 s / zero-tide fixture, 15-second warm-up and 120-second measured window. Schema 7 / revision `2026-10-07-adaptive-1` records every whole-second completion count, seconds below 30, actual DPR range, each change and triggering FPS, empty-window resize evidence and dimensions checked for every submitted frame. Every whole measured second must have at least 30 confirmed completions; average alone cannot pass. Old diagnostic cases retain fixed settings and their existing rejection checks. Background interruption or viewport change rejects the run. No physical iPhone is attached here, so the round-7 device gate remains pending.

Use [the fixed phone capture link](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-proof/proof/native-compare.html?profile-pass=native-pipe-combo&profile-dpr=1.5&profile-aa=fxaa&profile-flare=1) separately from measurement. It holds the same ocean state and wave time for DPR 1.5 / FXAA / flare-on native and DPR 2 / TAA / flare-on embedded reference. Adaptation is disabled during capture. The embedded reference uses the proof sky with WIP white-sand terrain; it is not a screenshot of the [frozen external proof](https://daybuoy-ocean-proof.jacobcarroll51.chatgpt.site). No actual screenshot pair or visual acceptance is claimed. Review pixels on the phone before accepting the look.

Verification covers strict thresholds, zero-completion windows, both bounds, idle-only resize, dimension audits, unchanged fixed-case routing, and synthetic two-minute accounting that retains an injected slow second despite a high average. Seven interaction checks and the complete build are required before delivery. These checks do not establish iPhone performance or pixels. Product UI, camera/gestures/astronomy, main, frozen proof, all 214 pinned Tidewater MIT vendor files and labelled fallback remain unchanged. No API keys or passwords belong in this handoff.

## iPhone round 6 — October 7, 2026, bounded production pipeline

Jacob reports round 5: clear-only 60, native without the one-frame gate 27.4, readbacks plus gate removed 28.5, final queue drain about 134 ms. No round-5 JSON or screenshots accompanied this turn. The ungated rows counted rAF submissions, not GPU completions. They support removing serialization; the drain is evidence of backlog, not an isolated GPU execution time or proof of 30 fps.

The ordinary native WIP now permits at most **two submitted, unconfirmed frames**. Draw/rAF does not await GPU completion. One asynchronous queue-fence observer records a submission watermark, retires only frames covered by that resolved fence, and releases capacity; a third submission is skipped until space exists. No unbounded render queue or frame-count wave clock. The debug FPS counter counts confirmed frames in its trailing window. Queue failures use the existing labelled fallback. Forecast-driven shore-field uploads still use their occasional resource-transfer fence; there is no new per-frame blocking readback.

WaterQuery's GPU kernel and current GPU height buffer still update each rendered frame. Its asynchronous CPU staging copy/mapAsync is requested at most once per four rendered frames, using cached CPU height between completions. Atmosphere readback is asynchronous and limited to once per 250 ms in addition to its upstream scheduling. GPU query producers and ocean shaders are unchanged. Default DPR 2, TAA, flare and High detail remain; only the loop/readback policy is promoted. Previous diagnostic routes retain their original one-frame/ungated behavior for comparisons.

**Run round 6 · pipelined** at [the profiler](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-profile.html). With 15 s warm-up each: 20 s at DPR 2 → 1.75 → 1.5 → FXAA at DPR 2 → flare off at DPR 2 → DPR 2 repeated. Then measure a suggested combination for 20 s. Selection uses the highest DPR already recording at least 30 completions in each second, otherwise the fastest tested DPR; FXAA/flare changes require over 3% average gain against the repeated baseline. This heuristic selects a candidate to measure, not a globally best or visually accepted combination. Among measured candidates, prefer the sharpest/least-changed one holding 30, otherwise the fastest; rerun that candidate for **120 seconds**. A separate button tests production DPR 2 for 120 s. Visual settings are never promoted automatically.

Schema 6 / revision `2026-10-07-pipeline-1`: `gpu-completed-pipelined` counts exact confirmed submission IDs at asynchronously delivered fence notifications. It records completed counts in every whole-second bin, notification gaps, maximum batch size, CPU callback time, actual AA/flare/DPR and observed in-flight maximum. Completion notifications can batch frames; their p95 gap is explicitly not an individual GPU frame duration. Acceptance requires at least 30 confirmed completions in every whole second of a 120-second window, plus average at least 30; display scanout and visual acceptance remain separate. Final draining does not add frames to the measured window. The runner rejects wrong settings, unbounded/submission-only results, geometry/DPR changes and background interruptions.

After the sustained row, **Capture tested candidate / proof pair** opens the exact tested settings. Capture drains the production window first, then holds the wave clock, stateful surf and exposure. Left is the embedded reference at DPR 2/TAA/flare; right is the tested native candidate. Both panels use the same logical size, with native source resolutions labelled. Settings and projection are restored on success/failure. This is still an embedded proof reference with WIP terrain, not a capture of the [frozen proof deployment](https://daybuoy-ocean-proof.jacobcarroll51.chatgpt.site). The original proof comparison and phone image review remain outstanding.

Verification: seven interaction checks and full build pass; delayed GPU-fence tests verify the two-frame bound, exact counts, drain/error behavior, readback spacing, sustained-window accounting and adaptive runner routing. Capture orchestration verifies equal clock/state and restoration with mocked pixels. A separate Dawn null check completed 64 real WebGPU queue submissions with exact counts and a two-frame maximum; it produces no pixels or device FPS. No physical iPhone, new measured device FPS or screenshot pair exists here. Next: Jacob runs round 6, exports JSON and captures the selected candidate; reject visual regressions and accept no 30-fps claim before that device evidence. Main, frozen proof, product UI and all 214 pinned MIT vendor files remain unchanged. No API keys or passwords are recorded here.

## iPhone profiling round 5 — October 7, 2026, frame scheduling

Jacob reports round 4 at about 19.98 fps / p95 52 ms for every native variant, including lower DPR, FXAA and flare off. The round-4 JSON and phone images were not attached; these are reported aggregates, not newly measured evidence. Resolution invariance suggests a shared limit but does not establish its cause or GPU headroom.

Source finding: both the native app and embedded proof allow only one frame in flight, waiting on `GPU.queue.onSubmittedWorkDone()` before accepting another rAF render. This is a scheduling gate as well as a measurement fence. Native CPU readbacks are WaterQuery (camera height) and Atmosphere (irradiance); their staging copies/mapAsync are asynchronous, and there is no active timestamp/occlusion profiler. The fixed forecast disables the separate shore-worker texture-upload fence. These are suspects, not a proven explanation for 20 fps.

**Run round 5 · loop** at [the iPhone profiler](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-profile.html). Sequence: native baseline → clear-only with original GPU gate → clear-only without gate → native with CPU readbacks AND gate removed → native with only gate removed → repeated baseline. Every row uses DPR 2, 15 s warm-up and 20 s measurement. Clear-only submits one color clear through the same device/canvas and parent callback; it retains parent scene/UI CPU work and allocated native resources. The extra clear-only rAF row separates the gate from the rest of that loop.

Readback-free mode primes the fixed scene for 3 seconds, then suppresses both staging-copy/mapAsync request sites. It retains the GPU height/irradiance kernels and uses cached CPU lighting/height; it is a diagnostic, not an approved appearance change. Pending readbacks after warm-up reject the case. The gate-only row keeps normal readbacks, so comparing it with the readback-free row isolates the extra removal. No per-frame completion fence is registered in either rAF mode; one final queue drain records backlog before returning results.

Schema 5 / revision `2026-10-07-loop-1` labels `gpu-completed` separately from `raf-submitted`. Submission FPS cannot satisfy the two-minute acceptance gate. Each native case reports parent rAF cadence, skipped render opportunities, synchronous parent callback CPU mean/p95/max and native draw/encoding CPU subset, readback request counts, and final drain milliseconds. CPU measurements exclude async callbacks, workers and GPU execution. A large drain means queued work; higher submission FPS alone is not higher GPU/display cadence. Output/DPR, visibility and source checks remain enforced; only the explicitly clear-only cases permit absent geometry.

Ordinary rendering, default quality, ocean shaders, real-clock timing and product UI are unchanged this round. Seven interaction checks, complete build, delayed-fence/readback/CPU accounting tests and actual app callback routing pass. These are CPU/source checks, not iPhone results. No phone/proof screenshot pair or new device FPS exists in this environment. Use [the capture page](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-proof/proof/native-compare.html) separately; its reference is the embedded proof, not the [frozen original proof](https://daybuoy-ocean-proof.jacobcarroll51.chatgpt.site). Next: Jacob runs round 5 and returns JSON; identify the limiting path from measured cadence, CPU and drain, then test one ordinary-loop change for 120 seconds with the required images. Keep main/proof untouched and no credentials in this document.

## Native scene candidate — October 7, 2026

Jacob reports round 3: embedded proof alone 20.0 fps at DPR 2 with TAA/flare, hybrid host 12.1–12.8, all host cuts 16.2. The actual round-3 JSON was not attached in this turn; do not invent its per-row timings or thermal evidence. Existing `night-report/iphone-round2.json` remains the prior supplied raw evidence. These numbers motivate removing interop; they do not establish that the native DayBuoy scene will reach 20 or 30 fps.

The WIP default now selects a CPU-only Three camera/interaction host plus one native Tidewater WebGPU scene. No legacy renderer, wave mesh or WebGL context is constructed on successful native startup. No host layer render, external canvas upload or OceanComposite runs. The iframe remains a code boundary, not a second rendering context. Tidewater's internal refraction/depth copies, environment, shadows and postprocessing remain; “no copies” refers specifically to the removed cross-renderer host images.

New native scene: shared white-sand terrain and original water; directional DayBuoy sky palette; NOAA sun/moon directions and geometric lunar illumination; forecast cloud layers; an empty stand; native geometry for the existing solar arc and rain rings. Original camera, gestures, story, astronomy, forecast and all UI source files are byte-preserved. Native cloud shapes are a new procedural port, not a pixel-identical reproduction; sky grading, night/storm/cloud appearance, stand placement and solar presentation require device review. Catalogue stars, airborne sand and rain streak overlays are not yet ported. The requested fixed sunny fixture is the acceptance scope of this first scene pass; full-weather visual parity is not claimed.

All 214 vendor files and the full High ocean systems remain unchanged. Default native output is locked to DPR 2, TAA and lens flare, with no automatic quality reduction. Elapsed-time WaveClock is retained. Unsupported WebGPU uses the original labelled water; actual initialization/device loss lazily activates the original WebGL renderer with the existing camera and forecast. Old profiling cases still explicitly select the hybrid path for historical comparisons.

**Run round 4 · native** at `/ocean-profile.html`: native DPR 2 → DPR 1.75 → DPR 1.5 → FXAA at DPR 2 → flare off at DPR 2 → native DPR 2. Each case changes one setting, retains full ocean detail and records actual AA/flare/output settings with 15 s warm-up / 20 s measurement. Separate **Run native · 2 minutes** checks the sustained baseline. Schema 4 / revision `2026-10-07-native-1`; prior suites remain available. No phone result or accepted combination exists for this candidate.

`/ocean-proof/proof/native-compare.html` captures a pair on the actual device, holding the ocean state and wave clock. Left uses the embedded proof's native sky with the WIP white-sand terrain; right restores DayBuoy's native surroundings. It is explicitly NOT a capture of the frozen external proof deployment. Post history re-resolves, exposure/stateful surf are held, and capture runs separately from FPS measurement. No image has been generated in the agent environment; the exact frozen-proof comparison remains outstanding.

Automated verification: seven interaction checks, complete build, real Three camera projection, complete app startup/scene updates with zero WebGL context requests, profiler routing/independent settings and vendor/UI preservation. New native sky, celestial, stand and overlay pipelines validate on Dawn null with real draw submissions; it produces no pixels. Full native GPU validation still exceeds this environment's upstream adapter limits, and browser/iPhone visual/FPS verification is unavailable. Next: Jacob runs round 4, captures the pair and returns results. Keep main and the frozen proof untouched; revert an observed visual regression before accepting an optimization. No API keys or passwords belong in this handoff.

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
