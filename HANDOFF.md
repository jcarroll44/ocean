# BoBuoy — compact peek, truthful night, conditions review

Built from published v47 and the horizon-seam fix. Jacob approved elevated camera B (10 m high, 11° down); this pass adopts it with the requested buoy and shoreline refinements. Live site: https://jcarroll44.github.io/ocean/
Owner: Jacob Carroll. Product name: BoBuoy. GitHub: jcarroll44/ocean.


## Latest approved pass

Built from main `9900e938de1a355ded9832d5449859533859d912`. Order: compact peek/night, controlled grid and clips, then the two largest observed weaknesses. The approved camera and buoy distance/scale are retained.

- Peek sheet: 136 px instead of 272 px. Four readings remain tappable, with a 44 px time/expand control. Days, arc and playback appear on expansion; seven days and all detailed tab features remain. Water and Wind readings now open their matching Water subviews. The headline separates its small label from the larger answer.
- Moon: above-horizon, illuminated nighttime Moon outside the unobscured view gets an edge hint using actual projected direction. Tap pans to the real Moon; Beach returns to the approved view without changing the selected time. Pan range is now ±180° to reach a Moon beyond the previous ±100° limit. No fake Moon is inserted. Moon-driven water lighting follows phase, altitude and cloud cover; the reflection remains directional.
- Grid finding 1: pale storm skies and flat cloud layers. Increased cloud relief and adjusted cloud, water and beach attenuation together for cloud/rain conditions. This improves weather coherence; it is not a volumetric-cloud replacement.
- Grid finding 2: the low-wave path discarded the wind spectrum below 2.5 ft. Low waves now include wind displacement and slopes, bounded to 45% of configured wave height with carrier variance reduced accordingly. The low-wave offshore combined spectral height remains at the requested value. Wind direction drives the fine surface texture. The existing higher-wave breaking/energy model is retained.

### Checks for this pass

- 390×844 day/night peek renders and moon-pan render; all four tabs and all seven days retained. Correct Waves/Water/Wind destinations, no horizontal overflow at 375/390/430/1280, reduced-motion sheet transition.
- Moon below the horizon: no hint and no moon illumination. Moon beyond the old pan limit: visible after tapping the hint. Beach return restores approved view.
- Full-screen playback hides chrome, pauses time, resumes, and restores exact time, camera and compact-sheet state. No JavaScript or shader errors in the checked cases.
- Before/after 3×4 grid: 1 ft/5 kt, 3 ft/15 kt, 6 ft/25 kt × clear/scattered/overcast/storm. Separate 6 ft/5 kt and 1 ft/25 kt cases. Held camera, noon lighting, 7 s period, tide, clarity and directions fixed. These are simulated inputs, not live observations. Buoy bob phase is not synchronized across every cell.
- Five 5-second clips before and after, rendered at 8 fps in software. They show animation differences; they are not measurements of phone frame rate.
- UI screenshots reuse the captured live forecast used in the camera review. After deployment, the published source matched the tested bytes exactly. Fresh weather, marine and both NOAA tide feeds succeeded, with seven forecast days. The optional air-quality request was aborted/rejected in this browser check; do not claim that feed was verified.

### What remains

Clouds still have a procedural appearance; breaker/foam bands remain too regular in places. These are the next realism candidates, not grounds to claim the scene is finished. Physical iPhone FPS, heat/battery and input feel remain unmeasured. Jacob's next product test is 20–30 beachgoers using the live app; no recruitment messages have been sent. Any-location, Trip mode, sunset alerts and the artist-quality person remain in their existing roadmap order.

## Accepted direction

See PASS-v47-cards.md. This is the product/content and interaction pass on the v46 design system. Preserve the existing palette, 300/500 type weights and translucent sheet. The burn estimate stays a headline feature; seven forecast days return. Camera B was selected after side-by-side review. Preserve the approved 10 m / 11° framing unless Jacob requests a new comparison. Any-location support is followed immediately by Trip mode, then sunset alerts; see ROADMAP.md. Those future features are not implemented here.

## What changed

- Day, evening and night playback clear the sheet, header and tabs. The only control capsule contains time, pause/resume, progress and close. Tapping the scene pauses/resumes. Close or natural completion restores the previous time/live state, camera view, sheet size and panel scroll position. Keyboard Escape closes playback. Time and animation pause when playback is paused.
- Seven dates are visible in the picker. The previous parser discarded weather more than 74 hours ahead; that cap is replaced with seven local days. The existing providers now receive the beach timezone, so the seventh evening is covered. Missing dates are disabled rather than fabricated. NOAA tide predictions cover the same week.
- Air temperature and feels-like appear by the scene verdict. Today has a temperature hero and daily curve, tappable Water/Waves/Wind/Sun summaries, the beach window, rain chance and humidity. Feels-like and precipitation probability are new requested fields from the existing weather provider, not a new provider.
- Tabs open at half height, with a visible primary answer and visual. Drag the handle or scroll upwards to expand. Every tab is labelled. The top verdict is hidden while a tab is open to avoid crowding the scene and repeating the panel answer.
- Water has Waves / Water / Wind subviews. Wave-height and wind curves, a water-temperature band, beach-relative wind direction, gusts, tide timing and estimated water clarity add meaning to the numbers. No child-swimming, strong-swimmer or umbrella-safety promises.
- Sun restores the headline burn estimate after optional skin-response selection. Wording: “About … min”, “without sunscreen”, and a visible reminder that response varies and this is not a safe-time limit. Six descriptions replace jargon. Selection persists and is editable in Settings. SPF changes reminders only; it does not extend the headline estimate. The UV curve, peak, lower-UV windows and daylight planning at night remain visible.
- Tonight retains the sunset postcard/score, adds evening playback, and restores useful moon, darkness and planet-viewing details alongside stargazing and night playback.
- The mannequin panels and pose controls are removed. Height is retained in Settings for a future scene character. The person renderer remains unused in the bundle; no character asset was sourced or substituted.
- Storm forecasts outrank a pleasant beach headline and are described as forecasts, not live nearby lightning observations. The arc has a subtle forecast-rain segment while retaining a consistent 24-hour scale.

