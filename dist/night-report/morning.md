# DayBuoy · Morning report

**6 October 2026 · `night-pass` · main unchanged**

The phone-tuning tools and branch previews are ready. **30 fps and visual acceptance are not yet proven.** No iPhone or rendering browser was available here.

## Decisions for you

1. **Ocean gate:** recommend keeping native ocean off main until the two-minute phone test and 3/5 ft comparisons pass.
2. **Header:** recommend A, Verdict first; B, In the scene, leaves more sky clear. Both are interpretations—the exact board was not available.
3. **Beta renderer:** recommend the approved WebGL build if the remaining WebGPU ports threaten launch.
4. **Data service:** arrange a commercial Open-Meteo plan before commercial release; I recommend a server-side cache/proxy to protect its key.
5. **Native scope:** recommend location on request, one useful widget and an opt-in best-hour notification; defer Watch/Live Activity extras.

## Phone result

Latest actual evidence remains **your report: approximately 6 fps, WebGPU, 1170×2532**. New Auto starts at DPR 1.25 on phones, steps down to 1.0 and reduces LOD/spray/reflection work. FFT, curling lip and swash resolution are retained. At 390×844 CSS size, DPR 1 gives 390×844 pixels; actual dimensions are shown by the test.

The proof now offers a **120-second benchmark**, **10-second real-clock recording**, and **same-wave-phase full/tuned captures**. Run those separately in Safari and save results. No new phone clip or rendered stills were produced here. CPU tests confirm an 8-second wave phase remains 8 real seconds at 1–120 fps.

## Preview and work completed

- [Phone ocean proof](../ocean-proof/): quality controls, frame-rate/backend/resolution diagnostics, white sand, capture/export tools.
- [Ocean in the real app](../?ocean=webgpu&header=verdict): app camera/data bridge and automatic original-water fallback. **Partial integration.**
- [Header A/B](design.html): lighter 216 px dock, advice-led action, live/selected-time distinction, loading/offline/no-data states.
- [Landward views](land.html): 2–4 m dunes, instanced oats/palmetto/scrub/pines and a wooden walkover with an empty stand. Visual review pending.

## Blocked / remaining

Night, rain and sun-path/story states retain the approved WebGL renderer; native sky parity, lunar shading, low/mid/high clouds, arc and share capture need ports. Native forecast inputs are wired, but wave-height calibration against the missing reference clips remains open. Full/tuned captures hold wave phase and swash history; spray particles reset with the budget. [Migration inventory](migration.html)

**Checks:** all seven interaction-contract scenarios pass in the event-handler test harness; approved camera/story/astronomy source hashes match. Unit mappings, fallback routing and instanced wind/fog shader checks pass. These do not replace phone visual or touch testing.

**Launch:** [dated checklist](launch.html), [privacy draft](privacy-draft.html), [sources and credits](credits.html). Planning targets start with your retest/choices on Oct 7; the checklist distinguishes engineering effort from Apple review. Nothing was merged into the main app.
