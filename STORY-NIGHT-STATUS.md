# Overcast, story and night — 4 October 2026

## Finished

- Overcast daytime uses a soft silver sky gradient, jade water and a restrained wet-sand sheen. It does not remove forecast cloud cover or add fog. Rain and clear air retain their separate treatments.
- Watch the day lasts 20 seconds. Each forecast-derived moment holds for 2 seconds. The clock, temperature, tiles and shared time track follow the story. Transit text explicitly identifies the next moment.
- NWS FLZ108 rip risk governs the water moment. High and Moderate risk never produce a swim recommendation. A calmer-water window requires Low official risk plus suitable forecast conditions. Rain/storm windows are contiguous forecast periods, not a fabricated all-day span.
- The approved beach camera geometry is retained. Its brief midday glance occurs once during the UV hold. Story text leaves room for the real sun disc.
- Tap to pause/resume; close returns to the saved time, sheet and view. The Your [day] card has tappable moments, a return button and a square share export. Scrubbing or Back to now dismisses the card.
- Night retains the real moon phase and position, the astronomical star catalogue and the existing moonlight reflection model. Dense low/mid cloud now suppresses stars and direct moonlight. Bo's lamp gets a slightly broader night glow.
- At night, the Sun sheet shows moon illumination, horizon/cloud status, next moonrise and next sunrise. Event buttons jump to their times when within the available forecast. No tiny home-dock metadata was added.

## Checked

- 390 × 844 phone captures; no JavaScript or WebGL shader errors.
- Pause/resume preserves story time. Closing restores the previous time and Water view exactly. A moment tap holds the selected time.
- Monday 10 PM: Moon is below the horizon, at about 23% illumination; navy sky and water remain visible. Tuesday 5 AM: Moon is above the horizon but forecast clouded over. Night sheet fits without scrolling.
- NWS parser still passes South Walton section isolation, stale-product rejection and feed-failure checks.
- Scene-data engine, astronomy, camera.js and Bo's home geometry are unchanged. Rendering changes are lighting/occlusion only.

## Delivery and limits

- Overcast and Night clips are 20 seconds, with a final hold. Story clip is 24 seconds: the full 20-second story plus 4 seconds on its end card.
- All clips are 390 × 844, encoded at 30 fps from 6 native capture fps. These demonstrate appearance/state, not iPhone rendering performance.
- Captures use actual forecast, marine, NOAA tide and NWS response snapshots, with astronomical calculations at those timestamps. Illustrative cloud shapes remain the fallback.
- Sky Pro is still blocked pending the user's ZIP. No proprietary Sky Pro source was acquired or published.
- iPhone thumb/performance test remains with the user.

Preview: https://daybuoy-app-v2-preview.jacobcarroll51.chatgpt.site/
