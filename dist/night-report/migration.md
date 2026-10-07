# WebGPU migration inventory · 6 October 2026

Stage 1 is a partial, reversible renderer integration. `?ocean=webgpu` uses the native Tidewater ocean during supported daytime conditions; the unchanged WebGL renderer handles night, rain/storms, the visible sun path and Watch the day. The preview labels that handoff. This is not an approved whole-app migration.

| System | Current branch behavior / break | Remaining engineering estimate |
|---|---|---|
| Native ocean | Original FFT, shore waves, lip, whitewater, swash, refraction, caustics and water material; host quality adapters. Actual phone validation pending. | 1–3 days after device results |
| Camera and input | Original modules retained by hash. The adapter forwards pose, FOV and off-axis projection; it adds no gesture handlers. | Half-day device regression |
| Forecast | H/2, period, wave FROM bearing, wind FROM bearing/speed and tide mapped. Spectrum energy remains relative, not calibrated Hs. Directional shore field rebuild runs in a worker. | 1–2 days calibration against supplied clips |
| Sky and daylight grading | Native atmosphere is in the WebGPU frame. Approved GLSL sky cannot run directly in this engine. Its exact appearance is not preserved yet. | 2–4 days WGSL port and comparison |
| Clouds | Native aggregate coverage is wired. Separate forecast low/mid/high layers are not ported. Original rain states use WebGL. | 1–3 days |
| Sun / moon / stars | Exact app solar direction forwarded by 180° coordinate rotation. Native moon has a generic full disc and stars are procedural, so night deliberately uses approved WebGL. | 2–3 days for lunar limb/phase and star catalogue |
| Sun arc and glow | Original Three.js meshes, UV glow, ticks and sun hit geometry remain on the original renderer for now. Story camera source is unchanged. | 1–2 days native geometry/material port |
| Sand | #EFEBE2 pigment adapter preserves native wetness and shading. Foreground slope 0.105; 2–4 m dunes behind. Native swash nominal 0.066 is still inherited. | 1 day swash/shoreline comparison |
| Shadows | Native terrain and instanced vegetation receive native shadowing. Exact approved sand/shadow appearance not reproduced. | 1–2 days |
| GLSL ShaderMaterials | None can be passed directly to Tidewater's WGSL material system. Heat haze, rain, lightning and moon glint require ports. | 2–4 days |
| Share export | Existing export currently renders original WebGL water, even when the live frame used WebGPU. A unified native snapshot path is still needed. | Half–1 day |
| Fallback / loading | Original scene renders while native initializes. Failed WebGPU, device loss and timeout keep the original water and data. If WebGL itself is unavailable, a non-canvas forecast state is still a release task. | Half–1 day real-device failure testing |
| UI | Same real app and data, plus branch-only A/B presentation. No copied Tidewater controls, people, island or boats. | Half–1 day accessibility/phone QA |

Estimates overlap and are not a promise to complete everything in one day. Budget roughly 2–3 engineering weeks for a fully accepted migration, depending on the phone result. Recommendation: ship the approved WebGL renderer in the beta if the native ocean cannot meet both appearance and sustained frame-rate gates.

## Measurement limits

This environment cannot render or operate the user's iPhone. CPU checks, native source integrity and isolated shader compilation do not establish visual quality, stable 30 fps, touch ergonomics, or WebGPU compatibility on every iOS device. No screenshot or clip was manufactured as proof. The exact comparison reference videos are not present in this checkout; calibration remains open.

## Phone protocol

1. Open the ocean proof in Safari at normal phone width, full charge. Use Auto, 3 ft. Leave it visible; do not record while benchmarking.
2. Run the two-minute check. Export the JSON. A pass requires every measured rolling 3-second window and overall rate to reach 30 fps. A mean above 30 with slower windows does not pass.
3. Record the separate 10-second wave-clock clip. At an 8-second test period, its phase advances 1.25 cycles in 10 real seconds at any render rate. MP4 is used when Safari's recorder supports it, otherwise WebM is explicitly named.
4. Capture full/tuned stills at 3 ft and 5 ft. Full uses native DPR up to 3 and original ocean detail; both retain the phone reflection cube. The two panels freeze wave phase and swash history. Spray budget changes reset particles, so individual droplets are not an exact match.
5. Inspect curl, whitewater, foam lace and clear shallows. Reject a lower quality setting if those disappear, even if it meets the frame-rate target.
6. Retest for thermal slowdown after 10 minutes, then repeat in the native WKWebView shell when available.
