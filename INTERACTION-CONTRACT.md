# DayBuoy interaction contract

Authority: Jacob's October 5, 2026, 8:54 PM America/Chicago request. This replaces all earlier gesture instructions. Read this file before each round. Changing the sun camera must never change gesture ownership.

## Gesture ownership

| Starts on | One finger | Release |
|---|---|---|
| Beach/sky canvas, outside the sun hit target | Look around from the current position. Never change forecast time. | Light, bounded inertia, then hold the view. |
| Sun's 60 × 60 CSS-pixel hit target | Move time along its actual projected solar path using both axes. | Hold the chosen time. No sun-drag coast or hour snap. |
| Selected-day dock track | Scrub only the selected day's 24 hours. | Bounded momentum and soft hour/moment detents; never cross midnight. |
| Expanded sheet's curve | Scrub time for that subject. | Retain time and the compact sheet. |

A gesture owns its role until all relevant fingers lift or the system cancels it. Dragging across the sun or dock cannot turn a look into a time gesture. A second scene contact promotes the current scene/sun gesture to pinch; it cancels time momentum. UI buttons, sheet controls and dock contacts are not part of the scene pinch area. Cancellations and lost capture must not leave controls stuck or start momentum.

- Manual look rotates yaw ±90° relative to the heading when the user first takes control; that anchor persists across drags. Pitch is limited to −20° through +60°. No translation, roll, WASD or pointer lock.
- Pinch changes FOV only, within 35°–80°. Pinching and looking do not change selected time, selected day or forecast values. A live clock may continue ticking normally.
- Double-tap the scene: ease back to the approved default camera for the current time, without changing that time. It is not Back to now.
- A manual view stays held through ordinary time scrubbing. Double-tap, Back to now, day change and explicit Watch playback release that hold. Subject sheets temporarily take precedence while their curves are being scrubbed; looking at the scene deliberately takes camera control again.
- Tap a day to select it at the same hour. Day changes clear the manual view and use a calm transition. Back to now clears manual/time motion, returns to live, and restores the home view.

## Watch the day

The explicit play control gives the camera to the approved 20-second story. Any touch pauses playback and freezes its clock and camera, handing scene control back immediately. Dragging that same touch may look around. Further scene touches do not resume the story. Only the explicit Resume/play control resumes. Paused playback must leave the dock usable. Intentionally scrubbing forecast time exits the paused story so its old moment headline cannot describe the newly selected hour. Closing the story can restore the user's pre-play time and camera, including their manual view.

## Automatic camera

Preserve the approved `beachPose` from `skyview-beach.html`: 28→70 m back, 10→26 m up, FOV 55°→80°, sunrise/sunset heading and daytime easing, no drone/top-down mode, horizon no lower than 62% outside the explicit glance. Astronomy remains at the true azimuth/elevation. Automatic manual-time transitions use critically damped easing, max 30°/s turning and 5 m/s movement. These limits do not throttle direct finger-driven looking.

The midday glance tilts in place for about 1.5 s during the story or on the elevation-pill tap, then returns. It is not triggered by looking or normal timeline scrubbing. Free manual look may look higher than the automatic horizon limit. Pinching may narrow the lens below the automatic FOV range.

## Dock and sheets

- Keep existing day strip, five metric tiles, action and share controls; selected-day track spans midnight to midnight. Preserve real forecast data and red today/now tick.
- Compact the dock when interacting with the scene or time track; restore full size 1.5 s after release/momentum ends. Stay above the safe-area inset. Camera look does not shrink the temperature into the time-scrubbing header.
- Shrink the header only during a time drag; restore the full header after release. Never overlap text layers. Selected time persists and Back to now stays available.
- Water/Waves/Wind curves use their water-facing subject cameras, not the sun camera. Opening one locks to the subject; curve scrubbing remains locked. Closing restores the held home look, if any.
- A sheet becomes a ~170 px peek while scrubbing and stays compact on release. Pull its handle up to expand. Scene and sheet gestures never share the same pointer owner.
- Keep approved water, sky, lighting, NOAA calculations, menu design and stand removal. A gesture correction is not a scene redesign.

## Required audit before every delivery

### October 5 presentation addendum

Jacob approved a combined presentation pass after the gesture correction. These presentation rules supersede older visible-compass and selected-day-time-pill rules; gesture ownership and the approved automatic camera remain unchanged.

- Keep each day name visible. Keep the selected day and time in the header after release; a drag tooltip may additionally show time. Only current, connected, fresh live forecast mode uses the pulsing red dot. Saved/offline forecasts disclose retrieval time.
- Hide the scene compass strip. Sun-sheet details expose the bearing. Top-right playback and Back to now have separate positions.
- Forecast verdicts stay in the primary action. Playback progress uses its own thin line. The action opens the subject described by its copy.
- Full dock uses the existing five tiles, a 218 px footprint at 390 × 844, and safe-area bottom + 12 px. Compact remains approximately 92 px. On shorter embedded viewports, readability takes priority over a percentage height cap.
- Use Poppins tokens and shared spacing from `src/presentation.css`. Preserve contrast rather than lowering tile text opacity. Respect reduced motion for the live pulse and UI transitions.
- Burn and sunset figures remain explicitly labelled estimates, with methods accessible in the Sun sheet. Methods may scroll without collapsing the sheet or changing time. Forecast-backed lower-UV windows are estimates, not a tanning safety claim.
- Camera framing, sky/night rendering, lifeguard stand removal and physical scene are unchanged by this pass. Midday sun-plus-ocean composition is a separate camera task, not permission to alter astronomical geometry.
- `node scripts/check-presentation.cjs` checks copy, state disclosure and action routing. The build runs it alongside the seven interaction checks. These are not rendered screenshots or a device test.

