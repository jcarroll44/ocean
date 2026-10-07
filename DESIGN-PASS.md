# Beach journey presentation pass — October 5, 2026

## Delivered

- Shared presentation tokens: Poppins 64/20/15/13/11, 16 px side alignment, 8 px spacing base, 64 px temperature with full degree ring (40 px only during time dragging).
- Removed the visible compass/bearing collision. Brand, selected-time header, play/pause and Back to now have dedicated positions.
- Existing five-tile dock is quieter and 218 px tall at 390 × 844. The primary action has the stronger ink/sea treatment. It opens the relevant subject. The compact value line stays 13 px; day names never become clock text.
- Persistent chosen day/time, a drag-only clock tooltip, and a separate playback-progress line. Story moment copy no longer shifts vertically to avoid the sun or fills the main button with system instructions.
- Restrained live-dot pulse, reduced-motion support, subtle weather/time-derived glass tint. No renderer or lighting changes.
- Sheets have shared type, one subject chart, no repeated global forecast line in their peek. Waves show source height, period and direction instead of a fabricated set count/range.
- Sun estimates retain their calculation code. Burn time and sunset score disclose unvalidated modelling assumptions; lower-UV windows use actual hourly forecast values. Source/method details are expandable. Opening methods does not turn vertical reading into a time scrub.
- Explicit offline/saved retrieval time, a no-data state with retry, reconnect refresh, and a forecast-specific action route.
- Story summary/share labels the sunset score as an estimate. Existing scene-first share composition and restore behavior remain intact.

## Verification

`node scripts/check-interactions.cjs`: PASS on all seven checks (scene look, sun time drag, dock scrub, pinch/reset, water-locked tide, Back to now, Watch pause/resume), plus boundary/cancel/hold cases.

`node scripts/check-presentation.cjs`: PASS for selected-time persistence; dawn/noon/sunset/night copy; hazard routing; offline/saved/no-data disclosure; story progress; estimate disclosure; CSS parse and built JS syntax. Uses a mocked DOM and controlled forecast fixtures, never shipped as live weather.

`node scripts/build.mjs` and `git diff --check`: PASS. Build now gates on both test scripts.

Camera, interaction engine, scene data/NOAA math, lighting and weather-effect files are byte-identical to commit b90e91e07216fa0c9c9bc303cfaaa3507aa80f0e. No water/sky replacement or scene object added.

## Limits and remaining work

Reviewed sampled frames from the supplied 77.88-second recording. No new browser/phone render, before/after stills, journey clip or FPS measurement was possible: the Sites managed environment has no supported control-browser capability. The authored 390 × 844 layout is not a claim of a visually checked screenshot. Test on the actual iPhone for long verdicts, sheet scroll and dock safe-area fit.

The noon glance and night scene were deliberately preserved under the agreed presentation-only scope. They have not been visually repaired or re-approved. Sun and ocean framing requires a separate geometry-verified camera round; stars and moonlight must remain conditional on the actual sky.

The original burn model uses coarse skin thresholds and a fixed reflection assumption; labelling it “est.” does not validate it. The sunset score is an app heuristic, not an official forecast. These limitations are disclosed in the interface.

## Sources linked in the UI

- Open-Meteo weather and marine API documentation: forecast inputs.
- NOAA tide station 8729210: tide predictions, MSL.
- NWS Tallahassee surf forecast FLZ108: South Walton rip risk.
- WHO ultraviolet radiation fact sheet: general protection guidance; it does not validate DayBuoy's burn-time model.
