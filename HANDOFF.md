# Seaglass — Visual Truth storm3

Updated 2026-10-20. Read HANDOFF.md and continue. Public WIP summary; licensed source and private configuration omitted.

## Current revision and source

Revision `2026-10-20-visual-truth-v2-v3-storm3`, private runtime `95fc8c7d2b3974a6fb8286c349fb2b5eab2c4c09`, version 74, deployment `appgdep_6ad78bc40b6c8191854f045ec59c2d75`. Same gate: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/visual-truth.html .

Production remains Tidewater. Accepted launch tag `scene-baseline-rc14c-startup` stays immutable at `c6d8241f1a2f248e62b3ad3c15ffc1203df65473`. Capture tools remain `2026-10-15-blob-recovery-rc12c`. No new phone acceptance or passing tag.

## What changed

Storm2 placement and performance were accepted; appearance was rejected. Its uploaded run recorded 42.3509 average FPS, minimum 32, zero seconds below 30, and five geometry passes. Those measurements do not certify storm3.

Field-only changes: metre-scaled 3D billows and eroded crowns, low soft bases, stronger column optical depth and base shading, blue-noise sampling with bounded same-field history, directional rain curtains preserved through fog composition, and fine near-camera rain with existing wet-sand and water-impact effects. Source field geometry, normal UI/camera, accepted surf, FFT and no-field appearance stay unchanged. No new render passes or particle-count increase.

Final review reproduced a cancelled-first-field defect: a discarded field's completed-history metadata could survive a legacy atlas overwrite. History now requires the displayed layer's actual field identity and presentation hash. Regression fails before the fix and passes afterward.

## Verification

Local tests are not a real-browser/device/visual pass. Full required build and hosting passed: all seven interaction checks, 84 actual native pipeline creations / 80 WGSL modules within default limits, 36 settled still-command paths, 40 controlled startup/API cases, field lifecycle/volume checks, and controller retry/reload/Share tests with doubles.

The field compute uses 3 uniform buffers, 4 sampled textures and 9 samplers. All five fixtures plus heavy overhead pass actual Dawn-null command/lifecycle checks. Semantic textures stay bounded at 4 MiB and release to zero. CPU volume diagnostics pass all six cases with current source hashes; they are not app screenshots.

Deployed asset audit: 63/63 HTTP 200, matching packaged bytes and SHA-256. Private report: `night-report/geo-storm3-deployed-assets.json`.

## Open issues and next steps

Run the same gate on iPhone: intense overhead field for 120 seconds, accepted same-device control, and five actual map/scene pairs. Review dark bases versus lit crowns, soft billows, rain curtains, overhead camera rain, wet sand and retained horizon. Fresh appearance and sustained performance remain unverified. Preserve the original 36-capture/wave gate; do not tag or promote to Features before acceptance.

The interrupted workspace was recovered from the exact private storm2 commit. Recorded storm3 edits were restored and fully revalidated. The final edge/crown hunk was reconstructed from the recorded equations/design; prior interrupted checks were not used as acceptance.

## Rules

Never commit/push GitHub main or expose secrets. Private Sites main deployment is approved; preserve owner-private access. Keep MIT credits, private vendor source, default GPU limits, 1.1 DPR floor, strict gates, recovery/Share, API compatibility, other lanes and immutable tags. No GPU runner or invented phone/pixel results. Update HANDOFF every pass.

## Archived handoff — storm2

# Seaglass — Visual Truth storm2 atlas publication repair

Updated 2026-10-20. Read HANDOFF.md and continue. Public WIP summary; licensed source and private configuration omitted.

## Current revision and source

Candidate `2026-10-20-visual-truth-v2-v3-storm2` deployed from private Sites runtime `7dae9816da698ea7e069cb4fe0225aaa0088a8d4`, version72, deployment `appgdep_6ad6f4d171f08191b6d209f2067b4846`. Receipt-only checkpoints preserve these runtime bytes. Same gate: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/visual-truth.html .

Production remains Tidewater. Accepted launch tag `scene-baseline-rc14c-startup` remains immutable at `c6d8241f1a2f248e62b3ad3c15ffc1203df65473`. No new phone acceptance or passing tag. Capture tools remain `2026-10-15-blob-recovery-rc12c`.

## What changed / passed

Storm1 reported “Committed cloud atlas did not become visible” before any case. Local actual-cache reproduction found committedKey was forecast-prefixed while readiness expected geo:<contentId>. The complete atlas swapped and reached blend1 but readiness stayed false, causing a redundant 25.6-second bake at simulated40FPS beyond the20-second deadline. The uploaded results branch had no04:29 report; do not claim its device JSON was read.

