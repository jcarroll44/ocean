# Scene, share and rough-night pass — 5 October 2026

- Removed the buoy from the scene graph, disposed its geometry/materials, disabled its update and removed its tap target. SVG logo/app branding remains. Scene attachments now use the scene directly rather than the buoy's parent.
- Restored the beach lifeguard stand at real scale (1.5 m platform, 3.2 m roof), its directional wind flag, and sun-projected roof shadow. Flag direction is forecast wind-to; flutter/droop follow wind speed. Stand remains lit by daylight/ambient night light.
- Day-story share export renders the actual scene square at 1080×1080. A 378px-high bottom glass panel shows Your [day], the best-of line and the top three moments, prioritizing hazards and meaningful forecast events. The original phone viewport, camera direction and selected time are restored after export.
- Unified range formatting: 5 AM–noon, 5 PM–midnight, 2–4 PM, 11 AM–2 PM, 11 PM–2 AM. Story, best-of and Water ranges use the same helper. Saturday's source snapshot has rain from 5 AM but thunderstorm codes from 6 PM; the night headline now correctly says Storms · 6 PM–midnight.
- Rough-water night shader retains wind caps previously discarded by the incoming-wave blend. Diffuse foam and wave-face contrast rise at rough hours; rain streaks remain visible after dark. Existing forecast wave displacement, heights, directions and period are unchanged.
- Thunderstorm codes trigger occasional brief lighting pulses in the sky, water, foam and sand shaders. The interface does not flash; reduced-motion preference disables flashes. These are illustrative storm effects, not lightning-strike predictions.
- Compact dock values are Poppins 14px / weight 500, with the same dock dimensions.

## Verification

- 390×844 real-forecast capture: Thursday 10 AM beach view, compact dock, Saturday 9 PM storm conditions; no attached buoy.
- Five range examples checked, including noon/midnight. Share has exactly three moments, and export restores camera bearing, aspect and time.
- Solar azimuth/elevation still match rendered direction to numerical precision. Astronomy and wave engine source file is unchanged (SHA-256 a6d0dae1d2e45ae622b1c315ec5fbde844c38b7f773f97821c51e61e4ba4ca1a). Camera pose functions are unchanged; only scene attachment references were updated.
- Capture uses real weather/marine/NOAA tide/NWS snapshots from the preceding round. It is 6 unique frames/s encoded at 30 fps, not an iPhone performance measurement.

Sky Pro remains pending the user's ZIP. Preview: https://daybuoy-app-v2-preview.jacobcarroll51.chatgpt.site/
