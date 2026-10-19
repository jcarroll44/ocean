# Seaglass — Visual Truth V2 candidate

Updated 2026-10-19. Read AGENTS.md and INTERACTION-CONTRACT.md. Read HANDOFF.md and continue.

## Current revision and source

- Candidate revision `2026-10-19-visual-truth-v2`. Capture tools remain `2026-10-15-blob-recovery-rc12c`.
- V1 A/B deployed from private Sites commit `ef63b9460ab7521a47cc8301ce288da4ea52878b`, version62, at https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/visual-truth-ab.html . Experimental Water Pro3.5.1/Three0.183 remains isolated; production remains Tidewater.
- V2 is deployed and verified at runtime source `d8428399d6ef9d013a6522020518358c7b6c1980` (private Sites version63). Subsequent documentation-only checkpoints retain identical runtime assets. Its route is https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/visual-truth.html . Published revision: `2026-10-19-visual-truth-v2`. No passing device tag is implied.
- Accepted immutable baseline remains `scene-baseline-rc14c-startup` / `c6d8241f1a2f248e62b3ad3c15ffc1203df65473`. No Visual Truth candidate has phone acceptance or a baseline tag.

## What passed

- V1: all39actualgeneratedWaterPro pipelines compiled under strict Dawn null default limits; async-only replay passed. Six-part controller/reload/retry/Share checks passed. Full native build/seven interaction checks passed before V1 deployment.
- V2 full build passed, including all seven interaction checks,84native default-limit pipelines/80WGSLmodules, the three immutable baseline controls,36stillcommandsequences and40controlled startup/API attempts. The extra geo-cloud compute also passes default limits. 35field-format checks,26loader/API checks and49geographic-fixture/codec checks passed locally. Native geo-cloud compute compiled/dispatched under strict Dawn null default limits; two1MiBsemantictextures released on clear. Existing no-field cloud shader remains unchanged.
- Local tests are not a real-browser/device/visual pass. No phone FPS, pixel alignment or live-data quality is certified by mock/native-null checks.
- Deployed V2 audit:78asset requests returnedHTTP200 with matching bytes/hashes. The actual downloaded app/bridge/startup-check modules passed40controlled conditions()/setConditions() startup attempts; missing/mismatched inputs correctly fail. These are DOM/mock-native checks, not40phone starts. Reports: night-report/visual-truth-v2-deployed-assets.json and visual-truth-v2-deployed-api.json.
- Deployed V1 audit:63asset requests returnedHTTP200 with matching bytes/hashes. V2 controller tests execute five pairs,120s/control sequencing, time identity, isolated capture/upload failures, reload/resume/Share and one-device disposal. These are DOM/native doubles.
- Same immutable512²RGBA8field drives a north-up150km map and the existing amortized cloud atlas in beach-local scene metres. Encoded/decoded/content hashes, raw PNG decoding, bounded retries/cache, atomic prepare/commit and shared400mscrossfade preserve data identity.
- Additive private-host public API: `setConditions({geoWeather:{manifest,rgba?,selectionId?}})` returns a ready promise; after both map and scene acknowledge, `commitGeoWeather(contentId)` publishes. `conditions()` and legacy stormCells setters retain compatibility. Getter metadata excludes image bytes. Clear with `setConditions({geoWeather:null})`.
- Supplemental gate keeps an intense field active for120s, runs30sacceptedbaseline afterward, saves timing before restarts, then saves/uploads five paired captures independently. Report distinguishes numeric uploaded-field geometry from rendered silhouette review. Existing36stills/wavetruth/Share gate remains unchanged.

## Open issues

- Data contract is finalized on the consumer side and published in GitHub WIP (initial5590257e96325fc45d8527bfa7a4b59c38c789b2; core-alignment update d0d191e322ce7315ab808618e7327ca4d2e546bd); Data preview a4991c7c51b606592a0adfb4080191c21a727054 now confirms the core format (AEQD150km/512RGBA8/geoWeather/hashes/channeltimes); its ingestion/encoding/refresh and live semantic endpoint are explicitly pending. Five test fields are explicitly synthetic. Do not claim live radar or unimplemented route agreement.
- WaterProstock cannot carry accepted partitions/sets/refraction/sandbars/connectedbreakers and is ineligible for promotion. Reference sky/stand/tide are disclosed differences. No borrowed effect is applied to production.
- V2 automatic live-source acquisition, Features map wiring and the separate production/native package are not promoted by this private diagnostic deployment. V3precipitation and V7futurecertainty are later cards; nonzeroedgeSoftness is explicitly rejected until V7.
- Actual rendered cloud alignment, five paired photographs and iPhone120sperformance remain pending. Managed preview browser capability is unavailable; do not claim Safari QA.

## Next steps

1. V1 comparison and V2 field gate are deployed; local and deployed-byte checks are complete. The next acceptance step is actual iPhone Safari performance and review of five map/scene pairs. Keep the runtime revision with each result; never infer device acceptance from host checks.
2. Run V2 field gate on iPhone; review actual map/scene silhouettes. Run existing https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-16-stormcells-rc15 for36stills,5wavechecks and existing acceptance. No startup4phone tests requested.
3. Connect Data's real endpoint when published, using docs/visual-truth-field-contract.md. Preserve selection IDs/time/hash and atomic publication. Only tag genuinely passing builds; continue V3 then V7 after V2.

## Rules and invariants

Never commit/push GitHub main or expose secrets. Private Sites main is approved. Preserve owner-private audience and other Data/Features lanes. Vendor source/ZIP/demo credentials stay outside Git/served paths. Preserve MIT credits (Tidewater/Takram/Three), accepted surf, UI/camera,1.1DPRfloor and default WebGPU limits. No GPU runner. No invented agreement, rendered screenshots, pixel pass or hardware measurements. The full gate remains required for changed scene acceptance.

