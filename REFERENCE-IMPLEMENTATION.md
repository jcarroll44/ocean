# Verdict-first reference v1 — branch implementation

The uploaded `daybuoy-reference.html`, six PNGs, fonts and board are preserved at `ui-reference/`. The COPY START / COPY END CSS is copied verbatim to `src/reference.css` and embedded unchanged. The exact five supplied font files ship with it. The 3D scene replaces only the reference's stand-in backgrounds/FX; OS status bars and device frames remain board-only.

The app now uses the reference header, plain five-stat row, day pills, 24-hour track and 52 px action/share row. One selected forecast timestamp feeds the headline, temperature, detail, stats, day and track. No reference weather numbers are copied into production data. The six state branches cover live midday, selected time, playback, live night, offline/Retry and loading skeletons. The existing sheets and compact interaction mode remain.

Validation runs complete application startup and actual day-selection/Back-to-now/Retry handlers against parsed HTML, with clearly synthetic test fixtures held only in test code. It checks the state-to-markup bindings and the single right-side control. The separate seven interaction tests cover scene look, sun drag, timeline, pinch/reset, subject lock, return to live and playback pause. These are code/DOM checks, not rendered phone proof.

Complete camera, interaction, story, scene-data, lighting, weather-effects, celestial, explore, NWS and sheet files remain byte-identical to rollback `93a10eb91d888f40984d3edacadd67ced0642778`. The subsequent October 6 ocean correction activates the native Tidewater layer by default; the retained scene provides sky/land and an explicitly labelled unsupported-device fallback. See `OCEAN-INTEGRATION.md` for its narrow alpha/share build adapters and validation limits. Main is untouched.

## Blockers to acceptance

1. The reference removes Play when another day is selected, replacing it with Back to now. Thus a person cannot perform Saturday → Watch through the visible supplied controls. The implementation preserves the exact reference pending the user's choice of access to Watch. No extra button or repurposed action has been added.
2. No browser/iPhone capture surface is available under this runtime's Sites workflow. Screenshots within 2 px and the journey recording have not been produced or verified. A verbatim stylesheet does not prove final rendered geometry.

Private review page: `/ui-review/`. It shows the supplied PNG beside the actual 390 × 844 app viewport, without calling either a captured implementation screenshot. The user can operate the app there; reference state selection changes only the reference image. Phone captures are still required.