### October 5, 10:04–10:06 PM redesign approval

Jacob explicitly approved the sun and Watch camera, and rejected the prior menu as too similar and too spacious. This supersedes the preceding visual layout specifics, not the gesture contract.

- Freeze camera, story choreography, water, sky and astronomical code. The UI build asserts their complete file contents against cf23f514100647c3664a36c0b6c84caef429022c. Change this freeze only for a newer explicit camera/scene request.
- Home is a composed location/temperature header and one ink forecast panel. The five readings form a shared row, followed by day selection, timeline and contextual action/share. Individual pale card backgrounds are removed. Full panel remains 218 px; compact remains 92 px.
- Watch is a labelled control just above the day panel. Pause/Resume stays in that location. Back to now stays top-right. On desktop, header, dock and sheets share a left alignment instead of spreading controls across the scene.
- Sheets suppress the large home header, retaining selected time in the masthead. Water uses a compact verdict and one row of water temperature, wave height and wind, with the tide curve directly below. Wave/Wind readings are direct links to those subjects. The old fixed 355 px Water height is removed; content sets the height. No giant water-temperature block or repeated rip-risk row.
- All sheets use the same ink material, readable type, direct close button and quiet charts. Peek behavior, source disclosure and time ownership remain unchanged.
- Run `node scripts/check-menu.cjs` (included in build): test actual sheet markup and static CSS cascade across live, story, compact, water and night states. State explicitly that these checks do not render the UI.

### October 5, 10:43–10:46 PM reference approval

Jacob approved the reference sun/moon and then selected the newer time-led header. This supersedes the temperature-led header, dark panel and Watch placement above the dock.

- Selected local hour is the primary readout, with AM/PM and day alongside it. Air temperature is smaller at the right. One verdict and one real-data detail sit below a fine divider. The location stays in the small masthead.
- A compact top control groups Now, the selected day/time (when exploring) and the existing Watch/Pause/Resume control. Now returns to live in one tap. Reuse existing event handlers and preserve gesture ownership.
- Light sea-glass panels, ink text and a sea-blue action replace the dark dock and sheets. Keep the existing dock layout, 218/92 px sizes and compact Water layout.
- The single sun gets a cream-white disc and softer bloom. The moon remains a shaded sphere with real phase, limb, position and cloud occlusion. Celestial discs may be enlarged for legibility; this is display styling, not a new angular-size measurement.
- Only `src/celestial.js` changes the celestial display, after the existing camera update. Camera, astronomy, ocean, forecast cloud/light code and story files remain byte-identical to the existing freeze. No new sun object or altered water material. Tests cover the new clock, Now state, light surfaces and celestial-only scope.

### October 5, 11:04 PM wave-only approval

Jacob requested Tidewater-like rough-wave shapes in the existing ocean. Only the breaker profile and foam-deposition masks may change. Retain material colour/light calculations, sky, beach, sun/moon, camera, interaction ownership, quality settings, spectrum and forecast inputs. The first isolated adaptation uses the existing one water mesh and foam buffer; it adds no Tidewater runtime or extra rendering pass.

The `?breakers=tidewater` preview enables the adaptation. The ordinary URL retains the approved baseline until the required rendered 3 ft / 5 ft before-and-after gate can be reviewed. CPU geometry and shader compilation do not satisfy that visual gate. Never silently promote it based on source tests alone. Credits live in Waves → Sources & forecast details → Open-source credits.

Run `node scripts/check-interactions.cjs` and `node scripts/build.mjs`. The build runs the contract checks automatically and fails on any failing assertion. Do not weaken/delete a check to make a conflicting implementation pass. Change the contract only for a newer explicit user instruction.

1. Drag scene → view rotates, time unchanged.
2. Drag sun → time changes, sun moves along its path toward the finger.
3. Drag scrubber → time changes, dock compacts.
4. Pinch zooms; double-tap resets without changing time.
5. Water sheet: scrub tide → camera stays on water.
6. Back to now → live and default home view.
7. Watch the day plays; any touch pauses and releases camera control.

Also check gesture crossing, hold persistence, angle/FOV limits, day boundaries, release/cancel, second-finger promotion, sheet peek persistence, and explicit story resume. Report actual results and verification scope every round. Automated event/geometry checks are not a browser visual check, phone recording, or FPS benchmark. Any failure blocks the round; unavailable device verification stays explicitly unverified.

## 6 October overnight branch exception

Branch `night-pass` stages a separate Site. It must never be merged to the main app without the user's approval. `night-presentation.js` and `night.css` introduce switchable Verdict-first / In-the-scene compositions, with a 216 px maximum phone dock, advice-led action and a white Back to now pill. These override the prior time-led header only in this isolated preview. All input semantics and camera/story/astronomy source files remain unchanged.

The WebGPU adapter is staged, not feature-complete. It forwards the existing camera and real forecast during supported daytime conditions. Night, rain and visible sun-path/story states retain the original WebGL renderer until their native ports pass review. Unsupported, failed or lost WebGPU must fall back without suppressing forecast data. Preview diagnostics belong only to this test branch.

Run `node scripts/check-interactions.cjs`, `node scripts/build.mjs` and `node scripts/check-night.mjs`. Keep original checks intact. Paste actual results and clearly distinguish CPU/source checks from phone touch/render verification. Never infer 30 fps or visual acceptance from tests alone.

## October 6 rejected overnight preview — rollback authority

The user rejected the overnight compositions and the partial renderer handoff. Withdraw `night.css`, `night-presentation.js`, `night-bridge.js` and the experimental breaker injection from the app build. Keep Tidewater only on its proof page pending the user's phone result. The production water source must match `d008588a`; preserve the exact approved `beachPose` plus the later approved gesture ownership, calm transitions and Watch choreography. Main stays untouched.

