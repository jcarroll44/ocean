# Time-led header and light sea-glass

October 5, 2026, 10:46 PM Chicago reference: Jacob selected the hour-led header, with a smaller air temperature at right, a Now/selected-time control and much lighter existing menus. Earlier five concept options are not the direction.

## Implemented

- Large local clock, AM/PM and weekday; supporting 34 px air reading and circular degree ring. Location remains in the small masthead. Forecast verdict and one actual-data detail follow a fine divider.
- Existing Now and Watch controls regrouped in the top switch, retaining handlers, pause/resume, clock and selected-day behavior. Selected time is visible both in the switch and in the main readout.
- Pale sea-glass dock/sheets and ink text, white selected day and blue main action. Same dock order, dimensions, compact behavior and Water sheet information density.
- One existing solid sun, cream-white with softer bloom. Existing shaded lunar disc made legible; phase, bright limb, real position and cloud masking preserved. Display sizes are illustrative (sun 18–24 CSS px; lunar radius sized for roughly 20 px diameter), not measurements of angular size. Moon below the horizon stays below it.
- No change to camera, story, water shader, waves, weather lighting or solar/lunar calculations. New celestial treatment is isolated in `src/celestial.js`.

## Verification

All seven required gesture checks pass: scene look, sun drag, timeline, pinch/reset, Water tide, Back to now and Watch/pause. Additional checks cover the Chicago clock/AM-PM/day, selected/live state, light surface CSS, content-sized Water sheet and celestial styling scope. Full-file preservation assertions still pass for approved camera, interaction, story, scene data, lighting and weather effects.

These are automated geometry/event, DOM and static CSS checks. Browser preview is unavailable in this managed environment without the required control-browser skill. No rendered phone screenshot, GPU shader compilation, actual-device FPS or exact visual match is claimed.
