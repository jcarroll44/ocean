# Approved beach camera restoration — October 6, 2026 UTC

Historical implementation notes. The later `INTERACTION-CONTRACT.md` replaces the no-free-look / scene-time gesture rules below. The exact automatic beach camera remains preserved; the current contract audit is `INTERACTION-AUDIT.md`.

## Implemented

- The actual saved `skyview-beach.html` and `watch-the-day-beach.mp4` were recovered. `beachPose` in the app is byte-identical to the HTML reference. Function SHA-256: `e80ec112686de49863bea491350e36bca4034f919f7606d4b4a14f5d6b525224`.
- Manual sun/time exploration now uses that target instead of the stationary rollback camera. Exact target ranges: 28–70 m back, 10–26 m high, 55–80° FOV. The target horizon is never below 62% outside the explicit glance.
- Critically damped, non-overshooting transitions; manual angular speed capped at 30°/s and position speed at 5 m/s. Playback uses the same reference target with a faster translation allowance to traverse the story in 20 seconds. Camera roll remains zero.
- Direct sun dragging uses both screen axes projected against the real solar path, not horizontal displacement as a substitute. Camera movement is excluded from pointer deltas. The sun shares the timeline's selected time and haptic hour ticks. Releasing it does not start momentum or snap to a different time; the camera continues its damped approach to the held time.
- Removed manual free-look. Scene horizontal drags retain selected-day time scrubbing; vertical scene drags do not rotate the camera or change time. Water/Waves/Wind sheet cameras remain water-locked.
- The elevation pill is tappable and performs a 1.5-second in-place glance, with a damped return. The story's existing 1.5-second peak-UV glance uses the same framing and does not stack a second noon effect.
- Only the soft UV-coloured arc is displayed during direct sun dragging / playback. Bare line segments and floating sun labels remain hidden.
- Menu layout/style, stand removal, original water, sky, sunrise/sunset grading, weather and astronomy were preserved. The only CSS change enables pointer events for the existing elevation pill.

## Verified in CPU tests

Run `node scripts/check-camera.cjs <absolute-path-to-approved-skyview-beach.html>`.

The test executes the actual bundled Three.js math, astronomy, camera functions and input handlers with DOM mocks. It checks exact function identity, target bounds, convergence, no overshoot, manual speed limits, vertical sun dragging, stationary-pointer stability, release holding, day-edge limits, no free-look, water-locked sheets, and in-place glance/return. It also compares the untouched scene/lighting/weather source against the prior published commit `aa25ab958e957ec2fc4e90a8899bfaaea60d351e`.

### Astronomy regression

September 30, 2026, local CDT; latitude 30.28, longitude −86.0. These compare geometric elevation consistently against the NOAA equations in the approved HTML. This is not a new screenshot comparison with the NOAA website. The app still renders its existing refraction-corrected apparent solar direction.

| Local time | App azimuth | Reference azimuth | App geometric elevation | Reference elevation |
|---|---:|---:|---:|---:|
| 7 AM | 95.8097° | 95.8083° | 4.1297° | 4.1285° |
| 10 AM | 125.2240° | 125.2219° | 40.4641° | 40.4633° |
| 1 PM | 191.7441° | 191.7414° | 56.1285° | 56.1294° |
| 6:30 PM | 266.8378° | 266.8376° | −0.7368° | −0.7352° |

Maximum difference is below 0.003°. Sampled daylight target horizon maximum: 62%. Tested maximum manual turn: 30°/s; movement: 5 m/s (floating-point tolerance).

## Not verified / blocked

No supported browser QA/recording capability is available in this session. No new 390×844 video, side-by-side recording, visual acceptance result or measured 60 fps/iPhone result is claimed. The restored camera needs the requested on-device clip before it can be considered visually approved. Tidewater wave porting is therefore paused at the report stage; `WAVE-SURGICAL-REVIEW.md` contains exact verified source excerpts and the isolated integration plan.