Fix functional state errors in the previous layout while awaiting the user's exact HTML/CSS reference. Direction 1 (Verdict first) is recommended, **not permission to invent its screen**. Back to now is hidden in live mode, and only one selected-time readout is visible at rest. The header and all tiles use the same selected forecast timestamp. The main screen has no floating elevation pill; Sun-sheet astronomy and the approved Watch glance remain.

`check-rollback.mjs` must execute startup and the real day-click / Back to now handlers against parsed page HTML. It must reproduce the rejected build's null-append error, then verify it is absent from the repaired build. Confirm the water's byte identity and lack of experimental renderer/shader activation. Retire the rejected A/B layout and wave experiment build gates; their source remains in history. The wave-only UI freeze no longer applies to the requested UI repairs; the exact baseline-water check replaces it. No rendered comparison or pixel-perfect claim until the exact reference and browser QA are available.

## October 6 exact Verdict-first reference v1

The user supplied `daybuoy-ui-reference-v1.zip`. `ui-reference/daybuoy-reference.html` is now the visual authority. Copy the complete COPY START / COPY END CSS byte-for-byte and the supplied Poppins fonts. Match its home markup and live, selected, playing, night, offline and loading states. This supersedes the previous home composition, type/spacing, dock height and button treatment. No substitute design, placeholder forecast readings or scene-image replacement.

- Keep the real 3D scene, approved camera and gesture ownership. The state renderer samples one selected forecast timestamp. Days keep names; the track is that day's 24 hours. The right-hand control is exactly one of Play/Pause, Back to now or Retry, as in the reference.
- Offline shows the amber retrieval-time banner and dimmed stats/days. Loading uses the exact skeleton, with no synthetic readings. Night uses the moon thumb. The sky pill is anchored to the actual visible sun and hidden if it would overlap the header; no invented solar placement.
- Maintain existing compact-while-scrubbing and sheet interactions; those states are outside this six-screen reference. Status bar, Dynamic Island, board frames and stand-in scene images are explicitly board-only, not app UI.
- `check-reference.mjs` exercises the real parsed page and state/data bindings; `check-reference-preservation.mjs` checks exact CSS/font copies and byte preservation of camera, interaction, story, water, sky, astronomy, surf and sheet source. These replace the previous header-specific/rollback-markup assertions. Keep the seven core interaction checks and celestial/proof gates passing.
- Pending user decision: selected-day markup replaces Play with Back to now. Do not add an extra control or repurpose the advice action without approval. The requested selected-day → Watch journey has no visible starting control in this exact reference.
- Main remains unchanged. No 2 px match, physical iPhone screenshots or full-journey video may be claimed without rendered evidence.

## October 6, 3:37 PM — Tidewater ocean in the actual preview

Jacob explicitly requests the real Tidewater ocean and wave form, without its sky, land, controls or UI. This supersedes the proof-only/old-water rollback restriction on this isolated preview. Main remains unchanged.

- Default WebGPU-capable preview uses the pinned native FFT, ShoreWaves, Breakers, Spray, SurfFoam and ShoreSim. No formula approximation and no opt-in URL required.
- Original source supplies the sky, sun/moon, beach, camera, weather overlays and UI. Ocean coverage masks replace water pixels only. Unsupported/failed WebGPU retains the original renderer with a visible disclosure; scrubbing, stories, night and storms never trigger fallback.
- Match the exact approved camera transform/projection each rendered frame. Forecast H/2, period, direction, wind and tide feed the ocean. Wave phase uses real elapsed clock time.
- Share captures must use the displayed Tidewater canvas. Reference CSS and all seven gesture checks stay intact.
- Run actual native shader/pipeline validation plus interaction/build checks. These do not establish iPhone FPS or visual acceptance; report missing phone/rendered evidence explicitly.

## October 6, 9:38 PM — iPhone profiling authority

Wave work stays on GitHub `wip/tidewater-in-app`; main, the standalone proof and the UI workstream remain unchanged. First measure the fixed sunny 3 ft / 8 s / zero-tide scene on an actual iPhone. Lock DPR 2 and quality during ablations; isolate FFT, shore shader evaluation, surface foam shading, spray, swash, refraction, transparent draws, reflection and imported-image updates. These systems share work, so report exactly what each switch removes and do not treat differences as additive timings. Fixed inputs and the resting proof camera are restricted to the explicitly labelled diagnostic route.

No appearance optimization is accepted before phone profiling. Next rounds change one measured bottleneck at a time, compare same-moment phone/proof captures, and undo visual regressions. Acceptance requires at least 30 fps for two minutes on iPhone Safari, with the picture retained. Preserve the elapsed-time wave clock, labelled WebGL fallback and Tidewater MIT credits. CPU tests and cloud browser emulation cannot satisfy the phone gate.

## October 7 — host profiling authority

Jacob requests six diagnostic comparisons with the ocean ON at DPR 2: native proof alone, second legacy layer removed, shadow maps off, atmosphere/background baked or simplified, post/final composition bypass, and all four host cuts together. Keep these behind the labelled profiler; cuts may deliberately alter diagnostic pixels and do not authorize a visual change to the ordinary app. Repeat baselines, retain full native ocean detail, disclose exact remaining work and record each row's actual output dimensions. Do not infer the responsible renderer from the prior all-ocean-off row: it retained shared scene/post work, and the legacy background itself still contains old-water shading. Main, frozen proof and UI stay unchanged.

## October 7 — single native renderer authority

