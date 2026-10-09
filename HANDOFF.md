# DayBuoy — Tidewater handoff

## Current: combined live gate — October 8, 11:35 PM Chicago

This section supersedes the diagnostic instructions below. New integration branch: `wip/tidewater-verdict-first`; main, `proof/tidewater`, and the existing WIP code branch stay untouched. The approved exact Verdict-first v1 is already in the Tidewater source. Do not merge the older September 30 `app-v2` UI over it. Reference: `ui-reference/daybuoy-reference.html`, exact `src/reference.css` and bundled Poppins fonts. Tidewater pin: `4811ba48d795197de5621985f404e765c0b7c0ef`. Integration starts from GitHub WIP `2e9aab0481200280ffcf0d70cb225a70268bcc48` / Sites source `0b253b18e47aa73a1417f4dcc7a577fb7b48c49d`.

Single device link: [live 120-second gate](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-live.html?gate=1). iPhone only; open directly in Safari. Auto-run 15 seconds warmup, then 120 seconds of completed-frame evidence with adaptive DPR 1.25–1.6 / FXAA / flare, actual current time, fresh live marine and NOAA tide. No forced noon/clouds. Screenshots and a 10-second scene-only clip follow timing; upload is automatic. The existing server endpoint still saves evidence to `results/` on `wip/tidewater-in-app`; each report identifies the integration branch/revision. On “ran it,” retrieve that branch's `results/latest.json` and folder. Token remains server-only.

The test pins its iframe, app and native layer to initial CSS dimensions. This overrides dynamic viewport units only inside the test, so Safari toolbars cannot change the render workload. Outer/visual viewport changes are logged; the FPS clock never restarts and slow/zero seconds are not discarded. Real output/DPR mismatches, missing adaptation, hidden pages and stale/incomplete data still reject the run. Normal product resizing and UI/scene/camera source are unchanged. Wake lock is requested and status/denial shown; it is not guaranteed in an embedded browser or under OS restrictions.

Verified uploaded device report: `results/2026-10-09T04-32-36Z-c9ead86e-d5da-48aa-8a9b-8c10e7cb8b15/report.json`. Forced-noon overcast-1 baseline: **55.8248788045 average, minimum 54, DPR 1.5, 20 seconds**; aborted later with `DPR/output dimensions changed`. Wake lock was denied. The slow regression did not reproduce; this does **not** prove heat/mirroring caused earlier runs and is not a 120-second pass. Overcast diagnosis landing page is retired; cheap-sky candidate is not promoted. No more ablations requested.

Verification required: all seven interaction checks; exact reference UI/fonts and pinned vendor preservation; actual capture handler with mocked toolbar resizes, adaptive steps, bad-DPR/output rejection and post-timing capture/upload order. This round has no new physical two-minute run or rendered UI verification.

## Historical: overcast speed regression diagnosis — October 8, 2026 (closed)

Jacob approves the smooth overcast sky, removed pillars, visible shore curl and neutral sand, but reports **6.7 FPS with DPR at 1.25**, versus his previous 42. No new raw device results were supplied here. Temperature and the responsible change are not established.

Open [overcast diagnosis](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-overcast-profile.html). Close Safari completely and cool the phone for 10 minutes first; run unplugged without mirroring or recording. One button runs the suite; `?run=1` starts on open. Results persist in the phone's local storage and can be copied or downloaded. There is no automatic server upload.

