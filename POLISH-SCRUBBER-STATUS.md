# Story and selected-day scrubber polish — 5 October 2026

## Story / night pass

- One stop per displayed minute; hazardous weather/water conditions take priority. UV below 3 and the weak Gentler sun stop are omitted.
- Removed the Next preview. During travel the time and temperature update; the current moment's copy appears during its hold.
- Your [day] and its share image lead with a forecast-derived summary, then the chronological list. A dry-beach window is not a swim recommendation. Calm-water language requires Low NWS rip risk and suitable wave, wind and rain conditions.
- Night sand receives faint ambient coastal skylight. Dense cloud bases get a restrained coastal glow. Actual moon geometry and star catalogue remain unchanged; stars appear through thin high cloud but stay obscured by dense low/mid cloud.
- Verified all seven days have unique minute stops and no low-UV stops; story pause, restoration, moment jumps and share export still work. No JS or shader errors.
- Phone stills confirm faint sand at Monday 10 PM and visible catalogue stars at Tuesday 10 PM (actual forecast: no low/mid cloud, thin high cloud). Neither night forces an otherwise hidden moon into the sky.
- Camera, Bo geometry and scene-data/astronomy files retain their pre-pass SHA-256 hashes. Water motion is unchanged.

## Limits

Sky Pro is still blocked awaiting the user's ZIP. No purchase or source acquisition was attempted. Captures replay real forecast, NOAA tide and NWS snapshots from the previous round. 390×844, six unique captured frames per second encoded at 30 fps; not an iPhone performance measurement.

## Selected-day scrubber pass

- The same 20px track now represents the selected local day, midnight to midnight. Small 6a / 12p / 6p labels, daylight shading and sunrise / peak UV / sunset marks replace week divisions.
- The sun thumb follows the shared selected time; the red now tick appears only on today. Existing day strip, five cards, actions and full/compact dock dimensions are retained.
- Track position selects time absolutely. Horizontal scene drags retain the approved 12-hours-per-screen response. Both pin their day at touch-down; inertia and hour settling respect the same bounds. Edge contact triggers the native light-haptic bridge where available.
- Day taps preserve the selected hour and cancel momentum. Keyboard Home/End/arrows remain inside the day. The final endpoint is the last millisecond before the next local midnight, or the last available forecast sample when earlier; no forecast values are fabricated beyond coverage.
- Camera target functions, turn/movement limits, story choreography, astronomical calculations, Bo and water motion are unchanged.

## Selected-day acceptance results

- Actual pointer sequence at 390×844: Thursday 6 AM → tap Saturday → drag Saturday 6 AM to 9 PM → release → tap Monday. Monday remains 9 PM. No selected-day crossover during the drag.
- Large drags to both ends, a fast flick into the day boundary, keyboard End and ArrowRight all stop within the day. A vertical drag leaves time unchanged. Native bridge receives a boundary tick.
- Red now tick is hidden on Saturday/Monday and visible after Back to now. Track remains 20px and full dock remains under 25% of 844px.
- No JavaScript or WebGL shader errors in either recording. The source hashes for camera.js, home.js and scene-data.js remain unchanged.

Deliverables: Story/Night Polish (32 s: 20 s story, 4 s card, 8 s night); Selected-Day Scrubber (20 s). Both 390×844, encoded at 30 fps from 6 unique capture fps. Preview: https://daybuoy-app-v2-preview.jacobcarroll51.chatgpt.site/
