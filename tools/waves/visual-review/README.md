# Shorebreak · revision 04 — September 25, 2026

This revision targets the missing motion between the standing wall and the crash: crest feathering, forward throw, a falling water curtain, then impact. It also adds a more irregular bright roller, thinning wash, reflective wet sand and backwash continuing into the next approach. The supplied Emerald Coast video is the visual reference. This is authored animation, not a fluid solver or a calibrated forecast model.

The isolated preview is `review/breaking-wave/`. It reconstructs the existing Ocean engine from a checksum-verified patch and uses its background, water lighting and beach. The production homepage and prior lighting work are unchanged. Its default **Beach camera** is now at `(0,1.2,-0.5)`, looking ten degrees down with a 50-degree vertical field of view. This same camera is held across all heights. **Low beach** lowers the eye to 0.9 m; **Original dune** retains the original camera. The preview's underwater beach slope is steeper to accommodate a shorebreak; dry sand retains its original slope.

The first comparison wave closes out across the view. Subsequent waves deterministically vary among closeouts, left breaks, right breaks and sections. A 100-event check produces 65 closeouts, 12 left breaks, 9 right breaks and 14 sectioned breaks. Height remains an individual nominal crest-to-trough height: 1 ft is a small lap, while larger heights produce taller faces and larger explosions. This is not significant wave height.

The water surface contains 253,216 triangles. Its concave face and rounded crest hold up while the lip moves forward and falls. A four-foot wave's sampled lip drops 0.92 m and advances 0.55 m over 0.55 seconds; the crest stays above 1.09 m. Only after the lip lands does the surface collapse and redistribute into the wash. Aeration follows the curved sheet. The turquoise face has a height-dependent transmission gradient, fine irregular surface detail and varying height along its crest. Closeout sections stagger by up to 0.46 seconds in the checked range.

Whitewater combines a moving, rotating turbulent volume, 140,000 deterministic lip/impact/foam/droplet seeds, and a raised foam surface. The lower, denser roller has bright highlights and shadowed pockets; separate droplets stretch along their projected velocities. Wash breaks into bubble clusters and lace, exposes the underlying sand, and leaves a reflective damp footprint as it retreats. The previous backwash persists across the cycle boundary while the next swell approaches. This overlap is choreography, not a fluid interaction solver. A common surface grid and continuous detail clock avoid the geometry and shading reset found during loop review.

Live controls cover height, curl, lip glow, foam amount, spray, peel speed, water/foam colours, period and break position. Settings persist locally. Replay, pause, scrub and a fixed-camera 2/4/6 comparison are available. The optional canvas recorder is retained for browsers supporting MediaRecorder; it has not been recording-tested in the connected browser.

## Verification

`check-rig.cjs` reconstructs the preview, verifies source integrity, parses the scripts, checks tuning and exports the actual background/water/volume/spray programs and geometry. `render_inlet.py` compiles and renders those programs through Mesa EGL with matching camera and weather. These are **native shader renders, not browser or iPhone captures**. The connected browser reports WebGL disabled, so it can only verify the published page and loading/error behavior.

`check-controls.cjs` checks presets, scrub/pause, tuning, colours, period changes, reset, persistence, input bounds, fixed comparison framing and event progression with a DOM/engine contract stub. `check-profile.py` uses transform feedback from the real vertex shader to measure height and throw/fall motion, tests 480 geometry combinations, checks break-pattern distribution and timing, and verifies runup, retreat and backwash continuity. `profile-check.json` retains those measurements.

`make-shore-clip.py` produces the 36.07-second 2/4/6 ft comparison at 30 fps, with a height indicator outside the rendered scene. Each segment includes the next approach and previous backwash. Its JSON sidecar records provenance. Review includes the encoded sequence, approach/feather/throw/fall/impact/wash screenshots, and 390 × 600 portrait renders. The AI reference is compared at corresponding stages; its moving camera is not copied into the size comparison. `review-video.py` decodes the delivered MP4 and flags the largest frame changes for inspection; those statistics are not aesthetic acceptance tests.

```sh
python3 tools/waves/build_rig_preview.py
node tools/waves/visual-review/check-rig.cjs
node tools/waves/visual-review/check-controls.cjs
python3 tools/waves/visual-review/check-profile.py
python3 tools/waves/visual-review/make-shore-clip.py --out /tmp/shorebreak-2-4-6ft.mp4
```

The revised timing shows the throw and falling sheet before the explosion. The curtain, foam and spray remain more regular and stylized than the AI reference. User visual acceptance, actual browser recording and physical iPhone performance are still open. The volume pass adds GPU work; native rendering does not establish mobile frame rate. Do not describe this clip as a captured app session or claim the reference's photorealism has been matched.
