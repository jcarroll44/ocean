# BoBuoy roadmap — current decisions

This records the accepted sequence without replacing the broader layered plan. v46 delivered the design system. v47 delivers useful card content and phone interaction.

## Current pass: v47

Full-screen playback → phone sheet sizing and seven-day navigation → useful tab contents and personal sun guidance → timing/readability fixes. Review camera comparisons before adopting a different camera. See PASS-v47-cards.md.

## Existing workstreams remain in the plan

- Real iPhone performance and usability verification; testing with 20–30 local beachgoers.
- Artist-quality character in the actual scene, at a consistent real-world scale.
- Ocean realism and wave motion, with reference-video checks.
- Forecast trust, source coverage and official hazard information before swimming-safety claims.
- Any-location architecture and verified location configuration: beach orientation, forecast coverage, tide mapping and astronomy must work per location. Start with a handful of verified locations; do not populate a large unverified beach list.

The above is a list of retained workstreams, not a new ordering or permission to expand the current pass.

## Required sequence after any-location support

1. **Trip mode.** Choose destination and trip dates, remember the trip and compare available beach windows across its days. Show forecasts only inside provider coverage; farther-away dates stay a saved plan until forecasts become available. Present air, water, wind, waves, sun and rain timing for that destination. No invented long-range certainty.
2. **Sunset alerts.** Opt-in alerts for the chosen home/trip location, with user-controlled timing, quiet hours and an off switch. Distinguish an ordinary sunset reminder from a forecast-based “promising sunset” alert. Design around actual notification delivery support and forecast refresh reliability before promising push alerts on every device.

Do not build Trip mode or alerts inside v47. Any future reminder/notification implementation is a product feature, not authorization to send messages or create personal reminders now.

## Product guardrails

Help a family decide when to go, what it will feel like and what to plan around. Keep broader beach activities in the long-term product without making the first experience serve every audience at once. Preserve useful intelligence while simplifying the interface. Forecast visualisation is not a live camera, a rip-current detector or a personal guarantee of safe sun exposure.