Jacob requests replacing the hybrid WebGL/copy/composition host on WIP with one Tidewater WebGPU scene: DayBuoy sky, sand, sun/moon, empty lifeguard stand and the approved beachPose camera, with the exact HTML UI retained. This supersedes the former requirement that WebGL draw the surroundings and the stand-removal restriction for this WIP scene. Retain original scene source for labelled unsupported/device-failure fallback; never initialize it during successful native rendering. Existing gesture, camera, NOAA, story, UI and forecast source files remain byte-identical.

First measure native High detail at DPR 2; compare DPR 1.75 and 1.5, FXAA in place of TAA at DPR 2, and lens flare off at DPR 2 independently. Repeat the native baseline; do not combine cuts or lower the ordinary DPR before measurement. Keep real-clock wave motion and the full pinned ocean. The sky/object port is a review candidate, not a claim of matched pixels. CPU/shader validation cannot satisfy the phone screenshot pair or 30 fps for two minutes. Preserve old profiler routes as explicit legacy diagnostics.

## October 7 — frame scheduling diagnostics authority

Jacob requests round 5 at DPR 2: an empty clear-only WebGPU scene in the same page/loop, native rendering without GPU-to-CPU readbacks/waits, native rendering without only the profiler completion wait, and CPU milliseconds for every case. Repeat the native baseline; include both original-gate and ungated clear-only rows to distinguish loop scheduling. Keep these changes behind the profiler, with full ocean settings in all nonempty rows and ordinary rendering unchanged. Measure parent rAF callbacks even when the completion gate skips a render. Distinguish synchronous JS callback time from asynchronous callbacks and GPU work. Label rAF submissions separately from completed frames, record a final queue drain, and never accept submission FPS as proof of the 30-fps/two-minute target. No claim about which change removes the cap until real iPhone results return. UI source, pinned ocean, elapsed-time motion, labelled fallback, MIT credits, main and frozen proof remain unchanged.

## October 7, 10:40 AM — production pipeline authority

Jacob authorizes replacing the ordinary native one-frame completion gate with a pipeline of at most two submitted, unconfirmed frames. Draw/rAF must not await completion; an asynchronous observer counts only resolved GPU submission watermarks and applies backpressure at two. CPU readbacks stay asynchronous; water-height transfers occur at most every fourth rendered frame, while GPU height queries remain current. Preserve real-clock waves, fixed DPR 2/High defaults, fallback disclosure, ocean appearance and product UI.

Round 6 measures DPR 2/1.75/1.5, FXAA and flare-off independently on that new loop, repeats the baseline, measures a combination suggested by actual device rows, then runs a preferred measured candidate for 120 seconds. Report the selection rule and actual settings; never assume additive gains or promote visual cuts automatically. GPU-completed counts in every whole second determine sustained throughput. Notification gaps are not individual GPU frame durations, and rAF/submission counts cannot pass. Provide a separate same-clock reference/candidate capture at the selected settings; absent phone pixels remain unverified. Existing historical checks remain intact; main, frozen proof, approved camera/gestures, astronomy and UI sources stay unchanged.

## October 7 — adaptive production resolution authority

Jacob explicitly promotes the reported round-6 combination to the ordinary WIP: initial DPR 1.5, FXAA and lens flare on. This supersedes only the previous DPR-2/TAA default restriction. Keep full High ocean detail and the bounded two-frame pipeline. Adapt using confirmed GPU completions in one-second windows: lower only below 32 fps toward DPR 1.35, with a hard floor of 1.25 if cadence stays low; increase only above 38 fps toward 1.6. Use 0.05 steps, hold at 32–38, and change render targets only when outstanding frames have completed. Count resize pauses and zero-completion seconds; never reset or omit them to pass the gate.

Round 7 measures those actual production settings in the existing fixed scene after 15 seconds of warm-up for at least 120 seconds. Every whole second must record at least 30 GPU-completed frames. Audit actual dimensions each submitted frame and record each DPR change with its triggering cadence. Existing fixed-DPR diagnostic checks remain intact. Provide a separate fixed DPR 1.5 / FXAA / flare-on capture against the same-clock embedded proof reference, identifying its WIP terrain and distinction from the frozen external proof. No screenshot or new phone result may be inferred from CPU tests. Real-clock motion, labelled fallback, MIT attribution, camera/gestures, astronomy, product UI, main and frozen proof stay unchanged.

## October 7 — sunny sky approval and live-condition evidence

Jacob reports the round-7 two-minute performance gate passed (39.1 average, minimum 33, zero seconds below 30) and approves the wave/foam/water/sand comparison and DPR 1.5 + FXAA. Correct only the overly dark sunny midday sky by matching the proof's daytime atmospheric brightness/gradient, while preserving astronomical sun/moon and time-of-day transitions. Retain all approved wave settings, real-clock motion, water/sand materials, fallback, licence credits, product UI, main and frozen proof.

The ordinary app must feed height H/2, period, direction, wind/chop and tide from its real forecast and use the approved beachPose. Keep fixed scene/time/camera overrides exclusive to diagnostic routes. Confirm the comparison page's offline banner comes from its intentionally paused review fixture; do not conceal genuine failures on the live route. Provide a separate current-condition phone recording route with actual conditions, timestamps and GPU-completed FPS measured before encoding. Never pass missing NOAA tide or sample/saved data off as live evidence. A physical phone clip remains pending until captured on that device; automated tests and a successful server-side fetch cannot establish it.

## October 8 — live overcast correction