Commit now retains the baked key. Geo refresh ages from completion/publication; explicit same-ID retry still prepares. No-field scheduler/shaders unchanged. Gate saves exact field/keys/progress/blend/timing diagnostics, discards failed staging or reopens after a failed commit, uploads failure checkpoints even with zero captures, and continues the five independent cases. Same-field refreshes remain valid only when both completed atlas identities match; different-field blends still fail.

Local tests are not a real-browser/device/visual pass. Actual Dawn-null lifecycle checks passed all5fixtures plus heavy overhead: ready after400ms crossfade,1024-stripe bounded refresh, semantic textures4MiB→0afterclear, no new pass. Default-limit field compute3uniform buffers/3sampled textures/9samplers. CPU equation reference supports overhead ceiling opacity≈.989, right-cell visibility and continuous rain; it is not an app screenshot.

Full required build passed: seven interaction checks,84actual native pipelines/80WGSLmodules,36still-command paths,40controlled startup/API cases,71field/gate checks and actualcontroller withDOM/native doubles covering delayedcommit, same-field refreshes, timeout/staging failure, five capture paths, reload andShare. Deployed assets63/63HTTP200 with exactbytes/SHA256. Private report: night-report/geo-storm2-deployed-assets.json.

## Open issues / next steps

Run the same gate on iPhone: intense overhead field for120s, accepted same-device control and5actual map/scene pairs. Review ceiling/camera rain, rightcell, soft billows/shafts and stormlight. Keep original36capture/wave gate. No fresh rendered/performance claim or new passing tag.

Storm1 visual work is retained; this pass repairs publication/recovery. Accepted surf/UI/camera/no-field look, publicconditionsAPI, defaultlimits/1.1DPRfloor, MITcredits and other lanes stay preserved. Data source/provenance limitations remain explicit. WaterPro bounded final attempt remains independent and cannot block Tidewater.

## Rules and invariants

Never commit/push GitHub main or expose secrets. Private Sites main deployment is approved. Preserve owner-private audience, licensed source privacy, strict gates, durable evidence and immutable baseline tags. No GPUrunner or invented phone/pixel results. Keep HANDOFF current everypass.

## Archived handoff — storm1

# Seaglass — Visual Truth storm volume / gate repair

Updated 2026-10-20. Read HANDOFF.md and continue. This public WIP summary omits licensed source and private runtime configuration.

## Current revision and source

Candidate `2026-10-20-visual-truth-v2-v3-storm1`. Runtime private Sites source `7c74c5a2b053a38ac16ea205d91c7624134ed040` deployed successfully as version70 (deployment `appgdep_6ad6e6b378ac8191ad363f879b8b092f`). Subsequent receipt-only commits retain identical built runtime. No new phone pass or baseline tag.

Gate: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/visual-truth.html

Production ocean remains Tidewater. Immutable accepted launch: `scene-baseline-rc14c-startup` at `c6d8241f1a2f248e62b3ad3c15ffc1203df65473`.

## Changes and evidence

- Uploaded Visual Truth run2026-10-20T03-09-50Z-d44795c6 passed numeric geometry, failed appearance, and never completed120s. Those results are not relabeled.
- Removed the solid slab floor/vertical extrusion. Existing volumetric atlas now uses raster-derived occupied ray bounds, rounded inward edges, billowed crowns, self-shadowing and64stratified depth samples.64atlas pixels/frame,2shadow samples; same512x128atlas, no added render pass, bounded4MiBsemantic textures. CPU raw/display data and map/scene identities stay immutable.
- Continuous dBZ-scaled rain curtains replace four height planes. The same field drives overhead sun occlusion, diffuse light, visibility, local rain/wetness and existing water impacts. Missing radar/GOES retain appropriate forecast fallbacks. Estimates/source labels remain.
- Right-hand cell was outside the solar-yawed portrait camera although the map arrow pointed offshore. The private diagnostic now holds an offshore manual heading, synchronizes the real camera before baking, and logs/draws its actual FOV. Normal app camera/UI and original36captures are unchanged.
- Gate false abort came from comparing observed minDpr1.2 to configured floor1.1. It now checks actual production policy, DPR bounds/step, AA/flare, revision and queue depth; real mismatches still fail with details.
- Deployed audit discovered producer DATA1.3. Its actual grid/channels/PNG/canonical hash match the contract. Added explicit1.3 support with every validator retained; extra storms/lightning metadata does not enable deferred effects. Data/Features repositories untouched.
- Full local build passed: seven interaction checks,84actual native default-limit pipelines/80WGSLmodules,36still command paths,40controlled startup/API cases, strict field-volume compute/resource checks, geometry/lighting/policy/DOM/reload/Share tests. All63deployed asset bodies returned HTTP200 with exact SHA256/bytes. Live Data1.3 observed/+1h/+3h/+6h plus forecast proxy passed9/9requests.
- Local null-backend/CPU/DOM tests and the CPU volume illustration are not rendered iPhone evidence or a120s performance result. Gulf reference photography informed shape/lighting and is not embedded in the app.

