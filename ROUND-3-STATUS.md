# DayBuoy Round 3

The sun path is now scene-space Three.js geometry sampled from the retained astronomy model. Hour ticks, an illuminated trail, a ground ring, and a drop line follow the selected day. The sun's time label is anchored to its projected 3D position.

The camera rises and backs away as solar altitude rises, reaches a wide dome view at midday, and returns to beach level turned toward sunset. Camera position, shader ray origin, projection, and visible water-grid coverage share the same pose. No wave-surface or data equations changed. A module comparison found only ocean-engine.js changed in the retained bundle, limited to camera plumbing and camera-relative grid coverage.

Watch the day spans sunrise to sunset in 20 seconds. Pause/resume and close/restore are implemented. Dragging the sun or any sheet chart changes one global time. The Sun sheet remains 40% high.

Review fixtures are labelled DESIGN PREVIEW and use the reference Saturday (September 19, 2026), with a seven-day strip starting September 15. Normal forecast mode uses the current date and retained data loader. The fixed review date keeps the 6:40 PM reference near the actual sunset rather than displaying an invented sun below the current day's horizon.

Validation uses Chromium with --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader at 390×844. Software captures demonstrate the real renderer, not iPhone frame rate. The preserved renderer remains less photoreal than the supplied mockups, so the strict visual-match pass is not claimed.