## Model and renderer boundaries

Astronomy, UV dose equations, buoy geometry/scale and figure geometry are unchanged. The conditions follow-up below adds bounded wind detail to low waves; the higher-wave breaking model is retained. The seam fix changes distant background-water shading. This follow-up changes camera framing, buoy position, sand materials and swash-foam appearance/coverage using the existing wave and tide state. conditions.js only adds interpolation for the v47 weather fields; activity scoring is unchanged.

The burn estimate uses the existing broad skin-response thresholds and forecast UV. UI and calculation behaviour were tested; personal medical accuracy has not been validated. The estimate does not track prior exposure or medication effects. Its label, visible uncertainty line and information disclosure must remain. SPF is never used as permission to stay out longer. Do not describe tanning or the estimate as safe.

## Adopted camera and shoreline

- Camera B: world Y 10 m, Z 26 m (18 m behind v47), 11° downward pitch, zoom 0.84 (about 70° vertical field of view). Heights are relative to the scene datum, not measured above local sand.
- On a 390×844 phone, the shifted projection keeps the horizon near Y202 (top quarter of the full scene), below the compact headline. This is not a claim that the horizon sits in the top quarter of the smaller exposed area above the sheet.
- Bo moves from world Z −14 to −11.375. The distance to the mean shoreline at Z −3.5 falls from 10.5 m to 7.875 m, exactly 25%. His existing 1.3 model scale, geometry, bob and heel remain unchanged. This is a modest on-screen size gain, not the full size of Bo under camera A.
- A darker damp-sand band follows the tide line. The existing wetness memory retains recent run-up. Fine sand grains are filtered by their screen footprint; larger grain/ripple variation adds texture without a flat beige fill.
- Stronger foam coverage follows the actual thin swash front and uses the existing advection/decay map. It is not a fixed shoreline stripe. Moonlight provides restrained night-time sand and foam visibility.
- All home/reset controls return to the adopted view. Full-screen playback preserves/restores it and keeps Bo visible in the checked hero frame. Scene projections, shader origin and water mesh coverage share the new camera position.

## Verification

- Live weather, marine, air-quality and both NOAA feeds; complete seven-day local coverage, feels-like and rain-probability values.
- 24 phone screenshots at 390 × 844: day/night peek, all four tabs at half/full, Water temperature and wind subviews, and paused full-screen playback.
- Skin selection changes the estimate and saves the preference. SPF leaves the unprotected estimate unchanged. Settings can change skin response.
- Seven dates selectable without changing the chosen noon hour. Main tab hero and visual fit at half height.
- Playback pause/resume by button and scene tap, hidden chrome, exact state restoration, and evening completion.
- No visible mannequin panel or old striped scrubber. Four labelled tabs. No visible border boxes, sub-12 px type, bold weights, horizontal overflow or object-string rendering in the checked states. Responsive widths 375, 430 and 1280. Reduced-motion CSS.
- Software WebGL is used for screenshots; rendering is paused for portions of control verification. No physical iPhone FPS, battery or thermal claim.

## Remaining limitations

- The horizon seam is fixed: grazing-angle background sea rays stop sampling extreme coordinates beyond 2 km and blend continuously into horizon haze from 900 m. Dunes retain their foreground occlusion. Wave geometry and propagation remain unchanged; the approved camera is now adopted.
- The artist-quality scene character and umbrella/chair shots remain separate. Camera B is now approved and adopted.
- A forecast can still fail or omit optional values. Saved forecasts and labelled samples remain; missing values must not become invented observations.
- No official beach flag/rip-current integration, Trip mode, push alerts or any-location expansion is included in v47.

The deployed source remains self-contained index.html. v46's legacy panel functions remain in the bundle but are unused. This handoff is current; OVERNIGHT-HANDOFF.md records older history.

## Follow-up verification

- Day/night phone renders at 390×844, matched to the same captured live forecast used for camera review; these screenshots do not claim a fresh weather fetch.
- Several swash phases checked for advancing/retreating foam. Camera reset, playback pause/chrome hiding/restoration, and all four panel selections checked.
- Final shader and JavaScript checks passed with zero errors. An initial sand-texture derivative error was caught and fixed by passing the pixel footprint from the fragment shader instead of declaring derivatives in the shared vertex block.
- No physical iPhone performance measurement. The rendering tests use software WebGL.

Previous camera48/camera49 previews are historical review artifacts; this handoff and the committed index are authoritative.