## Open and next

Run the same gate in iPhone Safari: active-field120s, same-device accepted baseline control, five actual map/scene pairs, Share results. Review actual clouds, right-cell visibility, rain curtains and overhead lighting. Original full36capture/wave gate remains required. Do not tag or promote before matching device acceptance.

Keep surf truth, no-field look, UI, default WebGPU limits and1.1DPRfloor. No public main writes, secrets, vendor source, GPU runner, invented results or threshold weakening. Preserve all accepted tags and condition API compatibility. Water Pro final bounded attempt remains independent; if it fails, close A/B and continue Tidewater.

## Archived prior handoff

# Seaglass — final Water Pro attempt; live Visual Truth V2/V3

Updated 2026-10-20. Read this handoff and continue. This is a public WIP summary; licensed source and full scene/deployment evidence stay in the private Sites source.

## Current revision and deployed source

Native: `2026-10-20-visual-truth-v2-v3-live`. Comparison: `2026-10-20-visual-truth-v1-waterpro-final`.
Runtime private source `391fdaad8611edde2afe6590a136b6fe4333835e` deployed as Sites version67; verified receipt checkpoint `87e599f086e3a50a622a1ee6041741cad1aa9cd0` retains identical runtime, successful deployment `appgdep_6ad6d8d6363c8191b38f8f757d6e8189`.
Production ocean remains Tidewater. Accepted immutable tag remains `scene-baseline-rc14c-startup` at `c6d8241f1a2f248e62b3ad3c15ffc1203df65473`. No new device acceptance/tag.

- Final comparison: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/visual-truth-ab.html
- Live Visual Truth + active-field120s/control/five pairs: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/visual-truth.html
- Existing full36-capture/wave/performance gate: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-16-stormcells-rc15

## What changed and passed

- Missing AB2 report detail came from success-only uploads before later candidate failures. Failures and final JSON now upload independently, survive reload/Share and appear on-page: exact message/stage/pipeline, feature/limit if identified, capabilities/device-loss/preparation trace. Historical AB2's exact shader error cannot be reconstructed from absent evidence.
- One final bounded Water Pro3.5.1 attempt: half-float sky, omit unused float32 transfer pipelines, no optional features/raised limits, async-only actual-device descriptors and90s preparation cap. Failure permanently closes further candidate attempts in the journal. This is a compatibility hypothesis; iPhone attempt remains unrun.
- Live Data1.1/1.2 wire adapter preserves producer ID, source times, missingness, rawPNG/decoded hashes and pinned timelines. Private server proxy keeps credentials out of clients. Live forecast and shared field/time publish atomically to map/scene.
- Certainty fade is a shared display derivative (0m observed,500m at+1h,1500m at+3h,3000m at+6h), while raw classes/bytes stay immutable. Two bounded2MiB texture arrays, no extra pass.
- V3 rain shafts run in the existing amortized cloud bake; valid beach dBZ drives local rain and existing water impacts through explicitly labeled Z=200 R^1.6 est. Missing radar retains forecast rain. Rain trails are finer/lower-opacity at unchanged384 instances. Supplemental120s uses64dBZ overhead field and validates local rain throughout.
- Full local build passed: seven interaction checks,84native default-limit pipelines/80WGSL modules,36still command paths,40controlled startup/API checks, live Data/hash/controller tests, and52async Water Pro pipelines in each of four format/timestamp configurations with zero sync calls. These are CPU/DOM/Dawn-null checks, not iPhone rendering/FPS.
- Deployment transport audit:63/63 assets HTTP200 with matching bytes/SHA256. Actual deployed private Data proxy:9/9 requests, observed/nowcast/model fields and forecast, verified immutable image hashes/IDs. Private reports: `night-report/visual-truth-final-deployed-assets.json`, `night-report/geo-live-deployed.json`.

## Open and next

Run the one final iPhone A/B; any compatibility failure closes it, with no AB4. Tidewater remains production regardless because stock Water Pro lacks accepted partitions/sets/refraction/sandbars/connected breakers. Continue live V2/V3 independently. Fresh rendered map/scene alignment and120s/full36-capture/wave evidence are pending; do not claim a passing tag. Existing persistent foam/spray are preserved; enhanced foam/spray/nearshore-depth ports are not claimed complete. Preserve golden-hour glint. Data producer declares GOES parallax uncorrected; missing echo/radar is not dry weather. Data/Features source deployments are untouched.

## Rules

