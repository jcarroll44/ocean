# DayBuoy overnight pass — 12 October 2026

Build revision: `2026-10-12-overnight-waves-v6`

Source branch: `wip/tidewater-verdict-first`

Implemented, but not deployed or visually accepted on iPhone.

## Changes

- Replaced the horizon's single cloud-atlas row with broad atmospheric color, softened atlas reconstruction, stabilized shell intersection math, and gave the approaching shelf rounded layers and rain shafts. A complete staged sky cache crossfades over the previous complete sky. Sunrise swash excludes the low-angle red disc from the broad reflection sample.
- Four forecast components share Tidewater's existing FFT cascades: wind waves, primary swell, secondary swell and tertiary swell when available. Direction, height and period remain distinct; period controls dispersion, directional spectra and group timing. The current advects the wave field.
- Added a typical submerged Gulf two-bar profile, retaining the approved dry beach. Depth-limited breaking uses gamma 0.78, local water level, shorebreak, inner-bar and outer-bar crest slots. The original curling lip material and whitewater remain. Period/steepness and onshore/offshore wind affect the faces and spilling/peeling behavior.
- Calmer kicker and meta line, separate updated time, High-only rip chip, developer-only diagnostics, custom weather/moon-phase scrub glyph, five tappable stats and hourly detail charts. Air and water temperatures vary with the hourly data. Retained share, colored track, tide marks, rain patches and stronger moment haptics.
- Prepared one strict 120-second iPhone gate, followed by ten weather captures, five wave cases, both contact sheets, a storm clip and a full-app day-scrub clip. No encoding runs during the FPS measurement.

## Live provider checks

Direct network checks returned HTTP 200 for both Open-Meteo marine requests. GFS Wave 0.25° returned height, period and direction for combined waves, wind waves and primary/secondary/tertiary swell. Best-match returned current velocity/direction and sea-level height MSL. Combined, wind-wave and swell peak-period fields returned no usable values; they remain unavailable. Mean period is used for the appearance estimate when peak period is absent.

NOAA NDBC stations 42012, 42039 and 42036 all returned recent wave observations and corresponding modeled heights during this pass. The server proxy avoids NDBC's browser CORS limitation. The NWS Tallahassee Surf Zone Forecast contained South Walton FLZ108 and a numeric surf-height forecast; the parser attaches heights to their specific forecast periods, including normalized holiday headings.

Sources: [Open-Meteo Marine](https://open-meteo.com/en/docs/marine-weather-api), [NOAA NDBC](https://www.ndbc.noaa.gov/), [NWS Surf Zone Forecast](https://api.weather.gov/products/types/SRF/locations/TAE). Forecast appearance and derived values are labeled **est.** with source attribution. MIT credits for Tidewater and Takram are retained. No crowd reporting was added.

## Decisions

- Use one coherent GFS wave family so tertiary swell is not mixed with incompatible partitions from another model. If that family is incomplete, retain best-match waves. Currents and MSL come from the best-match request.
- Prefer NOAA tide predictions. Use marine MSL only when tide is missing, and never add the two water levels together.
- Buoy adjustment is an unvalidated regional estimate: 25% of a distance/age-weighted observed/model height residual, capped at ±15%, fading to zero beyond two hours from now. It changes appearance height only, not local forecast period/direction. The optional NWS breaker-height adjustment is also explicitly an estimate and is bounded to 0.7–1.3.
- Sandbars are illustrative, not a surveyed Inlet Beach bathymetry. Sets and break positions are estimates, not predictions of individual waves.
- Keep the 64 crest-search samples; increase their reach to 192 m and retain one lip per bar zone. All four spectra share existing FFT transforms. Removed the old GPU scrubber-orb readback.
- Use JPEG scene captures at quality 0.9 so the enlarged evidence bundle fits the existing upload budget. Original captured framing and color are retained.
- Make the interaction test clock deterministic inside its synthetic forecast. Its seven gestures, strict assertions and approved camera hash remain intact.

## Verification and remaining limits

The complete application build, all seven interaction gates, marine unit/missing-data/interpolation/calibration tests, all five detail sheets, fixture/capture recovery, cloud-cache scheduling and actual weather/water/breaker/FFT WGSL semantic compilation were checked. Shader validation uses Dawn's null backend; it proves no pixels or physical-device speed, and its resource limits prevent full renderer pipeline validation.

Browser rendering is unavailable in this managed environment: the Sites skill requires the control-browser capability and prohibits substituting another browser path when it is absent. Therefore the scene fixes are implemented but not visually verified. The weather contact sheet, wave gallery and full-app recording are not yet captured. The recording implementation composites the live WebGPU scene and rasterized actual DOM; it is not an OS screen recording and backdrop blur may differ.

The new build has **not passed** 30+ completed frames in every second for 120 seconds on an iPhone. The prepared gate retains the threshold, heaviest night-storm scene, four wave partitions, all cloud layers, thin rain and three breaker rows. The earlier low-battery run was not treated as this build's acceptance result.

Publication is blocked in two ways. Automatic approval review rejected GitHub writes as a transfer to an unverified destination, including after ownership was checked. The existing private Sites source repository is configured on `main`; its supported workflow commits and pushes to that branch, and the exposed tools cannot change it. The user's hard limit forbids committing to main, so no new Site source commit or deployment was made. The currently hosted page remains the previous build; it is not a valid v6 gate link.