- Same freshly fetched live forecast, tide, sun and approved camera snapshot in every row; fixed DPR 1.5, FXAA, flare on and full High ocean detail. The timestamp/conditions are disclosed. Adaptation is intentionally disabled for fair isolation. Missing/stale marine/tide or changed dimensions cannot pass. Non-daytime/full-overcast conditions are flagged as not reproducing the reported scene.
- Cases: overcast-1, the exact pre-overcast renderer, deck off, oblique-surf adjustment off, exposure increase off, old-FOV control, lip-guard off, cheap deck, repeated overcast-1 and repeated previous renderer. Then cheap deck for 120 seconds. Each has 15 seconds warmup and 20 seconds measurement except the final sustained row. Expected total 8–12 minutes including compilation/loading. CPU draw time includes warmup and is synchronous native JS only; FPS counts asynchronous GPU completions, not submissions or encoder rate.
- Prior native deployment source is pinned to Sites commit `b29957b11d46a92416233f2f4bcf8e2c44610404`; overcast-1 is `9104aae084372722e6124c9c0995aaad45a639b7` (GitHub WIP `b355d9157176f83f98f8b82ea63e75ca716ba9bc`). The checked-in historical archive has SHA-256 `f0f7cdd7cf6ea7c01896492adabb00d516ed200b68abcf27e6336f346235a22e`. Packaging adds only pending-shore-worker telemetry to that old native evidence API; renderer/shaders are unchanged. The current parent camera/UI is byte-identical to the prior version except diagnostic routing. FOV did not change in overcast-1, so that row is honestly an identical-camera repeat, not an invented narrower view.
- Cheap deck is **diagnostic only**, not promoted to the ordinary app: preserve grey radiance/gradient, neutral lighting, exposure, shore curl and lip guard; remove at most 1.8% animated sky variation, and use uniform early returns to avoid computing discarded clear-sky radiance in reflections/environment at full daytime overcast. Dawn/night/partial-cloud paths remain. This removes known work but is not proof of the sixfold regression's cause or a 40-FPS recovery.

Validation: all seven automated interaction checks and full build; actual runner exercised with mocked DOM/GPU across all eleven rows, constant snapshot and historical reloads, partial-result persistence and dimension rejection; all ablations checked for isolation. Cheap native sky/stand/lip/reflection/environment-input shaders compile and submit on Dawn null (no pixels). Full upstream environment filtering still needs 18 KB workgroup storage versus this container's 16 KB limit. No rendered browser/phone clip or new FPS here. Main, frozen proof, pinned vendor, product UI and approved camera remain unchanged. Next: cool-phone JSON identifies the winning cut; target 40 average and at least 30 in every sustained second, followed by look approval before promotion.

## Live overcast correction — October 8, 2026

Jacob reports live data working at **42 average / 40 minimum FPS**, with 2.4 ft, roughly 4.4 s, 9 kt ENE wind and full overcast. This is user-reported evidence; no clip or raw JSON is attached in this turn. The five-item WIP correction is a review candidate, not a verified visual fix or a new phone benchmark.

- Full daytime overcast now uses a soft, bounded-direction grey deck (subtle broad variation, no binary cloud blobs). Its module is installed before environment compute pipelines compile, so visible sky, water reflection and the sand/stand environment probe share the same deck. Direct sun fades out at full daytime overcast, diffuse light becomes neutral, and daytime exposure increases by at most 12%. Clear, low-sun/night paths, sand pigment and water material are unchanged.
- Native-only lip geometry now rejects disconnected/out-of-bounds crest endpoints symmetrically and collapses invalid segments to a bounded point instead of the distant sentinel. This targets a possible source of vertical slivers; **without the clip, the reported horizon pillars are not diagnosed or confirmed removed**.
- Confirmed 2.4 ft maps to 0.36576 m H/2 and period remains 4.4 s. A CPU sample of ESE 112.5-degree swell showed upstream nearshore exposure around 0.23–0.34. The WIP shore-worker applies a bounded square-root energy-to-height interpretation in shallow water for shoreward oblique swell, preserving field phase, refracted direction, tide, offshore FFT and H/2. It is an open-coast modelling adjustment, not a validated nearshore wave-height calibration. Head-on and offshore cases are unchanged; no minimum fake swell is added. Phone confirmation of visible small breakers/whitewash remains required.
- [Live capture and gate](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-live.html): first **Measure FPS, then record 10 seconds**. Then **Run live 120-second gate** uses a 15-second warm-up and 120-second completed-frame window on fresh ordinary live conditions, not the fixed sunny profiler fixture. Every whole second must reach 30; average alone cannot pass. Recording is never active during this gate. It rejects stale/missing marine or tide data, backgrounding, changed viewport, wrong revision or post settings. JSON includes before/after evidence, conditions/DPR samples, all one-second FPS bins and pass/fail.

