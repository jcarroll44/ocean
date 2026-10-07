# DayBuoy ocean proof — phone tuning

Main app remains untouched at `30826de2b421b6fae157e69374433aa0fb75b701`. Deploy this project only to its existing proof Site ID.

## Evidence

User reported iPhone Safari WebGPU at approximately 6 fps, 1170×2532. Tuned build has not been retested on that device. Do not claim 30 fps or a completed phone clip until actual results arrive.

## Quality

Auto starts at Balanced on a phone (DPR 1.25). Six bounded levels range from DPR 1.5 to 1.0, wave CDLOD range factor 2.5 to 1, 32768 to 512 active GPU spray slots, refraction scale 0.5 to 0.125, environment refresh 3 to 12 s and cloud-buffer scale 1 to 0.3. Phone environment cube is 64²; desktop 128². Output and each active setting appear on screen. Internal render scale remains 1.0, so displayed DPR is effective ocean output resolution, with no hidden extra upscaling.

Auto uses completed GPU submissions in a trailing 3-second window. After warm-up it lowers one level for a severe miss (<24 fps) or two consecutive <30 fps windows. Resizes wait for queued GPU work and use a 4-second settling interval. It holds quality once the target is met, continues monitoring, and reports an unmet target at the floor. No constant quality oscillation or hidden fallback.

The original 4×256 FFT, 768² swash, breaker geometry, foam and physical wave parameters remain. The active spray adapter extends upstream Spray, substitutes only the ring wrap bound with a uniform, and bounds dispatched/drawn slots. No CPU emitters exist in this proof. All 214 retained upstream files and original assets remain hash matched to `4811ba48d795197de5621985f404e765c0b7c0ef`; preserve LICENSE and CREDITS.

## Wave time

Previous render loop clamped dt to 0.1 s and discarded elapsed time on backpressure. `WaveClock` now derives wave time from performance.now(). `renderAt` seeds both G.time and FFT.time from absolute time before the original frame increment. Skipped frames, benchmark resets and quality changes cannot slow phase. Integration dt is bounded to 0.25 s for particle stability during long stalls; at 6 fps the full ordinary 0.167 s step is retained. Analytic wave/FFT phase always advances with real time, even below that rate. A full 8-second phase cycle takes 8 real seconds. Real spectra contain different component periods and irregular wave heights; this is not a promise that every crest is identical.

## Phone check

Open the proof in Safari, leave Quality on Auto, run the 20-second benchmark separately from recording. It scrolls the ocean into view to reduce off-screen scheduling effects. Read the live resolution, settings and recent completed FPS. Save results.

Tap Record 10-second timing check. It records only frames actually rendered; it never calls an extra simulation/render step to manufacture frames. The 390×844 recording overlays real elapsed time, actual G.time/FFT time, 8-second phase, resolution, quality and FPS. MP4 is used when supported, otherwise WebM. Backgrounding invalidates the capture. Encoding adds load: do not use recording FPS as the standalone benchmark. If canvas recording is unsupported use iPhone screen recording with the live clock.

## Verification

`node scripts/build.mjs`: source hashes, import closure, syntax, matched projection and slope; timing at 1/6/15/30/60/120 fps, stalls/backpressure, auto quality/floor, actual CDLOD node reduction.

`node scripts/check-spray.mjs`: added spray budget kernel compiles on installed Dawn null backend; bounds/instance/dispatch counts checked. No rendered pixels. Complete renderer validation remains blocked here by the null backend's 16384-byte workgroup limit vs original environment SH requiring 18432. No browser workaround or iPhone simulator claim.

The main app, camera, sun position and wave height/period inputs are unchanged. Physical beach slope is 0.105; upstream swash's internal nominal 0.066 is still disclosed in the page. Height inputs remain controlled tests, not calibrated significant-wave-height measurements.
