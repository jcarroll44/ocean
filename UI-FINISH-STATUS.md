# UI finishing pass · 2026-09-30

Published scope: main screen, five expanded sheets, shared time controls, scene-space sun path, camera move and Watch the day. UI changes remain on app-v2; main is not a deployment target.

This pass closes the remaining functional UI gaps:
- Live storm windows use contiguous forecast hours; sunset timing and score use retained astronomy and forecast models. The reference's exact examples remain in labelled design-preview mode only.
- Sunset reminders produce an importable calendar event with a 15-minute alarm. Supported phones can share the calendar file; other browsers download it. The user must import it. No false claim of a scheduled notification.
- Scrubbing exposes Back to now in the existing source label.

Verified at 390×844 with real Chromium/ANGLE/SwiftShader rendering. All three reference headlines retained. Calendar download contains valid UTC event times and a -PT15M alarm; past/design-preview reminders do not claim success. Back to now restores live time. A controlled 9 AM–noon storm produced that actual forecast window. No JavaScript errors. Existing five-sheet and 20-second camera capture records remain applicable; their code is unchanged.

The strict reference-match gate is still open. The existing procedural beach differs substantially from the photoreal reference. The separate Water Pro integration owns ocean rendering. No Water Pro licensed source or ocean/wave algorithms were changed in this pass. The initiative should not be marked visually accepted until that renderer is integrated and the full-screen comparisons are repeated.
