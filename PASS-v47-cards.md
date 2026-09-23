# Pass v47 — Useful beach answers

Start from v46. Approved changes incorporate Jacob's latest decisions and the review of the original cards proposal.

## Decisions that control this pass

1. Full-screen playback first. Only time, pause/resume, progress and exit remain. Tap the scene to pause/resume. Restore the previous time, view, sheet and scroll position on exit or completion.
2. Keep estimated time to sunburn as a headline Sun feature. Use “About … min”, “without sunscreen”, and a visible uncertainty statement. Never present it as a safe-exposure allowance. Skin response is optional, remembered and editable. SPF changes protection reminders; the headline remains an unprotected-skin estimate. Do not alter the existing UV dose model in this pass.
3. Restore all seven days. Request and retain the full available week. Keep dates visible even if a feed is missing; disable uncovered days and mark unavailable values honestly.
4. Send side-by-side camera screenshots before committing any camera change. Existing camera and ocean rendering remain the production baseline. Test the proposed wider lens/eye-height shot separately. No automatic tab camera moves in the shipped UI.
5. Preserve the v46 palette, type and glass, while allowing sheet dimensions and layout to improve.

## Build order

- Full-screen day/evening/night playback.
- Phone sheet behaviour: peek, half and full; tabs open halfway; drag or scroll to expand. Restore seven days.
- Helpful Today, Water, Sun and Tonight contents, with existing forecasts, air temperature/feels-like, water temperature, wind/gusts, waves and UV. Restore skin personalization and the burn estimate.
- Forecast timing, storm priority, clear labels, contrast and clipping fixes.
- Capture camera comparisons as an uncommitted experiment.

## Content and interaction

- Keep air temperature and feels-like near the scene verdict; four readable peek values: Waves / Water / Wind / UV. Do not crowd five values into the same narrow row.
- Today: air/feels-like hero, a daily temperature trend, four tappable summaries, the beach window, rain/humidity and playback.
- Water: Waves / Water / Wind subviews. Each has one answer, a large value, one relevant visual and supporting facts. Forecast wave height is not water depth or a safety judgement. Water temperature includes tide and estimated clarity. Wind includes direction relative to the beach, gusts and changes later.
- Sun: personalized estimated burn time, UV curve, lower-UV hours, sunscreen guidance, editable skin response and daylight planning at night. Explain model limitations behind information, with a short uncertainty line visible near the headline.
- Tonight: sunset postcard and score, evening playback, stargazing, moon/cloud information and useful planet viewing times; night playback.
- Storm/rain timing overrides cheerful beach verdicts. Forecast weather codes are not live lightning detections. Do not claim “great for kids”, “strong swimmers only” or “umbrella-safe” from these inputs.
- Label every tab. Keep a consistent 24-hour time scale.

## Scope

Remove the mannequin figure cards and broken pose controls. Keep height in Settings for the future scene character. Character sourcing/rigging, new beach props, new tab camera shots, ocean realism, physics, new locations and new data providers are outside this release. Feels-like and rain-probability fields from the existing weather provider are in scope.

No human-reporting or crew-data layer. Trip mode and sunset alerts are roadmap work, immediately after any-location support; they are not implemented in v47.

## Acceptance

- Live data at 390 × 844: peek, each tab at half and full, day and night, and full-screen playback.
- Seven actual forecast dates, with no fabricated forecast beyond feed coverage.
- Burn estimate stays prominent after skin selection; selection persists; different skin responses change the estimate; SPF does not promise extra safe exposure time.
- Playback hides the sheet, header and tabs; pause/resume and exit work; prior state returns.
- No mannequin panels, no clipped hero values, all four tabs labelled.
- Camera comparison delivered before adopting any candidate camera.
- Update HANDOFF.md; report only changes, limitations and the screenshot links.
