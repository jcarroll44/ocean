# October 6 rollback

Changes are isolated to `night-pass`; original app-v2 main remains `30826de2b421b6fae157e69374433aa0fb75b701` as opened for this task. No merge to main.

- The default rejected preview was WebGL, not Tidewater. Only `?ocean=webgpu` attempted partial native rendering, and it reverted to WebGL during story/scrubbing, night and rain. That adapter is now absent from the app build. Old query links cannot activate it.
- `src/scene-data.js` already matched `d008588a`. The build now embeds that exact source without the experimental breaker shader transform. Tidewater remains solely in `/ocean-proof/`.
- The entire approved camera, interaction, story, lighting and celestial files remain unchanged. `beachPose` also matches `d008588a` exactly. This verifies source identity, not the reported phone framing.
- Reproduced the real startup bug using parsed page HTML: eager overnight rendering called `initPresentation` before the lazy Back to now button existed. `append(null)` displayed `null`; assigning its text then threw. The previous mock selector manufactured missing elements and concealed the error.
- Removed the eager overnight presentation and CSS. Presentation initialization now creates its dependencies first. Live hides Back to now. A selected-time chip appears only when a sheet hides the header, so the main header is the sole selected-time indicator. There is no orphan generated node.
- The temperature readout is now owned by the final selected-time presentation render. Saturday selection, its header/tiles/verdict and track, night selection and return-to-live run through the real production handlers in a parsed DOM test using explicitly synthetic fixtures.
- The prior action copy is restored, with a concrete details action instead of repeating the headline. Removed the pink action background; risk remains in the headline and Water details. Removed the floating main-screen elevation pill; Watch choreography is unchanged.
- Restored the prior dock layout and marked the track with its selected day for accessibility/testing. The track position is an hour within that selected day, not a position under a weekday. The user's visual ambiguity / spacing complaint awaits their exact reference; no new layout was invented.

Validation: `node scripts/build.mjs` runs all seven interaction checks, presentation/menu/celestial checks, proof checks, branch checks and the new parsed-DOM regression. The rollback regression first reproduces the rejected error and then verifies corrected startup and actual click handlers. No GPU or physical phone test, render, video or screenshot was available. No claim of pixel matching or corrected phone framing.

Next: user supplies the exact HTML/CSS reference. Direction 1, Verdict first, is recommended. Copy that screen, then obtain rendered side-by-side comparison and phone interaction review. Tidewater remains blocked on its physical-phone performance and visual gate.
