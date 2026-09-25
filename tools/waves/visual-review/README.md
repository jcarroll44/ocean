# Single procedural breaker · revision 02 — September 25, 2026

The retained Mantaflow specimen did not meet the user's visual requirement. This pass replaces the narrow cached patch with an authored continuous free surface. The rig has a rising asymmetric face, a forward jet with thickness, an underside and hollow face, a lip that crosses sea level, a collapsing roller, event-driven spray, and thin shoreline runup. It exposes nominal height in feet, period in seconds, direction in radians, and break offset in metres. It is an illustrative visual model, not a calibrated fluid solver.

`review/breaking-wave/` is an isolated preview inside the recovered Ocean app. Production `index.html` is unchanged. The comparison is a single individual wave; its height setting is not significant wave height. The old bake and all prior lighting work remain preserved in their original branches.

Revision 02 adds a wider concave inner profile, a thinner rounded pitching lip, rapid post-contact collapse, 1,250 independently rotating/displaced foam lobes, and 14,000 deterministic lip/impact spray seeds. Foam lobes travel with and sit in the rough roller rather than on an unrelated flat overlay. Live controls expose curl size, lip glow, foam amount, spray, peel speed, water/foam colours, period and break position. Settings are bounded, saved locally and resettable. The phase slider pauses/scrubs without losing the look.

Default “App framing” keeps the dune camera's world position `(0,10,26)` but uses a 26-degree vertical field of view and aims at the break. It stays identical across 2/4/6 ft. “Original wide” preserves the previous camera. “Barrel detail” looks along the peeling crest at barrel elevation and follows the height-dependent break location; it is not the app's unchanged production default camera. The rig moves the break 0.7 nominal wave heights shoreward relative to revision 01, without multiplying wave height.

`check-rig.cjs` reconstructs the integrity-checked preview, parses JavaScript, constructs water, spray and foam with a stubbed Three interface, checks tuning uniforms, and exports their exact shaders/mesh buffers to `/tmp/rig-*`. `render_inlet.py` renders all four programs through Mesa EGL with the app background and matching camera. This is **not** an in-browser or iPhone capture. The preview's recording button is a canvas recorder with a height overlay for capable browsers; it has not been browser-recording-tested here.

`check-controls.cjs` exercises presets, pause/scrub, live sliders, colours, period changes, reset, persistence, invalid saved settings and fixed comparison framing against a DOM/engine contract stub. `check-profile.py` measures nominal scale and overhang, verifies the high face collapses into a low roller, and checks finite geometry across 189 combinations of height, curl, peel speed and phase. These checks do not establish visual acceptance or mobile performance.

`profile-check.json` records sampled profiles from transform feedback on the actual rig vertex shader. The profile changes from no overhang, to an overhang, to a lip below sea level, to a low roller. Nominal heights are approximately 2 / 4 / 6 ft before the lip pitches; the nonlinear authored shape increases crest-to-trough range during the curl.

Run checks from the repository root:

```sh
python tools/waves/build_rig_preview.py
node tools/waves/visual-review/check-rig.cjs
node tools/waves/visual-review/check-controls.cjs
python tools/waves/visual-review/check-profile.py
python tools/waves/visual-review/render_inlet.py --times 2.4,3.6,4.5,6
```

Visual approval, browser playback and device performance remain open. Foam is still a stylized approximation, not resolved aerated fluid. Do not call native renders captured app sessions, or claim physical iPhone testing or final realism acceptance. No wider wave library was added.
