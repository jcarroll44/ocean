# DayBuoy privacy policy · DRAFT

Effective date: **[complete before release]**  
Operator: **[legal person or company]**  
Privacy contact: **[working email address]**

This draft describes the inspected browser preview. It must be updated against the released native app, hosting arrangements and vendor contracts before publication. Bracketed fields are intentionally unfinished.

## What DayBuoy does

DayBuoy shows forecast conditions for Inlet Beach. The current preview does not require a DayBuoy account, request your device location, offer advertising, or include an app analytics SDK in the inspected source. It has no human or crowd reporting feature.

## Information stored on your device

The app stores forecast responses, retrieval times, daily highs and NWS surf forecasts in browser local storage so it can show a recent forecast if the network is unavailable. It also stores your chosen skin/SPF/timer settings and whether you have seen the introduction. Those preferences are not included in the weather requests in the inspected implementation. Treat the skin setting as personal information even though it stays on the device.

Forecasts older than 24 hours are not accepted by the main forecast loader; the NWS loader rejects surf products older than 30 hours. These checks govern display, not physical deletion: cached records and preferences may remain until replaced or browser website data is cleared. To remove them in the current preview, delete DayBuoy website data in your browser settings. A direct in-app reset is a release task.

## Requests to weather providers and hosting

The preview contacts Open-Meteo for weather, marine and air-quality forecasts, NOAA CO-OPS for tide predictions, and NWS for the surf forecast. Requests identify the forecast beach coordinates, dates or station; they do not transmit a requested device GPS location. Your network necessarily supplies an IP address and connection information to the provider. Open-Meteo states that API logs can include IP addresses and request coordinates and are deleted after 90 days; other providers apply their own published policies.

The preview hosting and access service may process connection logs or sign-in information independently of DayBuoy's application code. **[Confirm hosting provider, legal entity, log fields, retention, subprocessors, regions and deletion/contact procedure.]** Do not claim “we collect no data” until that review is complete.

## Sharing and local diagnostics

Share-card images and diagnostic recordings are created locally. They are sent elsewhere only when you use a share action or download and then send the file. Device-test JSON includes browser/device information, rendering backend, resolution, quality and performance results; there is no automatic diagnostics upload in this branch.

## Planned native features

Location, home-screen widgets and best-hour notifications are not implemented in this preview. Before enabling them, we will describe the data and permissions they use. The proposed design asks for location only when you request a nearby beach; a manual selection should remain possible. Notifications require opt-in. **[Confirm whether precise location, push tokens or notification schedules leave the device, retention, recipients, and withdrawal/deletion controls.]**

## Choices, requests and changes

You may clear local website data, decline future optional permissions, and choose whether to share an image. Contact **[privacy email]** to ask about information held by the operator or request access, correction or deletion where applicable. **[Confirm response process and applicable regional rights.]** Changes to this policy will be posted with an updated effective date.

DayBuoy is a general-audience beach forecast product. **[Confirm intended age rating and children's-data approach before release.]**

Provider policies: [Open-Meteo](https://open-meteo.com/en/terms), [NWS](https://www.weather.gov/privacy), [NOAA](https://www.noaa.gov/disclaimer).
