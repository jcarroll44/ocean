# BoBuoy — v46 design-system handoff

23 September 2026. Built from the published v45 baseline. App commit: eb4002db66f367d0a560c1c703ac63e14dc9cfde. Main design commit: b5e5008aaca412deaaa18b98eb6c9937accefc5f. Live site: https://jcarroll44.github.io/ocean/

## Scope and user decisions

This is the design-system layer of the existing plan. It does not reorder the character, ocean-realism, physics, UV-model, location or data-source work. Those remain outside this pass. The user's explicit v46 instructions authorize the time-control replacement and existing-feed repair inside this pass.

The current wordmark is **BoBuoy**. The four tabs are **Today / Water / Sun / Tonight**; the user's decision overrides the earlier five-tab requirement. Sunset and stargazing now share Tonight. Bo stays in the default ocean view and existing day/evening playback framing. Incoming character-artist and five-screen UI references take precedence where they conflict with this design.

## Shipped presentation

- Ink `#1A435A`, amber `#F3A43A`, sea `#4987A4`, mist `#D3EBF9`, shell `#FBF8F3`. Interface colour families are blue, warm white and amber. Ink/sea/mist are shades of the same blue family; literal per-pixel RGB counting would also count antialiasing and transparent scene colour. Condition labels use words, without red/green/purple status blocks.
- Native system UI; `ui-rounded` display type with a bundled Nunito variable fallback. Only 300 and 500 weights. Type scale 56 / 28 / 17 / 14 / 12. The font and complete OFL notice are inside index.html; no font-network dependency.
- 24 px cards, pill controls, 20 px screen margins, soft shadows and no bordered boxes. One 40 px round-button treatment for Now, Play, Share and Settings. Visible keyboard focus uses a soft ring via shadow.
- Peek state: scene and centred Bo, one verdict, four live values, segmented days, a compact time arc and floating tab pill. Four values are Waves / Water / Wind / UV even at night.
- Expanded surfaces retain 70% shell or ink with 24 px blur, allowing the underlying scene to show through. Tonight has the ink surface in either theme. The four-tab pill shows a label only for the selected tab.
- Today: one hero, then equal two-column cards. Water and Sun: 56 px light numbers and retained figure cards. The Water comparison cube/crest/measure labels are hidden. This is a presentation change, not a replacement of the character or wave model.
- Tonight: sunset postcard and score, then stargazing verdict and sea-coloured meter. Methods and caveats are behind one information disclosure per tab. No sample banner inside the tabs. The header says `Offline · sample` on final sample fallback, and retains a distinct saved-forecast state.

## Time and motion

The old striped timeline and its range input are removed from the DOM. The panel has a 24-hour arc; its brightest segment marks the best remaining activity window. Drag or use arrow keys to select time; release holds the chosen time. Small bounded inertia settles in 240 ms. Now and double-tap on the scene return to current time and the ocean view. Days preserve the chosen hour when changing dates.

The real sun and moon receive a 48 px draggable target when they are above the horizon, inside the visible scene, and clear of the header/panel. During drag, an amber path follows their projected astronomical track. The panel arc remains available when a celestial body is offscreen. **The app does not move the sun into the hero shot artificially:** a fixed ocean-facing view often cannot include both Bo and the true midday sun. Pan/tilt can reveal the body; this case was tested for both sun and moon.

Panel transitions use a 320 ms spring-like easing; tab content enters over 280 ms; changing numeric values interpolate over 280 ms. Reduced-motion settings disable the new transitions, number animation and time inertia, and disable ambient motion at boot.

## Live data

The earlier v45 review images deliberately used fixtures; that alone did not prove a deployed feed defect. Direct inspection of the published site returned real weather, wave and air data, and reproduced intermittent 12-second request aborts. NOAA succeeded in later checks as well.

v46 uses AbortController with explicit timers and cleanup, a 20-second timeout for core forecasts and NOAA, and one retry for weather/marine failures. Air quality remains optional with its shorter timeout. Rejected request details and per-feed status are retained for diagnostics. Core data remains usable when an optional source fails; unavailable tide/temperature values are displayed as unavailable. No new provider, proxy, API key or forecast model was introduced.

The live screenshot runs received HTTP 200 and fulfilled results for:

- Open-Meteo beach/light-gate weather
- Open-Meteo marine waves and sea-surface temperature
- Open-Meteo air quality
- NOAA hourly tide predictions
- NOAA high/low tide predictions

Screenshots use real forecast values for noon and 10 PM on the selected local day. They are forecast views, not observations or photographs. Provisional startup data is not shown as numerical values before a forecast arrives. A final sample fallback is labelled in the header.

## Verification

- 16 captures at 390 × 844: peek and expanded for all four tabs, in day and night themes.
- Visible UI audit across every capture and Settings: weights 300/500 only; no text below 12 px; sizes restricted to the type scale; no visible borders; no horizontal page overflow; shell/ink alpha 0.7 and blur 24 px.
- Confirmed four tabs, no old scrubber or sample banner; sunset/night shared navigation; old sunset/night saved links migrate to Tonight.
- Panel time drag, release retention, keyboard changes, Now, double-tap return, matching playback clocks and stop.
- Draggable actual sun and moon after bringing them into view, plus reduced-motion boot behavior.
- Additional widths 375, 430 and 1280 checked for horizontal overflow. Notch and home-indicator safe-area offsets are included.
- Delayed live-request startup check: provisional values remain blank; Loading forecast changes to live values after real requests resolve.
- No JavaScript or shader errors in successful rendering checks.
- Scene rendering is real software WebGL for captures. Rendering is paused for portions of the control checks. These tests are not an iPhone FPS, heat or battery benchmark.

The renderer, astronomy, condition model and UV model were compared with v45 and are unchanged. In figure.js, only the visibility of the wave comparison diagram changes; character geometry and poses are unchanged.

## Limits and next pass

A static GitHub Pages client can still lose access to a provider when the user is offline or a service fails. Retries improve transient failures; they cannot guarantee provider availability. The app retains saved forecasts and explicitly labelled samples for those cases.

No character replacement, beach-chair pose, ocean realism improvement, calibrated webcam comparison, physical iPhone performance measurement, new location, new data source, or permanent app logo was attempted in v46. Keep those in their existing plan layers. Do not interpret visual polish as completion of those layers.

## Working files

The app remains self-contained in index.html. The named embedded modules and their boundaries remain. New v46 presentation functions wrap the existing forecast/model functions. Legacy panel functions remain unused in the bundle; deleting/refactoring them is not necessary for this design pass.

HANDOFF.md is the current entry point. OVERNIGHT-HANDOFF.md records v45 history. The screenshot bundle contains only the final 16 live-data phone captures, two overview sheets, this handoff, the app and a machine-readable test summary.