Jacob reports live 42 average / 40 minimum FPS and requests one WIP round correcting the full-overcast cloud deck, horizon pillars, weak 2.4 ft / 4.4 s oblique shore surf, purple sand/shadows, and dim midday exposure. Use one smooth neutral overcast sky for visible background, reflections and environment lighting; retain the clear/sunset/night paths and approved forecast H/2. Permit a bounded open-coast exposure adaptation for oblique incoming surf without changing incoming direction, period, offshore FFT, water material or pigment. Guard disconnected breaker geometry against long slivers. Keep UI, camera, adaptive DPR/FXAA pipeline, main and frozen proof unchanged. Run the strict 120-second GPU-completed gate on fresh live data, without video encoding; phone clips and sustained FPS remain unverified until recorded on the physical phone. No attached clip is available in this turn, so the reported horizon artifact cannot be visually diagnosed here.

## October 8 — overcast performance regression

Jacob approves the overcast look but reports 6.7 FPS at the DPR 1.25 floor, versus 42 previously. Diagnose the exact pre-overcast native source, overcast-1, deck off, oblique-surf adjustment off, exposure increase off and previous FOV; also isolate the lip guard. The camera/FOV did not change in overcast-1, so disclose that row as a repeat control. Use one fresh live snapshot (including sun/camera), full ocean detail, fixed DPR 1.5 + FXAA + flare on and repeated baselines. No sunny fixture or hidden adaptation. Label diagnostic cuts and hold them outside ordinary production. A candidate may flatten the deck and skip discarded clear-sky calculations while retaining neutral light, horizon gradient and shore surf. Include 120 seconds of completed-frame evidence for that candidate. Target recovery to 40 average with the existing 30-per-second floor; phone results and look remain unverified until measured. No assumed thermal diagnosis, no recording during FPS, no main/frozen-proof/UI edits.

## October 8 — automatic device evidence

Jacob authorizes server-side upload of every future test's JSON, scene screenshots and clip to `results/` on `wip/tidewater-in-app`, using a repo-scoped Contents-write token saved as the Sites secret `GITHUB_RESULTS_TOKEN`. Keep this Site owner-private. Never put the token in the browser, source, output, screenshots or request logs. The endpoint fixes repository, branch and results paths on the server; non-force commits must preserve concurrent changes. No changes to main or the frozen proof.

The current overcast, live and comparison pages auto-run on opening (`?run=0` is an explicit manual option). All profiler/capture routes auto-upload when finished, including partial reports on failure. Capture only after timed measurements: screenshots between passes, clip after the final pass; stop rendering before network upload. Keep a retryable evidence bundle in IndexedDB until the server confirms the GitHub commit. Disclose unsupported recording or failed captures in the report; never invent a clip, pixels or phone FPS. A successful upload check is not a device performance gate. On “ran it,” fetch `results/latest.json` and its referenced folder from WIP without asking for downloads.

Run `node scripts/check-results-upload.mjs` for route/path/branch restrictions, secret handling, idempotency and concurrent-push recovery, alongside the existing build/interaction checks. Migrate hosting to a Sites Worker while serving the approved static scene bytes unchanged.

## October 9 UTC — iPhone-only forced daytime diagnosis

Jacob requests the overcast diagnosis link itself force daytime/full overcast regardless of local clock, reject non-iPhones and stay running when the screen dims. Only this diagnostic route may override the sky: capture fresh live marine/tide first, then use the app's actual local-noon astronomy and approved beach camera with 100% cloud layers and zero rain/lightning. Hold those same inputs across ablations, including the historical renderer. Label the simulated sky separately from the live marine data; normal app weather/time remain unchanged.

Gate on explicit iPhone browser identification plus touch support before scene loading or uploads; this is not hardware attestation. Request a screen wake lock through the end of evidence upload, re-request on foreground return and expose denial/release status. Brightness dimming alone must not stop a visible test. Browser/OS background suspension cannot be bypassed: reject interrupted measurements rather than counting background time or claiming a lock-screen test succeeded. Release the lock on stop, completion or page exit. Test both device rejection and wake-lock lifecycle with mocks; physical iPhone behavior remains unverified until run there.

## October 8, 11:35 PM Chicago — close diagnosis; combined live gate

The uploaded forced-noon overcast run `2026-10-09T04-32-36Z-c9ead86e-d5da-48aa-8a9b-8c10e7cb8b15` records 55.8248788045 average / 54 minimum GPU-completed FPS at DPR 1.5 for 20 seconds, then rejects changed output dimensions. The regression did not reproduce in that row. Heat/mirroring were not instrumented and remain unproven explanations. Do not run more ablations or promote the cheap-sky candidate. Retire the overcast diagnosis landing page.

Publish the current Tidewater ocean with the approved exact Verdict-first v1 UI on new branch `wip/tidewater-verdict-first`, never main or the frozen proof. Verdict-first v1 is already integrated in this source; preserve its reference CSS/fonts and real-data bindings rather than importing the older `app-v2` UI. The single link `/ocean-live.html?gate=1` auto-runs 15 seconds warmup plus 120 seconds of fresh actual local-time forecast conditions, full ocean detail, adaptive DPR 1.25–1.6, FXAA and flare, followed by screenshots/clip/upload.

Browser toolbar resizes must not abort the active test. Pin the test iframe, app and native layer to initial CSS dimensions, overriding dynamic viewport height only inside the test. Log outer/visual viewport changes while continuing the same FPS clock; never reset/omit slow or zero-completion seconds. Keep strict actual-canvas/DPR checks and reject hidden, stale, missing-data or nonproduction runs. Normal product viewport behavior stays unchanged. Retain iPhone gate and wake-lock attempt/denial disclosure. Results remain on the established `results/` WIP evidence branch, with the integration branch/revision recorded in each report. No physical two-minute result or rendered UI/phone clip may be inferred from source/mock checks.

## October 11 — accepted live gate; condition-first scene polish

