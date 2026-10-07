# Daytime colour and Water sheet — 4 October 2026

Implemented:

- Removed unconditional distance fog. Atmospheric haze now follows forecast fog codes or high relative humidity; high cloud cover alone no longer forces fog.
- Deepened the daytime blue gradient and kept a distinct water horizon. Existing waves, water geometry, camera and Bo are retained. High cloud fallback is a thin veil; low and mid overcast remain opaque.
- Water sheet leads with a condition-based verdict. Removed the redundant marine forecast subtitle and unavailable rip-risk row.
- Connected the NWS Tallahassee Surf Zone Forecast to **FLZ108, South Walton**. FLZ112 is Coastal Bay. The NWS badge opens the official source.
- Parse only the South Walton section and its dated periods. Hide rip risk on request failure, unparseable data, missing periods or a product older than 30 hours. Unknown risk never becomes Low.
- High-risk verdict: stay out of the water. A calmer-water window requires an explicit Low NWS risk plus suitable forecast waves, wind, rain and daylight.
- Tide label is 11 px in a white pill, retaining its projected high-water anchor.

Validation:

- Official product `90a9a3ed-49df-4e78-94cc-761f5f0d8dc3`, issued 2026-10-04 07:05 UTC: South Walton High Sunday/Monday, Moderate Tuesday–Thursday. Its Coastal Bay Thursday value is High; isolation test confirms it does not bleed into South Walton.
- Wrong-zone and expired products rejected. Simulated network failure removes the risk row without showing an unavailable label.
- Phone capture at 390 × 844: no JavaScript or WebGL shader errors; tide text 11 px; water-sheet camera remains at 201° while scrubbing.
- Astronomy and water engine source unchanged. Rendered solar directions retain the calculated azimuth/elevation.
- Recording uses actual Open-Meteo, marine, NOAA tide and NWS snapshots. Tuesday 8 AM is overcast with 88% humidity; Thursday noon has high cloud, dry air and no low/mid cloud. Neither is represented as a fabricated clear forecast.
- Clip is encoded at 30 fps from 6 native render frames per second, with a final hold. It demonstrates appearance and state, not iPhone rendering performance.

Blocked:

- Sky Pro ZIP is not attached and was not found in available files. The existing fallback remains. No proprietary source was acquired or published.

Official source: https://forecast.weather.gov/product.php?site=TAE&issuedby=TAE&product=SRF&format=CI&version=1&glossary=0
