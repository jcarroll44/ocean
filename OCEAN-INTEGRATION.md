# Native Tidewater ocean — October 6 correction

The ordinary night-pass URL now loads `proof/ocean-only.html` automatically on WebGPU browsers. It runs the existing pinned Tidewater host (revision `4811ba48d795197de5621985f404e765c0b7c0ef`): FFT, WaterSurface/WaterMaterial, ShoreWaves, Breakers, spray, SurfFoam and ShoreSim. The 214 pinned upstream files remain unchanged.

`src/ocean-layer.js` renders the original DayBuoy sky/beach without its old displaced water or spray, sends that frame and the exact existing camera to the ocean renderer, then renders the existing rain/path overlay. `OceanComposite.js` uses native water/transparent coverage to retain original scene pixels outside the ocean. Dry land, visible sky, sun/moon, controls and UI are not replaced by Tidewater's scene. Only the existing WebGL framebuffer's alpha option changes so the foreground overlay can be transparent.

The native ocean remains active while looking, scrubbing, playing Watch, at night and during rain. Only unsupported/failed WebGPU triggers a visibly labelled standard-water fallback. Missing marine data is visibly labelled while waiting. A six-second Tidewater/WebGPU acknowledgement identifies successful startup. `?ocean-debug=1` retains live backend, measured frame rate, ocean resolution and quality on screen; `window.__tidewater` exposes errors and the pinned revision.

Wave phase uses monotonic elapsed time. Forecast wave height maps to H/2 amplitude; period, direction, wind and tide use the existing proof adapter. FFT energy is still a relative mapping, not a measured significant-wave-height calibration. Native water renders at auto DPR 1–1.5; final compositing keeps the original sky/land pixel dimensions. The existing quality budgets preserve FFT dimensions and breaker geometry while varying LOD, spray and reflection budgets.

## Actual checks

- All seven gesture contract checks: PASS (automated event/geometry tests).
- Default activation, old-wave suppression, exact packet forwarding, no mode-based fallback, failure disclosure and share-canvas selection: PASS (automated adapter test).
- Reference CSS/fonts, camera, story, astronomy, lighting, weather and original scene source hashes: PASS. Only framebuffer alpha and share-canvas selection are explicit build adapters.
- New background/final compositing shader pipelines: PASS on Dawn null; no pixels rendered.
- Full native GPU validation: BLOCKED in this container. Its null adapter exposes 16 KB workgroup memory and 16 sampled textures, below this Tidewater revision's needs. No limits or ocean features were disabled to manufacture a pass.
- Browser cross-context canvas copy, actual scene appearance, sustained phone FPS and phone clips: UNVERIFIED. No rendered/phone acceptance is claimed.

Main is unchanged. MIT credit and the full Tidewater license remain in Waves → source details → Open-source credits.