Validation: seven automated interaction checks; full build; overcast/light math; H/2 and period; phase/direction-preserving shore processing; full two-minute synthetic pass/fail accounting; real native sky/stand/overlay, shared environment/reflection sky-input and guarded lip shaders compile/submit on Dawn null (no pixels). Full upstream environment SH filtering needs 18 KB workgroup storage, above this container's 16 KB limit, and is not device-validated here. No connected physical iPhone: new 10-second clip and live two-minute gate remain pending. All 214 pinned vendor files, product UI/camera sources, main and frozen proof remain unchanged.

## Sunny midday sky and live phone evidence — October 7, 2026

Jacob reports **round 7 passed: 39.1 GPU-completed fps average over 120 s, minimum 33, zero seconds below 30**, with adaptive DPR rising from 1.5 to 1.6. He approves the screenshot pair's waves, foam, water colour, sand and DPR 1.5/FXAA sharpness. No raw round-7 JSON or images were attached here; these are user-reported performance and visual acceptance. Temperature was not measured. The remaining visual request is a brighter sunny midday sky matching the proof.

Native sunny midday now samples `atmosphereSkyLuminance` from the same existing Tidewater atmosphere LUT used by its proof and sky reflection shader. It blends in between sun-direction Y 0.35–0.65, fades out with cloud cover 0.2–0.7 and rain 0.05–1 mm/h, and is fully applied in the fixed clear midday fixture. DayBuoy's real sun/moon discs, sunrise/sunset and night palette, clouds and time-of-day changes remain. No water colours, wave shaders, foam, sand material or reflection-strength multiplier were changed. The upstream water already used its atmospheric sky radiance plus screen-space reflection; the old visible custom sky was a different calculation. This aligns the visible midday base with that radiance. Pixel matching and performance of this new sky still require the phone.

The ordinary app already forwards current/selected real forecast height, period, incoming direction, wind and NOAA tide to the native ocean. `forecast.js` maps height to H/2 metres, period to shore/swell frequency, directions into scene coordinates, knots to wind speed/chop, and metres MSL to sea level. FFT energy is still a relative height mapping, not a measured Hs calibration. Existing real-clock phase remains. A new full-app test exposed that ordinary home still selected the older resting view, despite the approved beachPose being available for time exploration/Watch. The native adapter now routes only its ordinary unheld home view through the existing approved target/easing; user look, camera reset, sheets and Watch retain their original priority. Fixed profiling/capture retains its comparison camera. Tests exercise changing synthetic live marine rows, the approved midday position/FOV, manual look and the water-sheet camera. Original camera/gesture/UI/astronomy/forecast source files remain byte-identical; only the native adapter's default dispatch changes.

The fixed screenshot page loads `review=1` and deliberately skips live weather/marine refresh. Its fixture source is not classified as a live forecast, so the existing app UI shows Offline / Forecast paused. That banner is intentional there, not evidence of a failed fetch. An explanation/link is added on the separate comparison page; the product banner is unchanged. Ordinary fetch failures and cached data remain disclosed normally. A server-side run of the actual app loader at **2026-10-07T19:08:32.792Z** returned all five feeds fulfilled (weather, marine, air, NOAA tide/hourly and high-low): roughly 2.02 ft, 3.6 s, direction 81°, wind 9.57 kt, tide 0.048 m MSL, cloud cover 100%. This verifies that request path from this environment only, not iPhone Safari. The phone uses its freshly loaded values, never this snapshot.

