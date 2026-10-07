# Home and menu redesign — October 5, 10:04 PM request

The user approved the sun and Watch camera and rejected the previous presentation-only cleanup. Additional instruction: eliminate wasted space above the Water temperature to expose more sea.

## Visible structural changes

- Location and temperature are now paired in a two-column composition. The location has its own heading; air temperature has a feels-like caption. Live/selected time stays in a separate masthead row, and the verdict has one restrained vertical accent.
- A dark ink panel replaces the pale rounded dock. Five readings share a baseline and hairline separators instead of five nested glass cards. Readings now come first; day selection and the time track sit together below; contextual action and share close the panel.
- Watch the day is named and positioned directly above its timeline. Pause/Resume stays there. Desktop controls form a coherent left-aligned group.
- Water loses the giant 64 px temperature block and fixed 355 px panel height. Temperature is now 26 px in the same compact row as waves and wind. The verdict sits directly above, the tide curve directly below. NWS attribution links from the verdict; the redundant risk row is gone. Sources remain expandable.
- Waves and Wind use the same compact three-reading layout. Sheets use the same ink surface, quiet charts, close control and typography. The large home header hides while a sheet is open; selected time remains visible.

## Preserved and verified

All seven interaction checks PASS: scene look, sun drag, scrubber, pinch/double-tap, water-locked tide, Back to now, Watch pause/resume. Time/estimate/offline tests PASS. New static CSS cascade checks catch old rules overriding Water sizing, playback positioning and night-sheet colours. Actual Water rendering-function tests confirm one row of three readings, one tide chart, direct Wave/Wind controls and no NWS attribution when the risk feed is missing.

Camera, story choreography, interaction engine, scene data, lighting and weather-effects files are byte-identical to cf23f514100647c3664a36c0b6c84caef429022c. The sun and Watch camera were not edited.

Build and diff checks pass. CSS/DOM checks are not visual browser QA. Reviewed all three supplied screenshots; new screenshots, a phone recording and actual on-device smoothness remain unavailable under the current Sites environment. No claim of visually verified dimensions or iPhone testing.