Uploaded iPhone run `2026-10-11T16-20-40Z-5bf5f55e-9f70-4481-b6e6-266ac2bf342b` passed: 36.6041 average, 33 minimum, zero whole seconds below 30 across 120.014 seconds. Keep High ocean detail, initial DPR 1.5, floor 1.25, ceiling 1.6, FXAA, two-frame pipeline, 0.05 steps and idle-only resizing. Jacob explicitly changes only the down threshold from 32 to 36 FPS (hold at 36–38), and removes lens flare. The performance drift is observed; thermal causation is not instrumented.

On `wip/tidewater-verdict-first` only, correct the unlit daytime moon's opaque dark disc while retaining its astronomical position and true phase at night; remove flare ghosts; use a cheap shared partial-cloud layer for the visible sky and reflections. Preserve the approved smooth full-overcast deck. Forecast cloud units are percent 0–100: this run reports 0.344–0.378%, not 34%; do not multiply the live inputs to invent weather. A 34% fixture must have materially partial coverage. Make the 2 ft / 5 s shore curl and breaking whitewater legible using bounded native-only breaker presentation, never inflated H/2, period or offshore FFT. Keep the lip/sliver guard.

All forecast headlines/action labels must describe conditions, not give activity advice or call conditions “safe”. Keep descriptive NWS risk information and missing-feed disclosure. Show `Forecast updated [retrieval time]` using actual retrieval, not selected/phone time. Preserve exact reference CSS/fonts and interaction/camera behavior. Story, surf, sheet and legacy action files permit only the specific copy replacements in `scripts/approved-condition-copy.mjs`; their remaining bytes stay frozen. New scene/condition tests supersede only the explicitly changed appearance/copy assertions, not the interaction, physics, strict gate or upload checks.

Send one auto-running `/ocean-live.html?gate=1` link: actual current forecast/time, iPhone-only, 15 seconds warmup, 120 measured seconds, then screenshots/clip/upload. Evidence still writes to `results/` on `wip/tidewater-in-app`. Main and frozen proof remain untouched. Automated CPU/DOM/shader checks are not new phone imagery or FPS; the revised look and speed remain pending that run.


## October 11, 12:12 PM Chicago — retain visuals; diagnose recurring stalls

Run `2026-10-11T17-03-50Z-077bc648-2041-4b1a-b497-631df8b4ee08` failed the strict gate: 34.1365 average, 11 minimum, 22 seconds below 30. The shore field was never pending in the recorded one-second samples; the second and third valleys occurred at constant DPR 1.25. The report cannot establish shader, upload, whitewater or thermal causation. Preserve the accepted moon/flare/clouds/small breakers/whitewater and condition-only UI, all physical forecast mappings, High quality, camera, 1.25–1.6 DPR range and 36 FPS down threshold.

Hoist the exactly equivalent small-surf foam strength to a forecast uniform; prepare the production passes with live weather/physical inputs during loading. Compute shore-direction resampling in the worker and fill replacement textures in at most 256 KiB chunks per submitted frame, swapping the complete field/direction pair together. Existing reflection updates already distribute their work across frames. Do not describe either as the proven source of the failed run.

DPR may climb back toward its prior operating level after eight consecutive >=36 FPS seconds; all upward steps have an eight-second cooldown to reduce resize oscillation. Ordinary >38 FPS headroom growth retains the same bounded 0.05 steps. Resizes still wait for zero outstanding frames and remain counted in the strict gate; no warmup extension or dropped slow bins.

The same iPhone-only 120-second gate automatically includes timestamped pipeline requests/synchronous compilation, texture allocation/upload events, CPU system encoding times, spray budget/emission rate and sampled actual GPU pass timestamps when supported. Explicitly label unsupported GPU timestamps and never equate CPU encode time with GPU duration. Trace and adaptive audit are captured before screenshots/video and auto-upload with the existing evidence bundle. No new phone pass or exact causal diagnosis is claimed from local checks. Integration work remains on `wip/tidewater-verdict-first`; main/proof and results destination are unchanged.

## October 11 — accepted baseline, public production and iPhone wrapper

Jacob reports the revised iPhone gate passed at 37.3 average, 30 minimum and zero seconds below 30. Preserve commit `0f6ff5b83dad580a9ea6c2272bb79aa67d556ce4` on `baseline/iphone-gate-2026-10-11`. This acceptance is user-reported: the repository latest-results pointer still identifies the earlier failed run, so do not relabel that upload or claim a new retrieved clip.

Jacob explicitly authorizes a separate public DayBuoy site containing only a minified production app, scene, assets and privacy/credit pages. Keep the existing preview, diagnostic pages and upload endpoint owner-private; do not copy its Worker or runtime secrets to public hosting. No source maps, profiling/capture controls, test routes or tokens in public output. Minification is not source confidentiality. The ocean source repository already has public visibility; this turn does not change that audience.

Production adapters may remove test-only wrappers and bundle/tree-shake the approved rendering modules; preserve the physical forecast mappings, camera/interaction code, reference CSS/fonts, weather/shore appearance, adaptive settings and bounded shore uploads. Keep legitimate shared-time URLs. Gate with the seven interaction tests, full build and `scripts/check-production.mjs`. Browser and physical iPhone verification remain separate from Node/DOM/shader checks.

Add a Capacitor iPhone beta project loading the public HTTPS origin, with local offline/retry and legal pages, icon, launch screen and MIT attribution. No location/camera/microphone access or upload token is needed. Target iOS 26 for WebGPU, restrict app-bound domains, and disable web-view inspection. The requested `server.url` architecture is documented by Capacitor as a live-reload feature not intended for production; disclose that tradeoff and Apple's remote-code/minimum-functionality review risk. Do not promise App Store approval or native performance from the Safari gate. Signing, archival, device verification and TestFlight upload require Jacob's Mac and Apple account. Main and frozen proof are unchanged.
# v1 release amendment · 2026-10-11

