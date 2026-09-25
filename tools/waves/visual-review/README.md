# Shorebreak · revision 03 — September 25, 2026

This revision targets the supplied beach-view Emerald Coast reference: a close, full-width turquoise wall, a mostly simultaneous break, aerated whitewater and beach runup. It replaces revision 02's distant peeling breaker and separate foam lobes. This is authored animation, not a fluid solver or a calibrated forecast model.

The isolated preview is `review/breaking-wave/`. It reconstructs the existing Ocean engine from a checksum-verified patch and uses its background, water lighting and beach. The production homepage and prior lighting work are unchanged. Its default **Beach camera** is now at `(0,1.2,-0.5)`, looking ten degrees down with a 50-degree vertical field of view. This same camera is held across all heights. **Low beach** lowers the eye to 0.9 m; **Original dune** retains the original camera. The preview's underwater beach slope is steeper to accommodate a shorebreak; dry sand retains its original slope.

The first comparison wave closes out across the view. Subsequent waves deterministically vary among closeouts, left breaks, right breaks and sections. A 100-event check produces 65 closeouts, 12 left breaks, 9 right breaks and 14 sectioned breaks. Height remains an individual nominal crest-to-trough height: 1 ft is a small lap, while larger heights produce taller faces and larger explosions. This is not significant wave height.

The water surface contains 202,048 triangles. Its folded profile rises, pitches and collapses vertically before its rows redistribute into the wash, avoiding the stretched impact sheet found during review. Turquoise transmission, vertical face streaks and crest feathering are shaded on this surface. Whitewater combines a short volume integral through a moving turbulent roller, 140,000 deterministic lip/impact/foam/droplet seeds, and a raised, lit foam surface. The front advances irregularly, leaves thinner lace, then retreats. The old foam-sphere geometry is removed.

Live controls cover height, curl, lip glow, foam amount, spray, peel speed, water/foam colours, period and break position. Settings persist locally. Replay, pause, scrub and a fixed-camera 2/4/6 comparison are available. The optional canvas recorder is retained for browsers supporting MediaRecorder; it has not been recording-tested in the connected browser.

## Verification

`check-rig.cjs` reconstructs the preview, verifies source integrity, parses the scripts, checks tuning and exports the actual background/water/volume/spray programs and geometry. `render_inlet.py` compiles and renders those programs through Mesa EGL with matching camera and weather. These are **native shader renders, not browser or iPhone captures**. The connected browser reports WebGL disabled, so it can only verify the published page and loading/error behavior.

`check-controls.cjs` checks presets, scrub/pause, tuning, colours, period changes, reset, persistence, input bounds, fixed comparison framing and event progression with a DOM/engine contract stub. `check-profile.py` uses transform feedback from the real vertex shader to measure height, tests 336 geometry combinations, checks break-pattern distribution and verifies that runup advances and retreats. `profile-check.json` retains those measurements.

`make-shore-clip.py` produces the 27.9-second 2/4/6 ft comparison at 30 fps, with a height indicator outside the rendered scene. Its JSON sidecar records provenance. Review includes the encoded sequence, standing/pitching/impact/runup/retreat screenshots, and 390 × 600 portrait renders. The AI reference is reviewed alongside these stages; its moving camera is not copied into the size comparison.

```sh
python3 tools/waves/build_rig_preview.py
node tools/waves/visual-review/check-rig.cjs
node tools/waves/visual-review/check-controls.cjs
python3 tools/waves/visual-review/check-profile.py
python3 tools/waves/visual-review/make-shore-clip.py --out /tmp/shorebreak-2-4-6ft.mp4
```

The framing and wave type now follow the shorebreak brief. Foam shading and spray remain more stylized than the AI reference. User visual acceptance, actual browser recording and physical iPhone performance are still open. The volume pass adds GPU work; native rendering does not establish mobile frame rate. Do not describe this clip as a captured app session or claim the reference's photorealism has been matched.
