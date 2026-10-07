# Data sources & credits

DayBuoy combines published forecasts with its own visualisation and estimates. It is not affiliated with or endorsed by NOAA, NWS, Open-Meteo or Tidewater's author. Local flags, closures and lifeguard instructions take priority over the illustrated scene.

| Source | Used for | Interpretation |
|---|---|---|
| [Open-Meteo weather](https://open-meteo.com/en/docs) | Temperature, apparent temperature, wind, rain, clouds and UV | Hourly model output, interpolated for the selected time |
| [Open-Meteo marine](https://open-meteo.com/en/docs/marine-weather-api) | Sea-surface temperature, significant wave height, period and direction | Offshore model height is not the height of every individual breaking wave |
| [Open-Meteo air quality](https://open-meteo.com/en/docs/air-quality-api) | Aerosol inputs used by the sunset model | Model input, not a measured sunset rating |
| [NOAA CO-OPS](https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=8729210) | Tide predictions, station 8729210 | Referenced to mean sea level; a nearby station, not a sensor on this beach |
| [NWS Tallahassee Surf Zone Forecast](https://forecast.weather.gov/product.php?site=TAE&issuedby=TAE&product=SRF&format=CI&version=1&glossary=0) | Rip-current risk for South Walton, FLZ108 | Official categorical forecast; missing/stale risk is hidden, not treated as low |
| [NOAA solar calculation method](https://gml.noaa.gov/grad/solcalc/calcdetails.html) | Sun direction and sunrise/sunset comparison | Locally computed astronomical position, not an observed sun sensor |

Weather data supplied by Open-Meteo under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). DayBuoy converts units, interpolates time samples and derives visual conditions, advice and estimates. The hosted API service has separate access terms and commercial subscription requirements. NOAA/NWS data retain their original attribution; DayBuoy's interpretations are not official government forecasts.

Burn time, lower-UV windows and sunset scores are **est.** DayBuoy model outputs. Their methods and limitations are in the Sun sheet. No scene or score guarantees conditions at the beach. The wave-height adapter uses H/2 for shore amplitude; its offshore spectrum still requires visual and numerical calibration.

## Tidewater

Native ocean and rendering infrastructure from [Dan Greenheck / Tidewater](https://github.com/dgreenheck/tidewater), pinned to `4811ba48d795197de5621985f404e765c0b7c0ef`.

Copyright © 2026 DRG Software Solutions LLC. Used under the [MIT License](../ocean-proof/vendor/tidewater/LICENSE). The original source snapshot and [upstream credits](../ocean-proof/vendor/tidewater/CREDITS.md) are retained. DayBuoy supplies the beach, camera/data adapters, quality controller, instrumentation, UI and coastal planting. This branch's native preview runs Tidewater's original wave/foam/swash systems; the WebGL fallback remains the previous DayBuoy renderer.

The upstream credits identify its published cloud implementation as an MIT release by the copyright holder. That does not license or publish a separately purchased Water Pro or Sky Pro package. Keep any proprietary package out of public repositories. This preview and source repository remain private.

## Other software/assets

Three.js: MIT; copyright retained in the distributed source. Poppins: SIL Open Font License; retain the bundled font notice. SMAA lookup textures: Three.js / SMAA reference implementation, MIT; upstream attribution retained. This coastal planting and wooden walkover are original procedural geometry, not downloaded models. No boats, village, people, whale, audio or commercial model pack is loaded by the ocean host.

Before release, finish the third-party asset inventory and confirm every distributed font/texture notice against the actual shipping bundle.