The user approved a release product layer (`src/release.js`) around the pinned
scene and input implementation. Preserve every existing gesture and ocean gate.
Native scrubbing adds bounded selection haptics; the existing sun, tide, wind and
wave interpolation remains the authority. Text updates remain capped at 10 Hz.
Home headlines and the main action describe conditions. NWS rip risk belongs in
Water; only a currently valid High period gets a small home chip. Failed fetches
retain validated cache with its issue time. Expired or out-of-period values are
explicitly last-known, never current. Holiday headings require bounded date
inference. No burn-time or sunset-score display in Sun, Watch, or story summaries.
The native app bundles production assets, has a current-conditions widget, and
uses optional configured OTA and diagnostics. A configured service is not proof
of an activated account or successful iPhone test. `check-release.mjs` covers the
new behavior in addition to all seven unchanged gesture checks.

## October 11 — data-driven weather release pass

On `wip/tidewater-verdict-first` only, Jacob authorizes separate low/mid/high
forecast cloud layers, visibility/humidity haze, precipitation effects, offshore
5–40-mile forecast sampling, storm potential, wind/gust effects, solar radiation,
heat shimmer and existing astronomical moonlight. Use bounded layered rendering,
not a volumetric port. Preserve the vendor tree, H/2, approved camera, seven
gestures, High ocean settings, FXAA, DPR policy and strict completed-frame gate.
Missing fields remain unavailable; label appearance and derived potential `est.`
with Open-Meteo attribution. Hourly gridded forecasts cannot establish observed
strikes, exact cell boundaries or minute-accurate arrivals; disclose that limit.

Keep the public beta, diagnostics and uploader behind platform authentication
until launch. Test fixtures are explicitly synthetic and private, never live
forecast evidence. The heaviest-fixture gate must measure 120 seconds on iPhone
with at least 30 GPU completions in every whole second, preserving zero/slow
bins, before screenshots/clip/upload. No automatic check can invent a pass or
rendered screenshot. Add fixtures and weather/data/material tests alongside all
existing regression gates. Verify product/native paths; distinguish Linux checks,
Mac compilation/signing, account configuration and physical-device acceptance.

## October 11 — accepted weather gate; readable night storm

Uploaded run `2026-10-11T20-52-12Z-23f4d081-f473-4db4-bdc7-b57d517b3a62`
passed the heaviest fixture: 35.478 average, 31 minimum, zero seconds below 30.
Jacob requests visible bolts every few seconds, coherent cloud/water lightning,
rain curtains, readable 6 ft surf foam and night-storm ambient light. Use bounded
shader/uniform work and reuse the existing fixed rain budget. No new FFT work,
volumetric pass, particle spawns, dynamic shadows or per-strike compilation.
Retain High/FXAA, DPR policy, two-frame pipeline, input physics and all gestures.
Reduced motion disables flashes. Lightning is an illustration of sourced storm
potential, not an observed strike. Clear-night astronomy/light stays unchanged.
Contact sheets must use authentic captures with revision/run provenance. Prior
phone captures and FPS do not validate newly changed pixels or performance.

## October 11 — rejected stencil weather; amortized volumetric replacement

Run 2026-10-11T22-25-52Z-f0b85086-fdf0-47d5-ab14-f25645871a55 failed:
33.058 average, 27 minimum, eight seconds under 30. The user explicitly
supersedes the layered-only and unchanged-clear-night restrictions above.
Replace stencil silhouettes and eight rain sheets with soft 3D procedural
density, erosion and sun/moon self-shadowing following Takram three-clouds MIT.
Bake a bounded low-resolution cloud atlas across frames; never raymarch the
full-screen sky/water. Publish only complete generations with a crossfade.
Keep 384 thin rain particles, all forecast mappings, true moon phase, unchanged
ocean inputs/quality, gestures, DPR policy and strict 120-second completion gate.
Night sky/reflection glow and foam may be lifted for readability. Preserve
Tidewater notices and add Takram notices. Main and audience stay unchanged.
New screenshots must wait for a completed cache matching the selected fixture.
Linux shader/scheduler checks cannot establish pixels or physical iPhone FPS.

## October 12 — accepted volume baseline; storm texture and sky-charm scrubber

Uploaded run `2026-10-12T01-23-23Z-d4722f36-e174-4ad6-8de4-4663f106f9c0`
passed 120 seconds: 37.634 average, 34 minimum, zero seconds below 30.
Its gallery was interrupted by visibility loss after Clear; there is no complete
new contact sheet. Keep the breaking waves, thin rain, wet-sand reflections and
performance policy. Refine branching lightning and internal cloud illumination,
and textured sun/moon/city-lit overcast with the existing bounded cloud cache.
Do not raymarch the full-screen sky or change water physics or camera ownership.

Jacob explicitly permits an additive scrubber presentation layer: selected-hour
sky charm with true moon phase, drag time label, astronomical light gradient,
sourced high/low tide marks and rain patches, hourly native haptics with stronger
sunrise/sunset/high-tide ticks, and rolling real readouts. Keep reference CSS/fonts
verbatim, all seven gestures, midnight boundaries, missing/stale disclosures and
reduced-motion behavior. No invented live weather or tide marks. Safari need not
provide native haptics. Continuous scrubbing may bake a lower-resolution coherent
cloud generation within the SAME 512-pixel frame budget, then refine at rest.

The strict gate still rejects hidden measurement and retains every slow second.
After timing only, gallery work may pause for visibility and resume; interrupted
clips must be discarded/retried, never labelled continuous. Add a synthetic
clear → storm → clearing day-scrub recording after timing, with source/revision
and capture limitations recorded. Actual contact sheet and clip delivery await
real rendered evidence, not mocked tests or generated artwork.

