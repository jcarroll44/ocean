# Current status — approved beach camera restored

Superseded by `INTERACTION-CONTRACT.md`: scene drag now looks around; only explicit time controls scrub. Use `scripts/check-interactions.cjs` and `INTERACTION-AUDIT.md` for the current behavior and audit.

The October 6 UTC request explicitly removes free-look and restores the supplied `beachPose`. See `CAMERA-RESTORATION.md` and `scripts/check-camera.cjs` for the current behavior and verification. Notes below describe earlier user directions and are retained as history, not current acceptance results.

## Historical correction — free scene look and stationary scrub camera

October 5, 4 PM user direction supersedes the earlier horizontal-scene-to-time instruction below.

- Dragging the beach changes yaw/pitch in place and never changes selected time. Release retains the view. The sun, day track and sheet curves own time changes. Back to now resets the view.
- Manual time scrubbing keeps x=0, y=10, z=28, fixed pitch/lens, facing 201° through the day. Only low sunrise/sunset turns the heading (smooth altitude gate, capped at 102° left / 60° right). No alongshore orbit or midday rise. Water sheets retain water-facing targets. Watch-the-day choreography is unchanged.
- Lifeguard stand, roof/legs, its shadow and visible flag removed. Other weather effects retained.
- Approved lighting.js matches pre-integration d008588 byte for byte: no new palette, sunset filter or water renderer. Actual dawn/dusk remains forecast-dependent.
- Same dock layout with stronger blue glass, dark selected-day state, higher-contrast metric labels/icons and action button.
- Updated CPU tests cover gesture separation, day bounds, camera targets, stand removal and original colour source identity. Build passes. Browser/phone visuals and FPS remain unverified; Sites-required browser tooling unavailable. Wave work remains paused.

---

# Selected-day controls check

Reference: `94bde7df5f3fbfe118d86a974a4e29a4d85a05bd`, the commit adding the Selected-Day Scrubber acceptance notes to POLISH-SCRUBBER-STATUS.md. The notes are dated October 5; Git records the commit on October 4 in Chicago time.

Compared full SHA-256 file hashes in CONTROLS-HASH-CHECK.json. These are not all identical files: the later approved buoy removal required scene-root access changes, and later story/share improvements remain. The actual `manualTarget` / `applyManualCamera`, selected-day bounds/clamp, and gesture begin/move functions match the reference exactly. Water/astronomy source is unchanged by this pass.

No active pointer-look, orbit-input, WASD or pointer-lock bindings were found in this checkout. The resting-camera function is now explicitly based on the fixed home pose rather than mutable saved orbit state. Time-follow camera movement remains capped by the approved 30 degrees/second turn and 5 metres/second translation limits, and Water/Waves/Wind use their approved water-facing targets.

Removed the superseded sun/ribbon drag listeners from daybuoy.js so only interaction.js owns time gestures. Sun and scene use the same horizontal time gesture; track and sheet curves use the same state/day boundaries. Vertical motion does not change time. Cancelled pointers no longer start momentum. Non-primary/right-button starts are ignored. Back to now cancels motion and restores quality immediately. The thumb updates every animation frame separately from text's 10 Hz cap. Odometer animations cancel their predecessor instead of accumulating.

Verification: scripts/check-controls.cjs executes the real gesture/momentum functions with controlled time and mocked DOM geometry. Scene, selected-day track, sheet curve, inertia, day-edge stops, vertical rejection and cancellation pass. This is CPU interaction testing, not a real pointer replay in Safari. Build and JavaScript syntax checks pass. No measured 60 fps claim.

The requested 390×844 acceptance clip is blocked: the Sites skill requires control-browser for browser QA in this managed environment, and that capability is unavailable. It prohibits substituting another browser-control path. Therefore the visual acceptance gate is still open and the whitewater port has not started.