No public main, secrets, vendor source/ZIP, raised WebGPU limits, GPU runner or invented phone results. Private Sites main/deployment approved; retain owner-private audience. Keep accepted surf truth, camera/UI,1.1DPRfloor, budgets, MIT Tidewater/Takram credits and immutable controls. Update rootHANDOFF at every pass. Features should consume accepted tag until a new build passes.

## Archived prior handoff

# Seaglass — Water Pro A/B asynchronous preparation repair

Updated 2026-10-20. Read AGENTS.md and INTERACTION-CONTRACT.md. Read HANDOFF.md and continue.

## Current revision and scope

- Comparison revision `2026-10-20-visual-truth-v1-waterpro-ab2`, from private Sites `e4e25cd7458cd2b909a9299b4bfb02a9e0d4fa04`. Same comparison route: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/visual-truth-ab.html . Runtime deployed from `7e71cab4b7c93160ff492ebec161600c0c2a8d80` (private Sites version65, deployment `appgdep_6ad6c6c794a88191a3293605e92fb4cd`). Later documentation-only checkpoints retain identical runtime assets. Do not infer a phone pass.
- User-reported AB1 run `2026-10-20T00-58-02Z-64fd7414`: accepted Tidewater3/3, WaterPro0/3 and120s blocked by “Unprecompiled candidate render pipeline; sync creation prohibited.” No candidate hardware result.
- Tidewater production, immutable `scene-baseline-rc14c-startup`, V2 weather-field runtime, public conditions API and existing native gates remain unchanged. No new scene tag.

## Changes

- The host-generated pipeline list is now validation evidence, not a runtime whitelist. Candidate load discovers actual Three0.183/WaterPro3.5.1 scene, offscreen depth/mask, foam, PMREM/output, compute and texture-transfer descriptors on the active device. Every actual GPU pipeline is created asynchronously. Three computeAsync still uses a synchronous constructor internally; the candidate adapter prepares that descriptor asynchronously before any real dispatch.
- All internal render passes use compileAsync during preparation with their actual render-target/depth settings. PMREM is rendered again after compilation so it contains real sky pixels. Texture/mipmap variants are primed through Three's own descriptors. No shader, visual preset, native or vendor-source edit.
- Pipeline progress shows compiled/pending counts and labels. Readiness requires zero pending pipelines and no compile errors; capture and timed measurement reject an unprepared candidate. A sealed timed phase cannot silently compile. Compile rejection fails immediately; timeout gets one bounded retry.
- AB2 restores the three accepted baseline images, camera packets and clocks from the AB1 journal, retaining the old journal and provenance. Candidate captures/timing are new-build evidence. Share and independent save/upload stay intact.

## Verification

- Four strict Dawn-null configurations passed: rgba8unorm/bgra8unorm, each with/without timestamp-query. Each generated56actual pipelines using actual source image dimensions and an empty host manifest, completed3capture command paths, then32steady frames with zero new compilation and zero synchronous GPU constructors. All default-limit checks passed; no raised limits. Source/report hashes bind checks to the candidate bundle.
- DOM workflow checks passed six-part sequencing, single-device ownership, invalidBlob retry/continuation, reload/Share, AB1→AB2 preservation of three baseline images and pre-ready candidate rejection. Registry checks cover dynamic descriptors, pending/ready state, timed-phase sealing, compile-error rejection, timeout retry and default-limit rejection.
- These are shader/command and mocked-media/DOM checks, not rendered iPhone captures, Safari or120s performance. Full native build passed: all seven interaction checks,84default-limit native pipelines/80WGSLmodules,36still command sequences,40controlled startup/API checks and V2field/truth checks. Hosting package verified every original asset byte. Native app and original gate output remain byte-identical to the prior deployed source. Deployed asset audit passed26/26 complete HTTP200 bodies with matching bytes/SHA256, including cache-busted AB2 controller/engine. Reports: `night-report/waterpro-ab2-deployed-assets.json` and `.md`.

## Open / next

- Implementation, full required build, private deployment and deployed hashes are complete. User reruns comparison and candidate120s on iPhone. Preserve all prior accepted baseline tags.
- Water Pro remains an experimental reference, ineligible for promotion: stock implementation still lacks our accepted partitions/sets/refraction/sandbars/connected-breaker truth. Reference sky/stand/tide differences remain disclosed.
- V3 visual notes (deferred; no changes in this pass): golden-hour glint is great and must stay; daytime close water needs nearshore detail/depth; replace large white storm dashes with fine dense rain sheets and distant gray shafts; lifeguard stand replacement is already planned.
- Never commit public GitHub main or vendor source; private Sites main is approved. Keep secrets out of files/output, owner-private audience, MIT credits, default GPU limits and1.1DPRfloor. No GPU runner or unearned hardware/visual claim.



## Prior public handoff

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