## October 12 — accepted cloud baseline; forecast optics refinement

Retrieved run `2026-10-12T02-13-15Z-d51c2ff3-8a93-4a95-9940-7a5d89ebb9c4`
passed: 37.344 average, 33 minimum, zero seconds below 30, all ten captures.
Jacob explicitly retains the approved clouds, breaking surf, thin rain and wet
sand lightning. Refine the same system: cloud-attenuated solar disc and glow,
no blue gaps at 100%, finer texture, continuous horizon, full-height gray-white
dense fog, warm neutral cloudy sand, data-bearing offshore shelf/rain curtain,
and stars, true-phase moon and physical moonlight reflection on clear nights.

Keep 512 baked cloud pixels per submitted frame, 18 primary/3 shadow steps for
the approved volume, and whole-generation crossfades. A sharper 512×128 cache
may refine longer at rest, with a six-second refresh preserving average bake
duty and finer erosion reusing the same noise sample. The approaching shelf adds eight bounded cache-only
samples at supported offshore bearing/range; skip it in local heavy rain. Stars
skip opaque storm/fog. The selected forecast supplies each immutable snapshot;
never publish the first eased frame as a completed target-hour cloud state.

Night-clear evidence may use the existing manual look from the approved beach
position toward a real Moon over the water. Label that fixture moon-facing and
record its timestamp, bearing and phase; never move a celestial body or change
live/default camera behavior. The private fixture hook is stripped from public
builds. Preserve all seven input checks, bounded DPR, High/FXAA and strict gate.
`check-weather-optics.mjs` and the actual cloud/material WGSL checks supplement
the existing suite. A new contact sheet and physical-device pass require fresh
rendered evidence; the accepted run above cannot validate this revision.


## October 12 — approved optics; sustained throughput correction

Jacob accepts the v3 night clear, overcast, fog and solar behavior. Uploaded run
`2026-10-12T02-53-35Z-17bbe948-ee0c-472d-9ad4-1129544e249d` failed:
32.5096 average, 27 minimum, 28 seconds below 30. Its detailed trace is null;
there is no measured GPU-pass attribution. Retain the clear-night shader,
physical moon path, phase, stars, cloudy sand, fog and sun response. Close blue
backgrounds at 85% cover, replace the bright weather horizon stripe with the
actual horizon cloud/rain column, and strengthen the data-bearing shelf/curtain.

The user explicitly permits less frequent, more distributed cache work. Keep
512×128 and 18 primary/3 shadow steps; reduce each submission to 256 pixels
(two half-rows per full row), refresh at rest every 20 seconds, fade rest updates
for 1600 ms and forecast changes for 400 ms. A 128×32 scrub cache completes in
16 submissions without restarting as the hour changes. New target hours also
publish a coherent coarse preview before full-detail refinement; gallery
captures wait for full detail. Exactly empty cloud
fields publish zero without GPU bake or recurring work. Skip discarded clear
sky/celestial calculations only under fully opaque weather; keep the approved
clear-night rendering. No water/surf/rain budget, DPR floor, High/FXAA or gate
threshold reductions. Preserve all seven input tests. Repair diagnostic-host
recognition across Sites iframe depth so the next upload contains CPU and,
where supported, asynchronous sampled GPU timings. Capture work remains after
the strict 120-second gate, with pause/resume only during gallery capture.
Fresh pixels and physical-device throughput must be identified as pending until
an authentic new upload exists; CPU/WGSL checks cannot substitute for either.


## October 11, 10:39 PM — accepted v4, shelf and glass-orb pass

The authentic `2026-10-12-weather-cadence-v4` phone run passed: 37.3 average,
31 minimum, zero whole seconds below 30. Preserve its ocean, breakers, clear
night stars/phase/moon path, solid overcast, fog, storm surf, lightning reflections
and thin rain. Main and public access stay unchanged.

Explicit exceptions to the prior appearance/source freeze for this pass:
- At the offshore sample's bearing/range, replace the flat shelf density with
  overlapping rounded rolls, soft boundaries, dark underside and irregular rain
  shafts. Advection uses the same integrated forecast wind as the cloud field.
- Blend storm water haze into the sampled dark horizon within the actual 2500 m
  camera range. Dense fog and clear-night resting light retain their prior values.
- No coarse cloud previews. Both cache states are complete 512×128 skies; retain
  the last complete sky until all 32 full-detail transition stripes complete,
  then crossfade. Rest work remains 256 pixels/frame and 20-second refresh.
- During forecast traversal, keep atmospheric readbacks current and smooth their
  contribution. Replace stale nearshore horizon colour with the current shared
  sky only during traversal/settling; at rest retain the exact original water.
- Add a 64×64 glass sky orb using the actual shared sky shader, cloud cache,
  lunar phase and tone map. One asynchronous readback at a time, ≤12/sec while
  dragging and ≤6/sec at rest. White rim/highlight, light-tinted glow, drag growth.
  No icon artwork or second rendering device. Respect reduced motion.
- Show weekday and time above the knob while dragging. Retain light-coloured
  track, sourced high/low tide and rain marks, hourly haptic requests with stronger
  solar/high-tide moments, rolling actual values and all gesture ownership.
- Record full app UI plus native scene for a full forecast day after the unchanged
  120-second phone gate; label DOM/scene composition accurately. Pause/resume
  gallery work when hidden. Ten real captures form the contact sheet. No encoding
  or screenshot work during the gate. New pixels/FPS require an authentic upload.

Validate cache publication/real WGSL, sky-orb WGSL/shared-source identity, bounded
readback, real-app DOM state, full-app capture orchestration, and all seven input
checks. Keep genuine native TestFlight signing steps separate from browser evidence.
