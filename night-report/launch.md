# Launch readiness · 6 October 2026

## Recommended App Store path

Use Capacitor for the existing scene and UI, with a bundled local web build, a small Swift bridge and native extensions. Validate WebGPU in its WKWebView separately from Safari. Keep the proven WebGL fallback. A shell alone is not the product differentiation: the forecast-driven beach, hour exploration and useful day story already provide utility; context-aware location, a glanceable widget and an opt-in best-hour notification would make that utility easier to reach on iPhone.

Apple's 4.2 rule assesses whether an app provides substantial, distinctive utility beyond a repackaged website. Adding a widget is not an automatic pass. The submission should demonstrate the complete beach-planning journey, offline behavior and native integrations. Apple's 5.1.1 requires an accessible policy explaining data practices, retention/deletion and consent. These are review criteria, not a prediction of approval. [Official guidelines](https://developer.apple.com/app-store/review/guidelines/)

[Capacitor's iOS documentation](https://capacitorjs.com/docs/ios) describes its WKWebView runtime and Xcode-based native project. No shell or native extension was built tonight, per the writing-only track.

## Dated checklist

These are planning targets, not a promised beta date. They assume decisions and the phone retest on **7 October**; missed gates move the dependent dates. “Me” means implementation work I can perform; native signing and device testing require your Mac/account/device access.

| Target | Remaining item | Owner | Estimate | Exit condition |
|---|---|---|---|---|
| Oct 7 | Safari sustained test + 10-second clip + 3/5 ft stills | You | 20–30 min | Exported results, visual acceptance, ≥30 fps for 2 min |
| Oct 7 | Pick header A or B; confirm imagery against exact board | You | 10 min | One approved composition |
| Oct 7 | Decide native-ocean timing | You; recommendation from me | 15 min | WebGPU remains branch-only until accepted |
| Oct 7–8 | Wave-height/reference calibration, directional swash review | Me, then you on phone | 1–2 days | 1/3/5 ft and 8 s look right; measurement notes |
| Oct 7–8 | Open-Meteo commercial plan and API budget | You | 30–60 min | Appropriate subscription and permitted use |
| Oct 8–9 | Server-side forecast proxy/cache; protect paid API key, rate limits, source timestamps and outage handling | Me | 1–2 days | No secret in shipped JS; stale/missing feeds tested |
| Oct 8–9 | Design device review: all times, five sheets, dynamic text, 44 px targets, contrast and VoiceOver | Me + you | 1–2 days | No clipping, overlap, dead ends or inaccessible controls |
| Oct 8–9 | Long-session battery/thermal/memory, low-power mode, offline, return-from-background and device-loss tests | You + me | 1 day | Documented device matrix and fallbacks |
| Oct 8–10 | Native Capacitor shell, lifecycle, haptics, native share, bundled assets, orientation and status-bar insets | Me; you for Xcode/signing | 2–3 days | Runs on target iPhones and remains useful offline |
| Oct 9–10 | Location on request, manual option, permission-denied and approximate-location flows | Me + you | 1 day | No upfront permission wall; no forced GPS |
| Oct 10–12 | Home-screen widget with forecast freshness and deep link; best-hour local notification with opt-in/cancel | Me + you | 2–3 days | Useful native behavior, no promise of live animation |
| Oct 10–12 | App data/source audit: NWS zone/expiry, tide station/datum, timezone/DST, estimate labels, missing data, NOAA regression | Me | 1 day | Every reading traceable; no invented conditions |
| Oct 10–12 | Privacy, support/contact, terms, credits, commercial/proprietary asset licences | You + me | 1 day | Operator/email filled, actual retention confirmed, public URLs |
| Oct 12–13 | App privacy labels + privacy manifest / required-reason API audit | Me + you | Half–1 day | Matches native SDKs, hosting and data flows |
| Oct 12–13 | Bundle ID, Apple membership, signing, app icon, launch assets, age rating, category, export compliance, support URL | You + me | Half–1 day | Complete App Store Connect record |
| Oct 13–14 | Device screenshots and preview, description, review notes, accessibility/support checks | Me + you | 1 day | Captures show actual released behavior |
| Oct 14 onward | TestFlight internal build, external testing/review if needed, crash fixes and release candidate | You + me | 2–4 days + Apple review | Accepted device testing; no blocking defects |
| After gates | Approve merge, deploy release and submit | You approves; me prepares | Half-day + Apple review | Explicit approval; rollback version retained |

**WebGPU full migration is a separate critical path:** approximately 2–3 engineering weeks after device results, with uncertainty. [Inventory](migration.md). The launch targets above assume the established WebGL ocean can ship if this work is not ready. Do not silently set a date that requires unfinished ports.

## Source and licensing work

Open-Meteo distinguishes the CC BY 4.0 data licence from access to its hosted service. Its public API is for non-commercial use; commercial operation needs an appropriate subscription. Attribution remains required. [Pricing/licensing](https://open-meteo.com/en/pricing) · [Terms](https://open-meteo.com/en/terms)

Keep NOAA/NWS material attributed, preserve timestamps and avoid implied endorsement. DayBuoy's interpretations are its own. [NWS use terms](https://www.weather.gov/disclaimer)

## Ideas only — not built tonight

- Lock-screen widget with a tiny beach: 3–5 days; use a rendered snapshot and scheduled refresh, not a continuously live GPU scene.
- “Your window today” notification: 1–2 days for local scheduling; 3–5 with server updates and push.
- Share any selected hour: 1–2 days to unify WebGL/WebGPU image capture and native share.
- Sunset countdown Live Activity: 2–3 days for ActivityKit lifecycle, stale state and opt-in.
- Apple Watch glance: 4–7 days for a small companion, shared forecast and complications.

Estimates are engineering effort, not Apple review time. New beaches, accounts and paywall remain outside this pass.