Open [live phone recording](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-live.html). It embeds the ordinary live app with the existing debug FPS badge, with no review date, fixture or camera override. **Measure FPS, then record 10 seconds** waits through 15 s warm-up, counts confirmed GPU frames for 20 s without recording, then exports a 10-second device-canvas clip and conditions/FPS JSON. Fresh live data and a valid NOAA tide are required; sample/saved/stale data or missing tide cannot masquerade as current conditions. Encoding rate is not performance FPS. If Safari cannot encode that canvas, use iPhone Screen Recording on [the live app](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/?ocean-debug=1); the separate measured FPS download remains available. No physical iPhone is attached here, so no new phone clip or FPS is claimed. Today's fetched cloud cover was overcast; use [the fixed sunny pair](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-proof/proof/native-compare.html?profile-pass=native-pipe-combo&profile-dpr=1.5&profile-aa=fxaa&profile-flare=1) to review the specific midday sky change.

Also corrected diagnostic initialization: `BeachApp.profileConfig` is now parsed in its constructor, before native-scene selects the loop/adaptation/post settings. Previously it was only assigned inside async init, allowing initial choices to fall through to production defaults. Ordinary and round-7 settings stay the same; explicit fixed-DPR captures and historical diagnostics now take their requested settings from startup. A real-constructor test guards this order. Profiler revision `2026-10-07-sky-1` distinguishes this sky revision from the accepted prior run.

Verification: required seven interaction checks and full build, unchanged-source checks, live adapter/approved-camera tests, actual constructor configuration, stale/missing-tide guards, completion-before-encoding accounting and recorder cleanup. The revised atmospheric sky/celestial/stand/overlay pipelines compile and submit on Dawn null, which produces no pixels. These are automated tests, not phone evidence. Next: phone clip + JSON at real conditions, sunny sky pair review, then the existing 120-second gate for this revision. Main, frozen proof, 214 pinned MIT vendor files and product UI remain unchanged. No credentials belong here.

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

## October 8 — automatic device evidence uploads

- Runtime: existing owner-private Site now uses a Sites Worker for `/api/results`; the approved scene/forecast/camera/UI static bytes are preserved. `hosting/` retains the supported Sites/Vinext build integration. Run `npm run build` at root to build both parts.
- Server credential: `GITHUB_RESULTS_TOKEN` is configured as a hosted secret (expires January 6, 2027 per owner). It is never a client variable or checked-in value. Preserve owner-only Site access; the upload endpoint relies on Sites dispatch authentication plus a same-origin/custom-header check.
- Fixed destination: `jcarroll44/ocean`, branch `wip/tidewater-in-app`, `results/<UTC timestamp>-<UUID>/`. Each completed commit includes `report.json`, available scene screenshots and clip, and a SHA-256 `manifest.json`. `results/latest.json` points to the latest real test. Synthetic transport checks use kind `smoke` and do not replace that pointer.
- `/ocean-overcast-profile.html` and `/ocean-live.html` auto-run on open. `?run=0` opts into manual operation. `?gate=1` selects the live 120-second gate. Native comparison auto-captures and uploads. Historical suites also upload automatically after completing their selected tests.
- Encoding and network uploads never run during a timed FPS gate. Overcast screenshots are copied after individual passes; the ten-second clip follows the final pass. Live tests capture two screenshots and a clip after the selected gate. These are real scene canvas pixels, not browser chrome/HTML UI screenshots. Unsupported/failed captures are recorded explicitly, never fabricated.
- Pending bundles (including blobs) persist in IndexedDB until GitHub confirms the commit. Reopening a current test page retries prior bundles before measuring again. No token enters the client. Retries are idempotent; branch races retry against the new parent without force pushes.
- On the owner's “ran it,” fetch `results/latest.json` from the WIP branch, then its report, manifest, screenshots and clip. Check timestamps and capture errors. Do not ask the owner to download/upload JSON.
- Automated checks: all seven interaction handlers, unchanged camera/scene/UI source checks, actual live/overcast runner mocks, exact static-byte packaging, and upload validation/conflict/idempotency tests. No physical iPhone run or rendered browser QA was performed in this setup round. A hosted transport smoke test is separate from phone FPS evidence.
