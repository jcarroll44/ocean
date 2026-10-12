# Glass sky orb and coherent forecast pass — v5

Branch: `wip/tidewater-verdict-first`. Main and public sign-in policy unchanged.

Accepted input evidence: `2026-10-12T03-28-06Z-8d62be6c-c668-4482-8d77-fddf5acaafa6`, v4,
37.2975 average, 31 minimum, zero seconds below 30; all ten captures present.
The actual v4 trace sampled cloud-bake work at 0.17 ms average, 0.783 ms maximum.
These are sampled bake timings, not total frame cost or a v5 performance prediction.

Changes:
- Rounded overlapping shelf rolls and irregular rain shafts at the measured offshore
  bearing/range, with forecast-wind advection and dark undersides.
- Dark storm fog/horizon response, blending within the camera's actual far range.
- Only complete 512×128 skies become visible. 32 stripes during forecast transitions,
  then a 400 ms crossfade; unchanged 256-pixel rest stripes, 20 s rest cadence and
  1600 ms rest fade. Empty cloud fields still do no recurring bake work.
- Current sky horizon and smoothed atmospheric readings during scrubs remove the
  stale nearshore light contribution. Resting water/light path is retained.
- 64×64 actual shared sky shader in the glass thumb: phase-correct moon, clouds,
  native flash and rain; one asynchronous readback, at most 12 Hz drag / 6 Hz idle.
- Weekday + time tooltip, light track, sourced tide/rain marks, hour/moment haptic
  requests and rolling actual readings verified in the real built UI under Node DOM.
- Full-app 24 s day recording after the FPS gate: actual DOM/orb over the native
  drawable. This is a DOM/scene composite, not an OS recording; backdrop blur can
  differ. Raster errors are reported, never replaced by a scene-only video.

Validation completed:
- All seven registered input/geometry contract checks and full build passed.
- Cloud scheduler: complete-only publication, changing targets, empty-sky behavior;
  actual cloud WGSL/dispatch/bindings validated on Dawn null.
- Actual production water, sand, rain, lip and sky-orb WGSL semantics compiled.
  Dawn null cannot execute the entire scene due to existing resource limits.
- Bounded orb readbacks, transient light convergence and hidden-page behavior.
- Ten-fixture gate/gallery/capture recovery and full-app composition orchestration.
- Production build: 19 allowlisted assets, no diagnostics or credential leakage.
- Sites Worker retains byte-identical scene assets and the existing runtime secret.

No new rendered v5 pixels, OS recording, physical haptics or iPhone FPS are claimed.
The private gate automatically measures 120 seconds, records, captures ten fixtures,
assembles the real contact sheet, records the full-app day and uploads the evidence.
There is no browser-control capability in this environment; the Sites workflow
requires that browser QA be skipped rather than replaced with another browser path.

Mac/Apple release sequence: `native/TESTFLIGHT-READY.md`. Signing, App Store Connect
and native-device performance remain next-stage work after this visual pass.
