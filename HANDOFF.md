# DayBuoy handoff — startup4 conditions API correction

Updated 2026-10-19 UTC (October18 America/Chicago). Read AGENTS.md and INTERACTION-CONTRACT.md first. Read HANDOFF.md and continue.

## Current revision and source

- Revision `2026-10-19-stormcells-rc15-startup4`; starting source `5d934ae436f30990010ca7cb6f9ef8ee923ec795`, prior deployed runtime `49e2f633d7d4205610b96e5ce7097586e574b616`. Deployed runtime `5dca02d36d30bbf79a73063d27a6ca8d1d0832f0`.
- Publication succeeded: version `appgprj_6ac49343ea048191b93c8d1135390e39~appgver_84459646f9d88191877bce5e506d09b2`, deployment `appgdep_6ad56810cde4819195bf5c7e25adeb3a`. Same owner-private Site; later documentation commits do not change this runtime.
- User reports startup3 2/2 immediate failures: `v.conditions is not a function`. Reproduced from actual deployed HTML and hashed startup launcher. The checker called the iframe Window rather than its public API object. Both methods were already present on `window.__daybuoy`; no method was renamed or removed.
- One-line fix: `app.conditions()` becomes `app.__daybuoy.conditions()` in startup-check's confirmed-frame branch. Existing public getter, additive setter, diagnostic `__ocean` alias and production API remain byte-identical. Scene, shader, camera, UI, mipmap recovery, timing/capture criteria and frozen controls remain untouched. Capture tools remain `2026-10-15-blob-recovery-rc12c`.

## What passed

- Exact deployed startup3 failure reproduced in both controlled network-label paths. Legacy getter and storm-cell setter round-trip checks pass before native completion; the old checker then fails at the wrong receiver. Report: `night-report/conditions-startup3-reproduction.json`.
- Full build passed, including all nine frozen-scope checks, 80 WGSL modules/84 pipelines at default limits, 36 still command sequences, mipmap timeout recovery and immutable controls. The new integration regression passed40/40 starts across two controlled network labels using the freshly built app and hashed launcher; missing-input and mismatched-native negative cases reject correctly, and reload restores saved results. Report: `night-report/conditions-startup-local.json`.
- Local checks execute actual app/checker JavaScript with DOM/native-GPU doubles. These are not physical iPhone, browser, Wi-Fi/cellular timing or rendered results. Production build/check and byte-verified hosting package also passed.
- Post-deployment: downloaded the actual live app, startup HTML and hashed launcher, then executed the same regression against those files:40/40 valid starts; both negative cases rejected, API round trips/forwarding, checkpoint upload and saved-result reload passed. Reports: `night-report/conditions-startup-packaged.json` and `night-report/conditions-startup-deployed.json`. Mock GPU/network limits apply.
- Deployed asset audit:39/39 complete HTTP200 GET bodies, byte counts and SHA-256 match the packaged assets. Report: `night-report/startup4-deployed-assets.json` and `.md`. No failing URL.
- Independent final compatibility review found no blocking issue. Scene and native renderer bytes are unchanged; only the app/checker revision and checker receiver differ.

## Open issues

- Actual iPhone Wi-Fi/cellular startup and RC15 storm-cell hardware/visual acceptance remain pending. Previous accepted launch remains `scene-baseline-rc14c-startup` at `c6d8241f1a2f248e62b3ad3c15ffc1203df65473`; Features stays there until matching acceptance.

## Next steps

1. Implementation, local regression, deployment and execution of the downloaded deployment are complete. Run startup4 on the iPhone for real Wi-Fi20 + cellular20; then use the unchanged storm-cell gate. Preserve current API, saved results and original mismatched-cell rejection.
2. Startup link: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/startup-check.html?v=2026-10-19-stormcells-rc15-startup4
3. Same scene gate: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-16-stormcells-rc15

## Rules and invariants

- Never commit/push GitHub main or expose secrets. Private Sites main approved; owner-only audience unchanged. Mirror this handoff to GitHub WIP.
- All immutable baseline tags remain unchanged. No Features promotion, scene edits, threshold relaxation, raised WebGPU limits or GPU runner. Preserve saved results and Share behavior.

## Archived startup3 handoff

# DayBuoy handoff — mipmap timeout recovery

Updated 2026-10-18 UTC. Read AGENTS.md and INTERACTION-CONTRACT.md first.

Read HANDOFF.md and continue.

## Current revision and source

- Revision `2026-10-18-stormcells-rc15-startup3`; deployed runtime `49e2f633d7d4205610b96e5ce7097586e574b616`, starting source `3644efbeec98290938c12036fc48c6daeab72017`, prior runtime `a47a611cf00ea574a617ca3f818b07111251a4d7`.
- Deployment succeeded: version `appgprj_6ac49343ea048191b93c8d1135390e39~appgver_cfbd80ffce7081919f0aef20ade2d79f`, deployment `appgdep_6ad4ffb74f7c8191a8c5a0f9f471cfdb`. Same owner-private Site. Later documentation checkpoints do not change this runtime.
- User reports two cool iPhone starts failing `GPU_PIPELINE_TIMEOUT: mipmap rgba8unorm`, stage pipeline-compile, 12.6 s. The accessible uploaded reports predate these failures; candidate versus immutable control attribution is not established. Do not call this thermal failure.
- Startup-only change: exactly two bounded async mipmap attempts, then initialized mip0-only sampling for affected textures and their packed material array. No fallback shader, render pass, raised limit or healthy-path descriptor change. Cached texture views and binding versions are invalidated once; stale compilations never attach.
- Mipmap fallback is explicitly reduced-quality native rendering, including `optionalEffects.degraded`. The existing full-quality gate refuses it. Healthy and single-retry success remain full quality. Deterministic shader/layout errors remain nonretryable; typed driver timeouts preserve their code through importer/watcher/parent recovery and retain the existing finite retry/watchdog limits.
- Healthy scene, waves, cloud shaders, UI, camera, storm API, single-cell120s gate, both horizon captures and existing criteria remain frozen. Capture tools remain `2026-10-15-blob-recovery-rc12c`.

## What passed

- Controlled host fault injection:20/20 immediate-ready assets and20/20 delayed-ready assets. Every case forces two mipmap timeouts, samples initialized mip0 through actual adapted texture and packed material-array paths, submits validated native draw commands, and releases all tracked resources.40 devices created/40 destroyed; zero tracked live devices/allocations after every disposal. Healthy and single-retry controls also pass.
- These use Dawn's strict null backend and accelerated timeout clocks; no pixels, phone timings, Wi-Fi or cellular measurements are produced. Driver memory remains unmeasured. Reports: `night-report/mipmap-startup-batches.json` and `night-report/mipmap-upload-evidence.json`.
- Full `node scripts/build.mjs` and all seven interaction checks passed: bounded async recovery, typed-timeout ownership,15-second watchdog, asset retries, all84 candidate pipelines/80WGSL modules at default limits, original36 still command sequences and immutable baseline controls. Local tests are not a real-browser/device/visual pass. Deployed verification is recorded after publication below.
- All six frozen RC11/RC12c/accepted-startup renderer and worker bundles match the prior deployed byte counts and SHA-256 exactly. Their build adapters now explicitly load the accepted startup helper graph rather than inheriting candidate edits. Report: `night-report/startup3-control-byte-checks.json`.
- Production build/check and byte-verified Sites packaging passed. Deployed GET audit passed39/39: HTTP200, complete byte counts and SHA-256 match packaged assets, including revisioned renderer and startup launcher. Reports: `night-report/startup3-deployed-assets.json` and `night-report/startup3-release.json`.

## Open issues

- Actual new-build iPhone Wi-Fi20/20 and cellular20/20 remain pending. This host cannot manufacture device/network results. Prior accepted startup2 results certify only its immutable launch tag.
- RC15 storm-cell FPS, actual GPU budget and visual acceptance remain pending. Do not tag this recovery as accepted or reinterpret reduced quality as full-quality success.

## Next steps

1. Implementation, local verification and private deployment are complete. Preserve this source and the saved reports; do not re-run scene work.
2. Run https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/startup-check.html?v=2026-10-18-stormcells-rc15-startup3 on iPhone Safari for20 Wi-Fi +20 cellular starts. Saved rows retain pipeline attempts, local fallback, stage, first-frame time and teardown census. Reduced-effect starts are disclosed separately.
3. Same scene gate remains https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-16-stormcells-rc15 . Matching device acceptance is required before `scene-baseline-rc15-stormcells` or a Features baseline change.

## Rules and invariants

- Never commit/push GitHub main or expose secrets. Private Sites main deployment approved; preserve owner-only access. Mirror HANDOFF to GitHub WIP after publication.
- Accepted launch tag `scene-baseline-rc14c-startup` and all earlier tags remain immutable. Preserve exact accepted baseline controls, UI, surf truth and saved evidence. No further scene work.
- Keep original gate thresholds, default WebGPU limits,1.1DPRfloor and4x256FFT. No GPU runner. Do not infer hardware acceptance from mock/null-backend checks.

## Archived single-cell gate handoff

# DayBuoy handoff — RC15 single-cell gate correction

Updated 2026-10-18 UTC. Read AGENTS.md and INTERACTION-CONTRACT.md first.

- Internal revision: `2026-10-18-stormcells-rc15-gate1`. Public gate URL remains https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-16-stormcells-rc15 . The new revision isolates saved evidence from the previous four-cell run.
- Scope: gate/evidence only. All scene, cloud shader, API, camera, quality and startup source remains exact deployed `09158aad40c9c09cd51be439bf20110a75c2bd13`. Accepted launch tag remains `scene-baseline-rc14c-startup` at `c6d8241f1a2f248e62b3ad3c15ffc1203df65473`.
- Candidate seeds one approaching cell before initialization: profile offshore bearing, 18 km away, 14 km full width, intensity 0.85. Decision: approach at 30 km/h along offshore+180 degrees (motion direction TO shore). Every completion callback checks inputs, renderer and displayed cloud atlas throughout the unchanged 120-second window; report includes projected motion and validation counts.
- Two supplemental originals: `stormcells-horizon-day.jpg` at true solar noon, and `stormcells-horizon-golden-hour.jpg` at the existing golden-hour phase (one hour before astronomical sunset). Clear the prior cell epoch before each phase so the requested 18 km start is preserved across forecast jumps. Existing retry/resume/upload remains; originals persist into Share results after reload. All original 36 stills, 37 color checks, five wave-truth cases and clips remain intact.
- Four-cell startup stress, RC11 readiness probe, exact accepted launch control, +1.0 ms GPU budget, <=10% drift, >=36 average/>=30 every second, default limits and 1.1 DPR floor remain unchanged. Scene appearance is not altered in this correction.
- Local verification passed: full `node scripts/build.mjs`, all seven interaction checks, 80 WGSL modules/84 default-limit pipelines, original 36 still command sequences, actual gate completion/recovery algorithm, missing/wrong/mid-run dropped cell and atlas rejection, both supplemental capture retries, and original JPEG bytes in Share after reload. Production build/check passed. These are CPU/null-backend/mock checks; no iPhone FPS, rendered captures or 20+20 cellular/Wi-Fi claim.
- Deployment succeeded: runtime `a47a611cf00ea574a617ca3f818b07111251a4d7`, saved version `appgprj_6ac49343ea048191b93c8d1135390e39~appgver_d08b9afa6c20819194b0b44dd3008b99`, deployment `appgdep_6ad4f3e1e0a081918a6f6fd46bedb073`. Same owner-private Site and gate URL; no access changes. This exact runtime is the device-test candidate; later documentation commits do not change it.
- Deployed GET audit passed 39/39 URLs: HTTP 200, complete byte counts and SHA-256 match packaged output, including the new hashed gate launcher. Reports: `night-report/rc15-gate1-deployed-assets.json` and `night-report/rc15-gate1-release.json`.
- Next: run the same public gate on the iPhone; review the two horizon images, then complete same-revision startup 20+20. Only matching acceptance authorizes `scene-baseline-rc15-stormcells` and the Features handoff. Do not tag now.
- Rules: never write GitHub main; private Sites main approved. Never expose secrets. Preserve immutable tags, existing UI and accepted surf truth. No further scene work. Keep HANDOFF current and mirror it to GitHub WIP.

## Archived RC15 deployment and provenance

# DayBuoy handoff — RC15 storm-cell candidate

Updated 2026-10-16 UTC. Read HANDOFF.md and continue. Read AGENTS.md and INTERACTION-CONTRACT.md first.

## Current revision and source

- Candidate revision `2026-10-16-stormcells-rc15`, based on accepted launch tag `scene-baseline-rc14c-startup`, exact runtime `c6d8241f1a2f248e62b3ad3c15ffc1203df65473`. Starting documentation checkpoint `1b12e5a89b5806d9ac6b9bc76e90df75857860ff`.
- Scope: public `stormCells` conditions plus localized existing volumetric clouds; no new render passes. Existing UI, water/waves/surf truth, sky atmosphere, sand, camera and startup recovery remain frozen outside this explicit cell extension.
- Deployed candidate runtime `09158aad40c9c09cd51be439bf20110a75c2bd13`, private Sites version 58, saved version `appgprj_6ac49343ea048191b93c8d1135390e39~appgver_2fb1a7cbbca0819195d8bd36d61dc536`, deployment `appgdep_6ad282531ef88191b5a7c75597672105` (succeeded). Follow-up documentation checkpoints do not change this tested source pointer. No RC15 device pass claimed; do not create `scene-baseline-rc15-stormcells` until fresh matching device acceptance.
- Canonical private Sites project `appgprj_6ac49343ea048191b93c8d1135390e39`. Private source main is approved; preserve audience. GitHub continuation `wip/tidewater-verdict-first`; never GitHub main. Features must continue using accepted launch tag until this candidate passes.
- Capture tools remain `2026-10-15-blob-recovery-rc12c`. Keep all original 36 stills, 37 color audits, five wave-truth cases, saved evidence and Share intact.
- Gate route after deployment: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-16-stormcells-rc15
- Startup route after deployment: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/startup-check.html?v=2026-10-16-stormcells-rc15

## What passed

- Prior accepted launch startup: user-reported iPhone Safari 20/20 Wi-Fi and 20/20 cellular, zero leaked tracked GPU resources across 41 sessions, first-frame median 4.0–4.4 s. These results certify the prior tag only.
- Prior RC14c scene: 39.3428 average FPS, minimum 30, zero seconds below 30, 36/36 stills, wave truth 5/5; water 14.0901→14.0346 ms. Raw sunset scrub 2/90 retained as accepted, not rewritten.
- Full `node scripts/build.mjs` passes, including all seven interaction checks, surf-truth simulation, original capture/recovery/Share tests, 36 settled-still command sequences, startup/cache/lifetime checks and exact source preservation. The shipped minified production host passes API and forecast-forwarding tests.
- Candidate and exact launch control compile 80 WGSL modules and 84 pipelines at default limits. Maximum resources per stage: 12 uniform buffers, 8 storage buffers, 9 samplers, 16 sampled textures. Identical pass inventory, cloud atlas size, 18+3 samples and 256-pixel work quota. Four-cell cloud warm-up, finite initial clock, independent motion, still freeze and clearing tests pass. Local tests are not a real-browser/device/visual pass.
- The gate exercises four cells during the 120-second window, compares actual GPU frame spans to exact `c6d8241` for +1.0 ms and <=10% drift, retains the RC11 readiness probe, and adds two supplemental 1/4-cell squall images after the original 36. Release acceptance remains pending until same-revision 20+20 startup and visual review exist.
- Private hosting packaging passes byte-for-byte checks. Deployed GET audit passes all 39 URLs: HTTP 200 after same-origin redirects, complete body lengths and SHA-256 match local output, including candidate/control renderers, textures, workers, service worker and hashed gate/startup launchers. `night-report/rc15-deployed-assets.json` records every URL/status/byte count; `night-report/rc15-release.json` records source and validation provenance.

## Open issues

- Fresh iPhone 120-second FPS, per-pass GPU budget, wave truth and 20 Wi-Fi + 20 cellular startup are pending. Host has no iPhone/cellular connection or native WebGPU rendering hardware. No GPU runner.
- Actual storm-cell visual comparison with the accepted squall reference remains pending rendered device captures. Do not claim photorealism or <=+1.0 ms from CPU/null-backend tests.
- Cell updates use the existing 20-second coherent cloud-atlas refresh and crossfade. While explicit cells exist, bulk atlas wind reprojection is held so independently moving cells are not advected in one incorrect shared direction. No-cell behavior remains exact.

## Next steps

1. Run the deployed phone gate with four active cells and exact accepted startup control, then startup 20+20; preserve all original criteria and uploaded evidence. Actual iPhone FPS/GPU/cellular results cannot be produced by this host.
2. On matching acceptance, tag deployed source `09158aad40c9c09cd51be439bf20110a75c2bd13` as `scene-baseline-rc15-stormcells`, update the Features pointer, then re-freeze. Keep accepted launch tag `scene-baseline-rc14c-startup` unchanged until then.
3. No further scene edits pending those results. API specification: `STORM-CELLS-API.md`. Public `setConditions({stormCells})` supports up to four valid cells; bearings are clockwise true north, motion is toward, width is full diameter, and `[]` clears. Motion uses the existing 20-second coherent cache refresh rather than additional per-frame shading work.

## Rules and invariants

- Never commit/push GitHub main. No tokens or secrets in source/logs. Private Sites main approved. Do not modify the Features site's UI/data/hosting identity.
- All accepted tags immutable. No new render passes or raised limits; DPR floor 1.1 and 4x256 FFT stay exact. Total measured GPU <= launch baseline +1.0 ms, existing >=36 FPS average / >=30 each second and <=10% late drift remain required.
- No unsolicited scene work, advice wording or crowd reporting. Estimates labelled est. with source; retain Tidewater/Takram MIT credits. Update HANDOFF every pass and mirror to GitHub WIP.

## Archived handoff — accepted launch before RC15 exception

# DayBuoy handoff — accepted launch scene, frozen

Updated 2026-10-15 UTC. Read HANDOFF.md and continue. Read AGENTS.md and INTERACTION-CONTRACT.md first.

## Current revision and source

- **Launch scene: `scene-baseline-rc14c-startup`**, exact accepted runtime **`c6d8241f1a2f248e62b3ad3c15ffc1203df65473`** in the canonical private Sites source repository. Revision `2026-10-17-perf-rc14c-startup2`.
- RC14c and the accepted startup repairs are already integrated: the launch commit descends from `scene-baseline-rc14c` (`ed8981803abe0d98a97dd7940499699c86a91352`). Keep the original tag immutable; no renderer merge or rebuild is necessary.
- User accepted startup on October 15: 20/20 Wi-Fi, 20/20 cellular, zero leaked tracked GPU resources across 41 sessions, median first frame 4.0–4.4 seconds. These are user-reported iPhone results, not host measurements.
- The accepted runtime remains deployed: saved version `appgprj_6ac49343ea048191b93c8d1135390e39~appgver_d7181a6649a881919de226a344fa8c3a`, deployment `appgdep_6ad104aacce881919e0bc72d20f99efc`. This acceptance pass updates tags and documentation only; do not replace the tested deployment.
- Canonical Sites project `appgprj_6ac49343ea048191b93c8d1135390e39`; approved private source main. GitHub continuation: `jcarroll44/ocean`, `wip/tidewater-verdict-first`. The canonical launch tag is in the private Sites repo, not a GitHub tag. Capture tools remain `2026-10-15-blob-recovery-rc12c`.
- Existing gate: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-17-perf-rc14c-startup2
- Startup check: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/startup-check.html?v=2026-10-17-perf-rc14c-startup2

## What passed

- iPhone Safari startup accepted by Jacob: Wi-Fi 20/20; cellular 20/20; zero leaked tracked GPU resources across 41 sessions; first-frame median 4.0–4.4 s. Preserve this range; do not rewrite it as every network <=4.0 s. Driver-resident memory is not measured by the tracked resource census.
- RC14c scene acceptance remains: 39.3428 average FPS, 30 minimum, zero seconds below 30, 36/36 captures, wave truth 5/5, water 14.0901→14.0346 ms. Raw sunset scrub 2/90 failures remains accepted, not relabelled.
- The exact startup runtime previously passed full integration/production/hosting validation, all seven interaction checks, default-limit validation of 84 pipelines, 36 command captures, async pipeline recovery tests and controlled/Dawn-null 20-cycle ownership checks. Archive 883 files and deployed 36-URL body audit matched. Local tests are not a real-browser/device/visual pass.
- New launch tag is checked against the original RC14c ancestry, published to the canonical source, and fetched into a fresh empty receiving repository before handoff. Runtime files and deployment are unchanged.

## Open issues

- No further scene or startup work is authorized. Wait for Jacob's next task.
- Keep historical deferred visual items and raw audit results below; their presence is not permission to resume them.
- Optional-effect fallback remains explicitly degraded; deterministic shader errors remain nonretryable. Do not weaken either gate or resource accounting.

## Next steps

1. **Features lane:** read `SCENE-LAUNCH.md`, open the canonical project through Sites, obtain its current source credential through the supported tool, and fetch `refs/tags/scene-baseline-rc14c-startup` into your checkout. Verify the peeled commit is `c6d8241f1a2f248e62b3ad3c15ffc1203df65473`. No token belongs in shell arguments, source, logs or Git remotes.
2. Use the exact tagged scene/startup implementation when integrating Features. Preserve that lane's UI, features, hosting project identity and data work. Do not wholesale reset its checkout or deploy this scene repo over the Features site. GitHub HANDOFF mirrors this source pointer; do not assume GitHub WIP HEAD is the launch renderer.
3. Existing 120-second performance gate, 36 captures, wave truth, saved evidence and Share results remain the acceptance check for future changed builds. This tag/documentation-only pass needs no new full gate.
4. Stand by. No scene, wave, sky, shader, lighting, camera or startup changes without a new explicit request.

## Rules and invariants

- Never commit/push GitHub main. Private Sites main is approved. Never print or commit credentials.
- Keep `scene-baseline-rc14c-startup` and all earlier accepted tags immutable. Frozen surf truth, accepted RC14c look, DPR floor 1.1, 4x256 FFT and default WebGPU limits remain intact.
- No GPU runner, no unsolicited scene work, no advice wording or crowd reporting. Estimates labelled est. with source; retain Tidewater and Takram MIT credits. Update HANDOFF every pass and mirror to GitHub WIP.

## Archived handoff — before startup acceptance

# DayBuoy handoff — RC14c frozen; startup2 GPU recovery

Updated2026-10-15UTC. Read HANDOFF.md and continue. Read AGENTS.md and INTERACTION-CONTRACT.md first.

## Current revision and source

- Candidate revision `2026-10-17-perf-rc14c-startup2`; DEPLOYED; full integration, production and hosting validation PASS. Starting source `8e71d883d288ab9bae78c06a4545e406ceb8f89c`.
- Deployed runtime source `c6d8241f1a2f248e62b3ad3c15ffc1203df65473`. Saved version `appgprj_6ac49343ea048191b93c8d1135390e39~appgver_d7181a6649a881919de226a344fa8c3a`; deployment `appgdep_6ad104aacce881919e0bc72d20f99efc` succeeded2026-10-15T16:52:11.707385Z. This subsequent checkpoint changes documentation/evidence only.
- Frozen launch scene: canonical private Sites tag `scene-baseline-rc14c`, runtime `ed8981803abe0d98a97dd7940499699c86a91352`. No healthy scene/shader/physics/appearance changes authorized. This pass repairs startup only.
- Canonical private Sites project `appgprj_6ac49343ea048191b93c8d1135390e39`; its main is approved for deployment. Owner-private audience retained. GitHub WIP `wip/tidewater-verdict-first`, evidence `wip/tidewater-in-app`.
- Capture tools remain `2026-10-15-blob-recovery-rc12c`. Existing full120-second gate, captures and Share remain intact; no full gate required for this startup-only pass.
- Startup-check URL: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/startup-check.html?v=2026-10-17-perf-rc14c-startup2

## What passed

- Prior actualiPhone startup1: Wi-Fi19/20, median5146ms; cellular19/20, median5447ms. All38successful starts nondegraded. Sixteen successes first recovered fromGPUinitialization errors: fifteen device-destroyed, one shader-module creation. Two failed rows are interrupted/reloaded checkpoints at shader-compile-start, not a measured shader timeout. Source-provenance analysis and failed raw reports are in `night-report/startup2-before-*`.
- Prior launch acceptance:39.3428avg,30minimum,zero under30,36/36captures,surftruth5/5,water14.0901→14.0346ms. Raw sunset scrub2/90 retained; do not rewrite acceptance measurements.
- Startup2 full integration build PASS, including all seven interaction checks, strict default-limit validation of84pipelines and36capture command sequences. Async timeout/retry/latecompletion/mandatoryinitialization tests PASS. Controlled20cycle ownership test and actualDawnnull20device lifecycle test PASS: zero trackeddevices/buffers/textures/querysets/estimatedbytes after each teardown; zero validationerrors. Browserdriver memory remains unavailable. Local tests are not a real-browser/device/visual pass.

## Open issues

- No actual iPhone rerun on either network yet. Do not report20/20 Wi-Fi/cellular or<=4s phone median from hosttransport/mocks/Dawnnull. The host has no supported physicaliPhone or WebGPU hardware access.
- The uploaded reports did not contain GPUresource counts or a specific failing pipeline. Leak is suspected, not proven. Newly instrumented ownership/teardown must distinguish zero live tracked resources from unavailable driver memory.
- Timeout fallback must remain explicitly degraded. Requiredpipeline fallback cannot count as native first-frame success; deterministic shader errors are not retryable.

## Next steps

1. Implemented async-only pipelines (4.5s perattempt, one timeoutretry; deterministic errors not retried), owned partialstartup/disposal,15s rendererstage watchdog, individual15s assetrequest deadlines, and bounded resource/pipeline diagnostics. Healthy scene WGSL/physics/UI remain exact. Aggregateassets maytake longer while individualrequests arebounded and productive; stalledassetprogress is still watched. Requiredpipeline exhaustion activates existing simplifiedrenderer and cannotpass nativecheck. Optional spray/lip/rain or lightning-free sky recovery explicitly marks degradation.
2. Full integration, production, hosting and private deployment complete. Archive883 deployedfiles matched; deployed36URL HTTP/status/bytes/SHA audit PASS (`night-report/startup2-deployed-assets.json`). Pinned RC11/RC12c controls use the same bounded async/owned-lifetime CPU adapters, with exact inverse source checks. Preserve immutabletags.
3. Run actual20starts on each phone connection; savedJSON reports reliability, full-quality recovery, firstframe median, pipeline retries and post-disposal counts. Preserve results afterreload. Final user reply is startup-check URL only.

## Rules and invariants

- Never commit/push GitHub main. Private Sites main is approved. No secrets in logs/source.
- Preserve RC14c launch tag and accepted look; surftruth locked. DPRfloor1.1,4x256FFT,defaultWebGPUlimits. No GPU runner; no full gate for this pass.
- No advice wording or crowd reporting; estimates labelled est. with source; Tidewater/Takram MITcredits retained. Update HANDOFF everypass and mirror to GitHubWIP.

## Archived handoff — startup1 before shader/restart review

# DayBuoy handoff — RC14c accepted; startup-only repair

Updated 2026-10-15 UTC. Read HANDOFF.md and continue. Read AGENTS.md and INTERACTION-CONTRACT.md first.

## Current revision and source

- RC14c is the accepted, frozen launch scene. Canonical private Sites tag `scene-baseline-rc14c` points to runtime `ed8981803abe0d98a97dd7940499699c86a91352`; remote tag verified. Earlier tags remain immutable.
- Transport revision `2026-10-17-perf-rc14c-startup1`; normal scene unchanged. Capture tools remain `2026-10-15-blob-recovery-rc12c`.
- Canonical private Sites project `appgprj_6ac49343ea048191b93c8d1135390e39`; its main is the approved deploy channel. GitHub continuation `wip/tidewater-verdict-first`, evidence `wip/tidewater-in-app`. Separate Features site is out of scope.
- Startup-only check: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/startup-check.html?v=2026-10-17-perf-rc14c-startup1
- Existing gate stays intact: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-17-perf-rc14c-startup1
- Deployed runtime `f9bae851baebb1f8526ec28499d035283c4dcaf8`; version `appgprj_6ac49343ea048191b93c8d1135390e39~appgver_2e0bebc6ac888191b583ce50bd2a35b1`; deployment `appgdep_6ad081da50e08191a7bdd2d75b280617` succeeded `2026-10-15T07:33:59.265814Z`. Initial checkpoint `8a34458e3e1addf717ef3b2cd9d23df2b515f967` had a packaging mismatch caught by post-deploy audit; do not treat it as the final verified package.

## What passed

- Actual accepted phone upload: run `2026-10-15T07-06-09Z-bbd65c76-318e-4c82-8948-262175958bfc`, revision `2026-10-17-perf-rc14c`;39.3428 FPS average,30 minimum,zero seconds below30,36/36 stills,truth5/5. Water first20→last20 medians14.0901→14.0346ms, frame-span drift+6.4128%. Raw sunset scrub retains2/90 failures. User explicitly accepted launch scene; do not reopen visual work. Provenance in `night-report/rc14c-accepted-provenance.json`.
- Final startup patch full local integration/production/default-limit validation PASS:80 WGSL modules,84 complete pipelines,36 null-backend capture command sequences; all seven interaction checks; candidate/control optional fallback;20-run journal semantics;25-file production allowlist; every original hosting asset byte-identical. These are not phone results. Final archive823 verified files,zero missing/mismatched; deployed36URL/status/byte/SHA audit PASS. Actual WebKit fourth-request recovery11/11assets PASS and preloaded shape handoff2,097,152bytes/exactSHA/zero further cache or network reads PASS. Native GPU unavailable on host. Actual deployed host-WebKit transport matrix20/20 PASS:10 ordinary and10 simulated256KiB/s+300ms delivery; every fresh context confirmed empty cache, HTTP reload,11/11 verified assets,zero skips and exact texture handoff. Delayed median32.71s (30.61–33.79s). Actual deployed startup UI guard, saved-result reload and Share→JSON download PASS. Host has no WebGPU, so these are NOT iPhone/native-first-frame results. Harness DNS/307 setup failures are preserved separately and excluded because no app startup executed.
- Real host Playwright WebKit transport recovered after three injected request failures on the fourth attempt. Host WebKit has no WebGPU; no native first-frame claim. New final deployment will be checked separately.

## Diagnosis and changes

- Original iPhone trace had completed cloud detail but stalled reading cloud shape after preload. Verify full cached bodies, hold bounded verified cloud/SMAA bytes until consumed, retry initial+3 with1.5/3/4.5s backoff, log actual URL/status/bytes. Cache operations have3s deadlines; cache denial cannot block network.
- All optional assets share a45s deadline. Exhausted optional cloud/SMAA/font assets are logged and skipped, never retried by consumers a second time. Required active renderer/worker stay mandatory. Inactive controls are excluded until selected. Optional cloud failure disables only cloud cache; no shader or normal-path appearance changes.
- Packaging audit found fresh manifest with old renderer/HTML in hosting/public. Build now snapshots every source asset, stages explicit fresh writes and verifies all original SHA-256 values through public/framework/final trees. Final archive and deployed bytes must match.
- Separate startup-only page runs20 attempts per manually labelled network, stores every completed result, resumes after reload, requests HTTP reload and clears only current native asset cache. It never runs FPS/captures and does not overwrite latest full-gate results.

- Actual warm WebKit CacheStorage PASS:11/11 full bodies read and SHA-verified,4,428,086bytes,15ms,zero network calls/requests andzero skips. Verified shape handoff also passes after this warm preload. `night-report/rc14c-startup-final-webkit-warm-cache.json`.

## Open issues

- iPhone Safari cold start20/20 on Wi-Fi and20/20 cellular is not yet measured. This host cannot operate the user's iPhone or cellular connection. Report host transport results separately and leave device counts unmeasured until actual reports arrive.
- Playwright WebKit on this Linux host has no WebGPU adapter. Actual deployed transport is tested; native first frame cannot be certified here.
- Optional-asset degraded startup must be visible in diagnostic results; it is not a successful full-visual capture/performance pass. Required asset or GPU failure must remain failed.

## Next steps

1. Implementation, full local build, default-limit validation, archive verification, private deployment,36-URL deployed body audit and20/20 host-WebKit transport tests are complete. No full device gate required by the latest instruction.
2. Actual phone validation is outstanding: open the startup-only page once on Wi-Fi and once on cellular. It runs20 starts per selected network, reports full/degraded startup separately, saves and uploads each result, and supports reload/resume/Share. Do not claim a phone20/20 result until those real reports exist.
3. Preserve launch scene tag, locked surf truth and existing gate/Share/capture mechanisms. Future changes follow the existing gate unless explicitly superseded.

## Rules and invariants

- Never commit/push GitHub main. Private Sites main is approved. No secrets in logs/source. Local tests are not a real-browser/device/visual pass.
- Freeze RC14c visuals and RC12c surf. DPR floor1.1,4x256 FFT, default WebGPU limits. No GPU runner. Normal render budgets/settings unchanged.
- No advice wording or crowd reporting; estimates labelled est. with sources; retain Tidewater/Takram MIT credits. Update this root HANDOFF at every pass and mirror it to GitHub WIP.

## Archived handoff — before startup failure report

# DayBuoy handoff — RC14c deployed; iPhone gate pending

Updated2026-10-15UTC. Read HANDOFF.md and continue. Read AGENTS.md and INTERACTION-CONTRACT.md first.

## Current revision and source

- Deployed candidate `2026-10-17-perf-rc14c`; full local integration, production and hosting validation pass. Phone acceptance remains pending.
- Deployed runtime source `ed8981803abe0d98a97dd7940499699c86a91352`. This following checkpoint is documentation only.
- Saved version `appgprj_6ac49343ea048191b93c8d1135390e39~appgver_f4f6ba6fe0cc819191fefca42433fe1f`.
- Deployment `appgdep_6ad071a6a0b48191af940e2b1970309f` succeeded at `2026-10-15T06:24:55.452666+00:00`.
- Changed-text credential scan:86files,zero matches; git diff --check PASS.
- Starting source: accepted RC14b appearance at runtime `5d8e5718205d6530f0ade9d6b2667079d881fc98`, prior doc checkpoint `19882d7cb53a1395ca9ec451a287d7c16d8f297f`.
- RC14b appearance ACCEPTED: clouds, sunset scrub0/89 failures, wave truth5/5. Palette, forms, lighting and UI/camera remain frozen. RC14b performance and four still audits failed.
- Canonical private Sites project `appgprj_6ac49343ea048191b93c8d1135390e39`; its main is the approved deployment channel. Preserve owner-private audience. Separate Features project is out of scope.
- Capture tools `2026-10-15-blob-recovery-rc12c`; preserve120s gate,36originalstills,37colorchecks,five wave clips and Share. RC14c explicitly changes phase original encoding toPNG and adds durable camera night-skip only.
- Deployed gate: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-17-perf-rc14c
- Immutable baseline tags: scene-baseline-rc11,scene-baseline-rc12c,scene-baseline-rc13. The launch tag `scene-baseline-rc14c` is pending fresh matching phone acceptance; do not move old tags.
- GitHub continuation `wip/tidewater-verdict-first`; evidence `wip/tidewater-in-app`. Never commit/push GitHub main.

## What passed

- Full `scripts/build.mjs` PASS, including all seven interaction checks, surf truth math, strict appearance/scope checks, capture/recovery/Share, default-limit startup and original36capture command sequences (22Inlet,7Cocoa,7SanDiego).
- Candidate80WGSL modules/84full pipelines PASS at default limits:12uniform,8storage,9samplers,16sampledtextures. No raised limits. ExactRC11 andRC12c control shaders/startups also pass.
- FFT cadence numerical checks over120s and jittered long-run preserve absolute wave time and all foam elapsed time. At39FPS normal transforms decrease4680→2340; at43FPS2580 and60FPS3600 remain exact. Snapshot/restoration updates bypass reuse. These are scheduling counts, not measured GPU savings.
- Exact opaque-foam zero-weight work and dead-spray degenerate-vertex checks PASS; accepted optical expressions, derivatives, debug/velocity/mask paths and all visual budgets remain intact. Production/gate share the same adapters.
- Original failing JPEGs verified4:2:0. Actual quantization tables introduce32forbidden pixels into65536numerical passing pixels; PNG preserves bytes exactly withzero. Raw/decoded audits retain all thresholds; oldJPEG/newPNG mixed resume and wrong-MIME failure tests PASS. This does not establish the four original raw canvases were clean.
- Camera night-skip before renderer/fetch, independent edge daylight check, durable JSON-only completion/reload/Share and daylight redirect/pair recovery PASS. Existing solar algorithm matches5856date/location cases.
- Hosting Worker/source-destination byte equality/static index PASS.
- Production minified startup/live forecast/camera and25-file allowlist PASS;11verified startup assets,3,118,108bytes. Local tests are not a real-browser/device/visual pass. No RC14c phone throughput or rendered0-failure claim.
- Null-backend readback staging is explicitly initialized in the host exporter only; two repeated strict startup runs pass without relaxing `truth.pass=false` or zero-height assertions. No runtime truth-probe changes.

## Open issues

- Actual RC14b upload:38.5766avg,23minimum,5under30,36stills. Actual post-candidate control is exactRC12c37.4022avg,28min,oneunder30, notRC11. Read original evidence/provenance in `night-report/rc14c-before-*`.
- No specific60sjob or unbounded-resource cause was established. Normal20scloud bake overlaps the hitch but costs0.105–0.254ms; CPU~2ms; severalGPU passes slow. FFT reuse discontinuity below40FPS is a proven workload amplifier and is fixed. Do not claim it proves the initial trigger or device temperature.
- Actual RC14b water first20→last20 medians12.6121→15.8949ms;13.6234ms is embedded historicalRC11 reference. GPUspan20.9848→30.5638ms; output dimensions change. Never sum overlapping passes or claim matched-resolution+1ms from that report.
- Fresh phone must establish>=36avg, every second>=30,water<=14.3ms,total<=RC12c+1ms and<=10%late drift; all original audits/truth/captures remain required. Four raw still audits are not yet measured forRC14c.
- Camera exposure/view calibration remains unknown. At night persist “night — skipped”; no fabricated image or daylight comparison.

## Next steps

1. Integration, production, hosting and private deployment are complete. Receipts are above. Mirror this documentation-only checkpoint to GitHub WIP; do not redeploy unchanged runtime.
2. Run the matching RC14c iPhone gate. Inspect jobtimestamps, actualFFTcounts, resourcebyte deltas, first/last20GPU timing,36stills/37audits and truth5/5.
3. Only after matching acceptance, tag exact runtime as `scene-baseline-rc14c` launch scene. Preserve accepted appearance; no unrelated UI/features work.

## Rules and invariants

- Exact RC14b palette/cloud/lighting/camera/UI and core surf truth/geometry remain frozen. Only equivalent skipped work, amortizedFFT scheduling, diagnostic metadata, lossless phase evidence and daylight skip are authorized.
- DPRfloor1.1,4x256FFT and unchanged geometry/cloud/spray budgets; defaultWebGPU limits; no GPU runner.
- Resource census covers observed allocations and explicitdestroy after trace installation, not earlierresources,GC/device-loss retirement or driverresidency. No extraGPU fence/readback; bounded diagnostics.
- No media/network work during timing; preserve acknowledged evidence after reload. All original numeric thresholds,37colorchecks and Share retained.
- No secrets, advice wording or crowd reporting. Estimates labelled est. with source; Tidewater/Takram MIT credits. Update HANDOFF every pass.

## Archived handoff — RC14b before user review

# DayBuoy handoff — RC14b deployed; iPhone gate pending

Updated: 2026-10-15 UTC (October 14 America/Chicago). Read HANDOFF.md and continue. Read AGENTS.md and INTERACTION-CONTRACT.md first.

## Current revision and source

- Deployed candidate: `2026-10-17-polish-rc14b`; full local integration, production and hosting checks pass. Device acceptance is pending.
- Deployed source: `5d8e5718205d6530f0ade9d6b2667079d881fc98`. This following checkpoint is documentation only.
- Saved version: `appgprj_6ac49343ea048191b93c8d1135390e39~appgver_384a0fef6a7c81919e452baf1750cab0`.
- Deployment `appgdep_6ad0593664ac81919eee5244d7c197e6` succeeded at `2026-10-15T04:40:39.942008+00:00`.
- Starting source: RC14 runtime `d00123d3d23c1fd2ab40433d8f38b877398d6ceb`, prior doc checkpoint `67d9b04a49429c0d356599ff021b1f96ce4cd0d2`.
- RC14 is NOT accepted. User accepts wave truth5/5 and night/storm appearance only.
- Immutable tags remain scene-baseline-rc13 (performance only), scene-baseline-rc12c (surf truth), scene-baseline-rc11.
- Gate: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-17-polish-rc14b
- Canonical private Sites project `appgprj_6ac49343ea048191b93c8d1135390e39`; its main is the approved deployment channel. Keep owner-private audience. Features work uses a separate project/branch; do not modify it.
- GitHub continuation `wip/tidewater-verdict-first`; evidence `wip/tidewater-in-app`. Never commit/push GitHub main.
- Capture tools remain `2026-10-15-blob-recovery-rc12c`; preserve the same gate,36 original stills,37 color checks, five wave clips, camera comparison and Share results.

## What passed

- User reports RC14 wave truth5/5 and accepted night/storm; remaining performance/low-sun visual defects block full acceptance.
- Latest RC14 report recovered under `night-report/rc14b-before-report.json`:38.3535avg,29min,two seconds below30. Trace around58–60s shows increased water+transparent GPU time, fixed resolution, CPUmax2–3ms, no cloud bake or allocation/compile events. A60second background-job cause is NOT established.
- Camera fix follows redirects with no forwarded credentials; native HTTP301/302/303/307/308, loop/non-JPEG and existing recovery/Share tests pass. Actual SoWal JPEG fetch/validation succeeded locally; gate must still capture the real rendered side-by-side.
- Complete integration build and all seven interaction checks PASS. Candidate80WGSL/84full pipelines PASS at default limits:12uniform/8storage/9samplers/16textures;36startup/still command sequences PASS. Pinned RC11/RC12c controls compile/initialize. No vendor edits or capture/UI/physics scope drift.
- RC14b cloud continuity/source radiance checks pass with the actual pinned3D assets; accepted night/closed/thunder branch remains exact. Source/material/codec checks cover fused water correction, actual inline spray at sunrise/dusk, slope-sensitive sand fill, zero-weight SSR/rain/lip skips and night identities. Camera redirects/recovery and same-submission diagnostic-state checks pass.
- Production minified startup/live-forecast/camera checks and25-file allowlist PASS;11verified assets,3,116,626bytes. Hosting source/destination byte checks and static index PASS. Changed-text credential scan:74files,zero matches; git diff --check PASS.
- Implementation decisions and limits are recorded in `night-report/rc14b-report.md`; original phone evidence and three-run dip comparison remain under `night-report/rc14b-before-*` and `rc14b-hitch-*`.
- Local tests are not a real-browser/device/visual pass. RC14b phone FPS,37 rendered color checks and camera comparison remain unverified.

## Open issues

- Targeted implementation, full integration, production/hosting packaging and private deployment are complete. Preserve this candidate until fresh phone evidence is reviewed; no device pass is presumed.
- Water target<=14.3ms, total<=RC12c+1ms,>=36avg and>=30 every whole second. Preserve actual first20/last20 timing and measured drift; never claim a GPU pass from source tests.
- Camera exposure time/view calibration are unpublished. Preserve unretouched originals, timestamp uncertainty and conditions; a night/glare image cannot certify daytime color matching.
- RC15/unrelated UI/features are deferred.

## Next steps

1. Targeted fixes and mandatory integration/default-limit/startup/interaction checks are complete; runtime is frozen pending device evidence.
2. Private deployment is complete; receipt is above. Mirror this handoff to the GitHub WIP continuation branch. Never write GitHub main.
3. User runs the iPhone gate; inspect raw timing, all original audits/truth and real camera pair before acceptance.

## Rules and invariants

- Preserve RC14 core surf truth/offshore calibration, UI/camera, capture freeze/recovery/Share, numeric thresholds and Tidewater/Takram MIT credits.
- DPRfloor1.1,4x256FFT/reuse,48crest samples/1.2mstations/12lip vertices,16,384spray,256lightmap and default WebGPU limits. No GPU runner.
- No encoding/upload/capture during timed windows. Keep acknowledged results on reload. No fabricated timing or rendered checks.
- No secrets, advice wording or crowd reporting. Label estimates with source. Update HANDOFF every pass.

## Archived handoff — RC14 before device review

# DayBuoy handoff — RC14 deployed; iPhone gate pending

Updated: 2026-10-15 UTC (October 14 America/Chicago). Read HANDOFF.md and continue. Read AGENTS.md and INTERACTION-CONTRACT.md first.

## Current revision and source

- Deployed candidate: `2026-10-17-polish-rc14`; full integration, production and hosting packaging validation passed. Not device accepted yet.
- Deployed source: `d00123d3d23c1fd2ab40433d8f38b877398d6ceb`. This following handoff checkpoint is documentation only.
- Saved version: `appgprj_6ac49343ea048191b93c8d1135390e39~appgver_cfa3797126fc8191bc08eb26768c5aad`.
- Deployment `appgdep_6ad048b763cc81919e73f3f35a45d458` succeeded at `2026-10-15T03:30:14.458942+00:00`.
- Accepted performance baseline: canonical private Sites tag `scene-baseline-rc13` -> exact runtime `45dfa68f8998d9480d9ea9142a866d5093cc3f5c`. Annotated tag `e5ae28d3972a3ba7fcb69e1b5a8bdafb3c4aa344` pushed and remote target verified. This is performance acceptance, not visual acceptance.
- Surf-truth baseline remains immutable `scene-baseline-rc12c` -> `14b4c9657bc9155fac00491702a19794168c3575`; retain `scene-baseline-rc11` -> `4530d24a008cb45b4d72539ac2f07df1144adbd8`.
- Live gate: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-17-polish-rc14
- Private Sites project `appgprj_6ac49343ea048191b93c8d1135390e39`; its `main` is the approved deploy channel. Preserve owner-private audience.
- GitHub continuation `wip/tidewater-verdict-first`; uploaded evidence `wip/tidewater-in-app`. Never commit/push GitHub main.
- Core capture tools remain `2026-10-15-blob-recovery-rc12c`; RC14 adds a separate resumable beach-camera comparison after timed windows.

## What passed

- RC13 performance ACCEPTED by Jacob: Safari39.7avg,zero seconds under30,water14.0ms. Exact uploaded run `2026-10-15T02-51-41Z-a1a8929b-0e21-492a-8361-8ef705a0931e`, parent `2026-10-15T02-30-19Z-bf58fdcf-84e4-415d-976a-76199fac5f2d`, report blob `fa05009a5afda8d380f240bf4c852b273cc3892a`:39.73703avg,30minimum,zero below30,36stills.
- RC13 actual color failures are five stills plus the sunset clip (6/37 checks), not six stills. Failed stills: Inlet sunrise/sunset, Cocoa sunrise/sunset and Mission sunset; sunset clip25/70 frames. All reported sky samples pass; residual failures are in water. Original evidence is saved under `night-report/rc14-before-*`.
- Offshore actual whitecap coverage0.00431495 versus target0.00624921 is30.95% BELOW target; the gate reports absolute error. User requests almost no offshore whitecaps; preserve both the intent and raw signed measurement.
- RC14 all seven interaction checks and complete integration build PASS. Candidate80WGSL/84full pipelines pass strict default limits:12uniform/8storage/9samplers/16textures. All36initialization/still command sequences PASS. Exact RC11 and RC12c controls also compile/initialize.
- RC14 materials:500,000 source/filter/sharpen/bloom/ACES/8bit cases and131,072synthetic JPEG pixels pass with zero violations; old-path negative control reproduces20,076failures. Cloud actual-asset filtering/wind/freeze checks,12phase whitecap calibration/held-out/lifecycle tests, and camera source/retry/reload/Share checks PASS. This does not certify37device-rendered audits.
- Production minified startup/live forecast/camera checks and25-file allowlist PASS. Renderer/capture scope, default limits, FFT and budgets remain enforced. The one opt-in PostFX patch is SHA256-pinned separately; disabling all3options reconstructs exact original upstream bytes. Other213upstream files are unchanged.
- Hosting Worker package PASS, including all source/destination byte and static-index checks. Changed text credential-pattern scan returned zero matches. Implementation decisions and remaining comparison limits are in `night-report/rc14-report.md`.
- Local tests are not a real-browser/device/visual pass. No RC14 phone FPS, rendered pixel pass or camera match is claimed yet.

## Open issues

- RC14 visual and phone performance acceptance remain pending. Run the unchanged120s/36stills/37colorchecks/5wave truth and clips, plus the additional real-camera pair.
- A real camera match must retain its original frame, source, fetch/frame-time uncertainty, weather/marine values and view limitations. Do not substitute a fixture or call an old image live. A nighttime/obscured camera cannot validate daytime material color.
- Keep total GPU<=RC12c+1.0ms; report actual first20/last20 span drift and preserve established<=10% drift grading. Sequential controls are not constant-temperature evidence; unequal dimensions remain explicitly unmeasured.
- RC13 raw span23.485->28.629ms is+21.90% drift, distinct from user performance acceptance; candidate fixed429x768, control changed size, overall+1ms comparison unmeasured. Preserve the uploaded raw grades; do not relabel them zero drift.
- RC15 light and unrelated scene/UI work remain deferred. Signing, WeatherKit/RevenueCat activation and TestFlight require owner/Mac steps.

## Next steps

1. Implementation and focused cloud/material/whitecap/camera checks are complete; do not expand scope or change locked surf.
2. Full integration, production, hosting checks and private deployment are complete; receipt is above. Mirror this handoff to GitHub WIP. Do not change this deployed candidate before reading its phone evidence.
3. User runs phone gate. Inspect all original audits/truth/actual GPU comparisons and the new camera pair before visual acceptance or further tuning. No phone result is presumed from local tests.

## Rules and invariants

- Core surf height/period/sets/refraction/breaker/tide/geometry stay locked to RC12c. Only explicit offshore wind-cap target/calibration is allowed to change, with independent unchanged ±20% truth validation.
- Preserve UI, camera, original36stills and37colorchecks, capture freeze/settle/recovery/Share, numeric thresholds, source labels and Tidewater/Takram MIT credits.
- Keep DPRfloor1.1,4x256FFT/reuse,48crest samples/1.2mstations/12lip vertices,16,384spray,256lightmap,512x128cloudatlas18primary/3shadow steps/256pixels perframe/20srefresh and default WebGPU limits. No GPU runner.
- Gate:5sexactRC11 readiness,120scandidate saved before30sexactRC12c control, then captures/truth/clips/camera/Share. No media/network/encoding during timed windows. Preserve acknowledged evidence on reload.
- No secrets, advice wording or crowd reporting. Label estimates and source uncertainty. Update this file every pass.

## Archived handoff — RC13 deployment before acceptance

# DayBuoy handoff — RC13 deployed; iPhone gate pending

Updated: 2026-10-15 UTC. Read HANDOFF.md and continue. Read AGENTS.md and INTERACTION-CONTRACT.md first.

## Current revision and source

- Deployed candidate: `2026-10-16-clouds-rc13`; complete local integration, production and hosting packaging validation passed. No device acceptance yet.
- Deployed source: `45dfa68f8998d9480d9ea9142a866d5093cc3f5c`. This following handoff checkpoint is documentation only.
- Saved version: `appgprj_6ac49343ea048191b93c8d1135390e39~appgver_afcbbef8ba9881919f73e7f941573809`.
- Deployment `appgdep_6ad02bd05acc81918649f788d5d3485e` succeeded at `2026-10-15T01:26:57.709828+00:00`.
- Accepted surf-truth baseline: immutable canonical private Sites tag `scene-baseline-rc12c` -> exact runtime `14b4c9657bc9155fac00491702a19794168c3575`. Annotated tag object `2ae2ddb6d10f569aef66fe2d77945d6507e43028`; pushed and remote target verified.
- Retain prior immutable `scene-baseline-rc11` -> `4530d24a008cb45b4d72539ac2f07df1144adbd8`.
- Live gate: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-16-clouds-rc13
- Private Sites project `appgprj_6ac49343ea048191b93c8d1135390e39`; its `main` is the approved deploy channel. Preserve owner-private audience.
- GitHub continuation `wip/tidewater-verdict-first`; uploaded evidence `wip/tidewater-in-app`. Never commit/push GitHub main.
- Capture tools: `2026-10-15-blob-recovery-rc12c`. Still/clip/settle/resume/Share implementations remain byte-identical; gate comparison now uses exact RC12c and requires the existing37 color checks.

## What passed

- RC12c explicitly ACCEPTED by Jacob:39.0avg, water14.0ms vsRC11 13.9ms, reported zero late drift, wave truth5/5 within1.3%. Surf behavior is locked. Accepted upload `results/2026-10-14T21-02-04Z-6c7e39e3-584f-4366-a2af-0cfa5cd20a6f/report.json`, parent `2026-10-14T20-40-31Z-ba046301-3678-46f8-887f-e78bb2b34217`, confirms38.95595avg/29min/one second under30 and36stills. User accepts that29fps second as thermal with RC11 control26.59645; do not rewrite raw cadence or relax future criteria.
- RC12c evidence inspected:10weather and5wave images pass existing pixel audit; nine solar-phase images plus sunset clip fail. Sunset87/96frames fail,15,267lime and208magenta sampled pixels. Before images/clip and extracted evidence are under `night-report/rc13-before-*` and `rc13-rc12c-baseline-evidence.json`.
- Complete integration build and all seven interaction checks PASS. Exact RC12c surf/capture/UI/camera/budget freeze PASS. Current cloud morphology, live/paused wind and actual still-clock freeze PASS; 20,480 water material/ACES colour cases and 2,625 cloud/sky composite cases PASS. 96,000 surf samples and 669,330 optical comparisons remain unchanged.
- Candidate 80 WGSL modules / 84 complete pipelines PASS at default limits (max 12 uniform / 8 storage / 9 samplers / 16 sampled textures). All 36 initialization/still command paths PASS. Immutable RC11 readiness and RC12c budget controls also pass strict pipeline/startup checks. 54 timing-summary cases, actual gate orchestration including three failed/missing-colour cases, all recovery/Share/startup-cache checks PASS.
- Production minified startup/forecast/camera checks and 25-file allowlist PASS. Hosting packages all assets through a fresh staging tree, verifies every path and byte before and after atomic replacement, and retains the existing static-asset index checks; final hosting build PASS.
- Added clouds/clarity/colour details and decisions: `night-report/rc13-report.md`. One complete composite atlas follows its optically dominant wind between bakes; all layers use individual winds during the 20-second full bake. This bounded-cost approximation is recorded in cloud evidence.
- Local tests are not a real-browser/device/visual pass. No RC13 rendered pixels, iPhone throughput or acceptance claimed.

## Open issues

- RC13 must be checked on the phone:>=36avg,>=30 every whole second of120s,36/36stills, wave truth5/5 within20%, five6sclips and37 passing pixel checks (36stills plus sunset clip). Color tests on material math are not rendered audit results.
- Accepted RC12c raw GPU frame-span medians are22.8218->26.4413ms(+15.86%) across changing adaptive sizes; saved drift grade is fail and overall+1ms comparison unmeasured. This differs from the user's zero-drift interpretation. Preserve raw evidence and record acceptance as explicit user judgment, not a zero-drift instrument reading. Sequential control is not constant-temperature evidence.
- RC13 total GPU target<=RC12c+1.0ms; keep established<=10% first20/last20 drift grading and record actual value. Changed/unmatched sizes stay unmeasured with exact-resolution cohorts. Never sum overlapping pass durations.
- RC14 seams/swash and RC15 light remain deferred. Signing, WeatherKit/RevenueCat activation and TestFlight still require owner/Mac steps.

## Next steps

1. Implementation and complete mandatory integration checks are finished. Do not change locked surf.
2. Production/hosting packaging and private deployment are complete; receipt is above. The phone is the hardware/visual test. No host GPU runner was used.
3. User runs phone gate. Inspect fresh GPU comparisons, all raw still/clip audits and cloud/surf visual continuity before acceptance. Preserve this deployed source until that evidence is reviewed. Mirror this handoff to GitHub WIP.

## Rules and invariants

- RC13 only: cloud morphology/wind, removal of blur, water hue and night/dusk exposure/no sunrise magenta. Surf physics/geometry/FFT/truth, UI/camera and capture tooling are frozen to RC12c.
- Keep DPR floor1.1,4x256 FFT and unchanged reuse,48crest samples/1.2m stations/12lip vertices,16,384spray,256lightmap and default WebGPU limits. Existing cloud atlas512x128,18primary/3shadowsteps,256baked pixels/frame,20srefresh; no added full-screen march.
- Gate:5s exactRC11 readiness (below36 stops),120s candidate saved before30s exactRC12c control, then captures/truth/clips/Share. Dispose old renderer/device between phases. No capture/upload/encoding inside timed windows. Preserve acknowledged evidence after reload.
- No secrets, advice wording or crowd reporting. Keep estimates/source attribution and Tidewater/Takram MIT credits. Update root HANDOFF.md every pass.

## Archived handoff — RC12c deployment before acceptance

# DayBuoy handoff — RC12c deployed; iPhone test pending

Updated: 2026-10-14 UTC. Read HANDOFF.md and continue. Read AGENTS.md and INTERACTION-CONTRACT.md first.

## Current revision and source

- Deployed candidate: `2026-10-15-surf-truth-rc12c`. Local validation complete; the iPhone is the hardware test. No device acceptance yet.
- Deployed source: `14b4c9657bc9155fac00491702a19794168c3575`. This follow-up handoff checkpoint is documentation only.
- Saved version: `appgprj_6ac49343ea048191b93c8d1135390e39~appgver_0947de4dce7081919decf5080d9c8da8`.
- Deployment `appgdep_6acfe616196c8191bfa622a6fb0c016b` succeeded at `2026-10-14T20:29:40.025169+00:00`.
- Live gate: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-15-surf-truth-rc12c
- Immutable accepted renderer: `scene-baseline-rc11` / `4530d24a008cb45b4d72539ac2f07df1144adbd8`.
- Private Sites project `appgprj_6ac49343ea048191b93c8d1135390e39`; its `main` is the approved deploy channel. Preserve owner-private audience.
- GitHub continuation `wip/tidewater-verdict-first`; uploaded evidence `wip/tidewater-in-app`. Never commit/push GitHub main.
- Capture tools: `2026-10-15-blob-recovery-rc12c`.

## What passed

- RC11 remains the accepted baseline: 40.6236 average /34 minimum /zero seconds below30;36/36 stills. No later build inherits that acceptance.
- RC12c focused media tests reproduce the cross-realm ArrayBuffer defect: genuine bytes returned from the scene iframe failed parent `instanceof`, leaving a wrapper object for FormData. Native-brand detection reconstructs a genuine Blob. Null/empty/malformed capture output and corrupt restored queue parts are rejected/logged individually; valid bytes/receipts remain intact. Recorder errors retry only their capture and later captures continue.
- Cached optical cross-section numerical checks:96,000 existing wave samples and669,330 optical comparisons pass; maximum X0.2586%/Y1.2544% of face height. Geometry/truth remains analytic; up to44 repeated sin/cos/pow/exp operations in the eligible water fragment are replaced by cached bases. Static table adds524,288 bytes to the existing field, zero new bindings/passes or per-frame bake. Actual GPU improvement awaits phone evidence.
- Isolated RC11 control is built from249 pinned source files, with only current timing instrumentation plus worker routing/provenance. Baseline78 WGSL modules /82 full pipelines and22 Inlet startup capture commands pass at default limits.
-53 GPU-summary/comparison tests pass:5/30/120-second windows, first20/last20/full medians, sample counts/overlap, exact-resolution cohorts, true GPU span and +1ms water/total comparisons. Missing data cannot become a pass.
- Gate orchestration tests pass:5s precheck blocks before candidate if average<36;120s candidate is saved before30s control; control failure continues captures and stays resumable; null clips do not stop36 stills/remaining clips; acknowledged FPS is never rerun.
- Complete integration build and all seven interaction checks PASS. Candidate80 WGSL modules /84 full pipelines PASS at default limits (12 uniform/8 storage/9 samplers/16 sampled textures); all36 strict startup/still command paths PASS. Production minified startup/forecast forwarding and25-file allowlist PASS. Private native bundles preload13 verified assets including the pinned control; public assets omit it. No real-device result is claimed.
- Local tests are not a real-browser/device/visual pass. No RC12c iPhone FPS, rendered pixels, thermal reading or new device acceptance is claimed.

## Open issues

- Latest RC12b upload measured6.1239 average /2 minimum /120 seconds below30. Timed water40.726→125.036ms; true GPU span78.329→234.571ms (+199.469%). User reports thermal throttling; no temperature sensor exists. The16.1ms water sample is during warmup at585×988, not a controlled same-resolution cool-clock median. See `night-report/rc12c-device-analysis.md`.
- Uploaded partial RC12b report contains neither the reported FormData exception nor the9s renderer interruption. The byte-boundary bug is independently reproduced. Duplicate boot/global error listeners were removed because they could bypass native optional-effect isolation; exact causation of that device interruption remains unverified. Parent failures now retain nonempty reasons/stage/code/attempt.
- RC12c hardware budget/visual acceptance awaits the phone. Preserve >=36 average and>=30 in EVERY whole second of120 seconds,36/36 stills, +/-20% simulation truth and five continuous clips. Never claim FPS from numerical/WGSL/null-backend tests.
- Sequential RC11 control runs after candidate with a fresh GPU device and same adaptive policy. Temperature may change; output sizes are recorded. Unequal/changed sizes make the overall+1ms check unmeasured; matched-resolution cohorts are provided without claiming a controlled thermal experiment.
- RC13 clouds, RC14 transitions and RC15 light remain deferred. Signing, WeatherKit/RevenueCat activation and TestFlight require owner/Mac steps.

## Next steps

1. RC12c local checks, production/hosting packaging and private deployment are complete; receipt is above. Do not change code before reading the new phone evidence.
2. User runs the same gate in Safari. It performs5s RC11 readiness,120s candidate,30s RC11 control, then captures/truth/clips; each acknowledged result survives reload. Warm precheck stops before120s and offers an explicit retry.
3. Read both per-pass GPU summaries and matched-resolution budget/difference fields in `gpuComparison`, candidate<=10% span drift, FPS bins,36 stills/truth/clips. Inspect device visuals before accepting. No baseline promotion or RC13 yet.

## Rules and invariants

- Only RC12c media boundaries/startup diagnostics, fragment surf caching and private control phases are authorized. UI/camera/sky/light/sand/still freeze/settle mechanics unchanged.
- Keep DPR floor1.1,4×256 FFT cascades with unchanged reuse,48 crest samples/1.2m stations/12 lip vertices,16,384 spray and256 lightmap. No raised WebGPU limits or GPU runner.
- No secrets, advice wording or crowd reporting. Preserve estimates/source attribution and Tidewater/Takram MIT credits.
- No capture/encoding/upload during any timed window. Save candidate FPS before control/captures. Retain the exact baseline tag and acknowledged evidence. Update this handoff every pass.

## Archived handoff — RC12b deployment

# DayBuoy handoff — RC12b deployed; phone test pending

Updated: 2026-10-14 UTC. Read HANDOFF.md and continue. Read AGENTS.md and INTERACTION-CONTRACT.md first.

## Current revision and source

- Deployed candidate: `2026-10-15-surf-truth-rc12b` (the exact revision requested by Jacob). **Deployment succeeded; iPhone hardware test pending.**
- Renderer/physics/capture source: `123dea53d7ab303e89b68dc569aeeae80b6f4185`. This deployment pass adds only saved GPU timing summaries and completion-window metadata; no renderer/shader changes.
- Deployed source: `afa9dc16e5ff53266937ac73424ef07155b6171a`. The following handoff checkpoint is documentation only; the renderer remains identical to `123dea53`.
- Saved version: `appgprj_6ac49343ea048191b93c8d1135390e39~appgver_73e7487a644481918a927872eadb4123`.
- Deployment `appgdep_6acfde88417c819189701100e4f85c43` succeeded at `2026-10-14T19:57:10.009422+00:00`.
- Live gate: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-15-surf-truth-rc12b
- Immutable scene starting point: `scene-baseline-rc11`, source `4530d24a008cb45b4d72539ac2f07df1144adbd8`.
- Private Sites project `appgprj_6ac49343ea048191b93c8d1135390e39`; source/deploy `main` approved. Preserve owner-private audience. Jacob explicitly authorizes deployment now; the iPhone gate supplies the hardware test.
- GitHub continuation branch `wip/tidewater-verdict-first`, evidence `wip/tidewater-in-app`. Never commit/push GitHub main.
- Capture tools: `2026-10-15-streaming-capture-rc12b`.

## What passed

- Deployment pass: 26 GPU timing summary tests and durable FPS checkpoint assertion PASS; complete build, production startup and hosting packaging PASS. Per-pass first/last 20 medians, native timed-window filtering, true frame-span drift and coverage are saved in `gpuTiming` before captures. Historical RC11 per-pass comparison is included; missing RC11 total span remains explicitly unmeasured.
- Accepted RC11 device baseline: 40.6236 avg / 34 min / 0 seconds under 30, captures 36/36. These results do not certify RC12b.
- RC12b surf cache: 96,000 comparisons against actual RC12 scalar functions; maximum height difference 0.111%, vertical profile difference 1.382%, absolute curl difference 0.0484. Forecast-order regression passes. Cache uses the existing shore travel-time resource, adds 532,480 padded bytes (526,336 coefficient bytes) and no binding or per-frame CPU bake. Original field bytes and logical resolution are unchanged.
- Normal FFT row/column WGSL, uniforms, bindings, foam bounds and dispatch sequence match RC11. Four 256 cascades and the existing update/reuse cadence are unchanged. The separate compression snapshot program replaces one column dispatch only for calibration/diagnostics outside the FPS window.
- Focused capture/storage tests pass: individual retries, bounded one-second streaming fragments, durable progress, hidden-tab retry with fresh take IDs, reload reconstruction of five continuous six-second files, Share results and unchanged FPS accounting. Mock codec/network/storage tests, not iOS evidence.
- Sustained-performance grader passes 56 positive/negative unit cases; it rejects missing hardware samples, null/software adapters, stale manifests, raised limits and thermal drift. Test fixtures are not benchmark results.
- Strict local 80 WGSL modules / 84 complete pipelines pass at default limits: maximum 12 uniforms / 8 storage buffers / 9 samplers / 16 sampled textures. All 24 boundary/negative cases pass. All three strict startup checks and 36 still command paths pass with a null backend.
- Complete integration build and all seven automated interaction checks PASS. Production minified startup/forecast forwarding and 25-file allowlist PASS. Private startup bundles contain 11 verified assets (4,396,059 bytes); release startup assets total 3,098,172 bytes. Startup cache/retry checks PASS.
- Shader manifest: `2f8427bc7f9aa88354e4d5c0ccfdad104f2e107292d13cba62d30f71867d69f4`. Sites Worker packaging with byte-identical native assets PASS. Changed-text credential-pattern scan and `git diff --check` PASS.
- Controlled-comparison CLI still requires genuine measurements; the current user authorization instead deploys for the iPhone gate. `night-report/rc12b-sustained-release.json` records unmeasured values and that authorization, not a performance pass.
- Local tests are not a real-browser/device/visual pass. No RC12b phone FPS, rendered pixels, actual 36-image gallery or encoded iOS clips have been observed.

## Open issues

- Host has no hardware GPU. Jacob explicitly replaced that deployment blocker: deploy now and use his iPhone gate. Do not use the GPU runner or fabricate timings. Phone acceptance remains pending.
- Need a genuine controlled 120-second night-storm RC11/RC12b comparison on the same GPU/settings: cool GPU span <=RC11+1.0 ms; last 20 median <=110% of first 20; >=36 avg and every second >=30. Earlier uploaded traces contain per-pass durations but no complete first-to-last GPU spans. Summing overlapping tile-GPU pass durations is not a valid total.
- RC12 uploaded result was 21.1383 avg / 10 min / 110 seconds under 30; water 17.712→34.912 ms and FFT 5.049→13.757 ms (first/last 20 populated samples). See `night-report/rc12b-device-analysis.md` and JSON.
- The latest uploaded report contains the full 120.019 seconds / 2,537 completions. It does not contain the reported 36-second renderer interruption or the I/O exception. Their exact device causes remain unverified. New failure tracing will preserve stage/error/elapsed details.
- Found/fixed the pre-journal Blob-read classification bug: it was incorrectly marked as a durable upload failure, aborting the gallery. Captures now retry their failed stage and continue other captures after bounded failure. Already uploaded evidence remains immutable.
- Additional recovery fixes: clip-copy errors are isolated from the native renderer; strict queue reads block new work when unavailable; stale acknowledgement reports cannot overwrite later checkpoints; successful replacement clips prune orphan local bytes while preserving remote receipts; successful profile resumes clear old aggregate errors.
- The small cache approximation can shift foam edges (maximum pointwise scalar delta 0.194). Actual iPhone visual comparison is still required; do not claim pixel identity or no visual regressions.
- RC13 clouds, RC14 seams/night zigzag+blob/overcast sand crack, RC15 light remain deferred. WeatherKit/RevenueCat activation and signing/TestFlight remain owner/Mac work.

## Next steps

1. RC12b is deployed with first20/last20 GPU summaries; deployment receipt is recorded above. No more renderer changes in this pass.
2. Run the existing iPhone gate. Its first durable FPS report includes `gpuTiming`: timed per-pass first20/last20 medians, frame-span drift, resolution history and historical RC11 reference. Total RC11+1 ms remains unmeasured unless a matching RC11 frame span becomes available; never sum passes.
3. Read the uploaded phone FPS, GPU timing, 36 stills, five truth checks and five clips. Require the existing FPS/capture gates; evaluate drift and cost honestly. Share results survives reload; acknowledged FPS/stills are not rerun.
4. Read matching evidence and compare waves visually before acceptance. Keep `scene-baseline-rc11` immutable; do not begin RC13.

## Rules and invariants

- RC12b is the authorized surf-cost and capture-recovery exception to the RC11 freeze. Preserve all surf-truth behaviors and ±20% checks. UI, astronomy, camera, sky/light/sand and still freeze/settle mechanics stay unchanged.
- Keep DPR floor 1.1, four 256 FFT cascades at existing 40 Hz reuse, 48 crest samples / 1.2 m stations / 12 lip vertices, spray 16384, lightmap 256 and existing reflection/cloud work.
- No raised WebGPU limits, GPU runner, synthetic claims of device/visual success, secrets in output/commits, advice wording or crowd reporting. Preserve estimate/source labels and Tidewater/Takram MIT credits.
- Gate first, durable upload before captures. Clips run after FPS and stream in bounded chunks. Retry failed captures individually. Share results must work from saved data after reload.
- Every delivery: seven interaction checks, full build, default-limit pipeline/startup/capture checks and fresh hardware gate. Update this handoff at the end of each pass.

## Archived handoff — RC12 failed candidate

# DayBuoy handoff — RC12 surf truth candidate

Updated: 2026-10-14 UTC. Read HANDOFF.md and continue. Read AGENTS.md and INTERACTION-CONTRACT.md first.

## Current revision and source

- Deployed candidate: `2026-10-14-surf-truth-rc12`; local validation complete. Not yet device-accepted.
- Deployed source: `ef09723dfe5be658457ce2d61dae5622270215de`. The follow-up handoff checkpoint changes documentation only, not this deployed runtime.
- Saved version: `appgprj_6ac49343ea048191b93c8d1135390e39~appgver_44f098d589788191a58ff207d4e65dff`.
- Deployment `appgdep_6acfca5b04088191a79671c4749363f2` succeeded at `2026-10-14T18:31:08.311657+00:00`.
- Immutable scene starting point: `scene-baseline-rc11`, source `4530d24a008cb45b4d72539ac2f07df1144adbd8`.
- Private Sites project `appgprj_6ac49343ea048191b93c8d1135390e39`; source/deploy `main` approved. Preserve owner-private audience.
- GitHub continuation branch `wip/tidewater-verdict-first`, evidence `wip/tidewater-in-app`. Never commit/push GitHub main.
- Capture additions: `2026-10-14-wave-truth-clips-rc12`; existing still and scrub mechanics unchanged.
- Gate ready for the iPhone run: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-14-surf-truth-rc12

## What passed

- Accepted RC11 device baseline: 40.6236 avg / 34 min / 0 seconds under 30, captures 36/36. Those results do not certify RC12.
- RC12 full build and all seven automated interaction checks PASS. Production minified startup/forecast forwarding and the 25-file allowlist PASS; 11 verified startup assets and revisioned-cache/retry tests PASS.
- Sites Worker packaging PASS with byte-identical native static assets; no runtime credentials in the artifact. Changed-text credential-pattern scan and `git diff --check` PASS.
- Deployed HTTPS verification PASS: exact RC12 manifest, SHA-256/length for all 11 assets (4,391,852 bytes), exact gate HTML and bundled gate module. This checks served bytes, not browser rendering.
- Strict local 79 WGSL modules / 83 complete pipelines PASS at default limits: maximum 12 uniforms / 8 storage buffers / 9 samplers / 16 sampled textures per stage. All 24 boundary/negative cases pass. Shader manifest `81ef065f2d3c9df5718c0a469a40e6e687f0fde3b9156533aebf36ac0a21d288`.
- Strict null-backend initialization plus all 36 still command paths PASS (Inlet 22, Cocoa 7, San Diego 7). Actual wave-truth command/readback orchestration runs locally; empty null-backend output correctly fails truth checks.
- Current production scalar wave heights/groups and actual travel-time fields PASS: 1/3/6 ft cases measure 0.3022/0.9040/1.8093 m Hs. Independent numerical and negative-metric tests pass. See `night-report/rc12-surf-truth-local.json`.
- Five six-second clip, frozen-frame rejection, bounded encoding, independent upload, interrupted-upload retry, reload and Share-file tests PASS with mocked storage/encoding. Real gate orchestration retains FPS and acknowledged captures; truth failures remain REVIEW, not a false pass.
- Scope checks preserve RC11 UI/camera/sky/light/sand, vendor, existing still freeze/settle and live draw loop, and all sustained budgets. Current changes and reference limitations are in `night-report/rc12-report.md`.
- Local tests are not a real-browser/device/visual pass. No RC12 phone FPS, pixels, native Share or rendered recordings have been observed yet.

## Open issues

- RC12 device wave-truth metrics, five clips, visual comparison and sustained gate remain pending.
- Hs is the highest-third mean, not every wave. The height probe measures the coherent breaking face before independent FFT surface chop. Refraction/group/whitecap targets are explicitly labelled model estimates. No local bathymetric survey is available.
- Real Inlet and Crystal Pier/Pacific Beach footage was inspected for crest/foam morphology. Its camera heights and unknown wave conditions prevent a quantitative matched-view claim. Compare the new phone stills/clips before acceptance.
- Future RC13 clouds, RC14 seams/night zigzag+blob/overcast sand crack, RC15 sun glow/light are deferred. Do not implement them in RC12.
- WeatherKit/RevenueCat activation and signing/TestFlight remain owner/Mac work.

## Next steps

1. Run the existing iPhone gate. Require >=36 avg, >=30 every whole second for 120 s, 36 stills and all five wave-truth conditions/clips. Use Share results after completion; saved results survive a reload. No baseline promotion without matching evidence and visual review.
2. Read the fresh uploaded JSON and five motion clips. Check height/stand, cadence, sets, angles, cap area and connected face/lip/foam against reference footage with comparable framing and conditions.
3. Fix only concrete RC12 regressions if found. Do not start RC13 without completing RC12 acceptance. Keep `scene-baseline-rc11` immutable.

## Rules and invariants

- RC12 is the user's explicit surf-only exception to the RC11 freeze. UI, astronomy, camera, sky/light/sand, still tooling and budgets stay frozen.
- Keep DPR floor 1.1, four 256 FFT cascades at existing 40 Hz reuse, 48 crest samples / 1.2 m stations / 12 lip vertices, spray16384, lightmap256 and existing reflection/cloud work.
- No raised WebGPU limits, GPU runner, synthetic claims of device/visual success, secrets in output/commits, advice wording or crowd reporting. Preserve estimate/source labels and Tidewater/Takram MIT credits.
- Gate first, durable upload before captures; each new clip independently persisted/uploaded. Share results must work from saved data after reload. Keep null-abort and still-timeout recovery.
- Every delivery: all seven interaction checks, full build and default-limit pipeline/startup/capture checks. Update this handoff at the end of each pass.

## Archived handoff — RC11 accepted freeze

# DayBuoy handoff — RC11 scene baseline FROZEN

Updated: 2026-10-14 UTC · RC11 accepted by Jacob after the uploaded iPhone run.
Start a new thread with **“Read HANDOFF.md and continue.”** Read AGENTS.md and
INTERACTION-CONTRACT.md. This section supersedes every archived candidate scope.

## Current revision and source

- **Frozen scene baseline:** `2026-10-14-sustained-scene-rc11`.
- Annotated tag **`scene-baseline-rc11`**, pushed and verified in the canonical
  private Sites source repository, points to the exact accepted source commit
  **`4530d24a008cb45b4d72539ac2f07df1144adbd8`**.
  Tag object: `27a0702c09ffe7a53c50eba38bc329a94c1788aa`.
  The tag identifies the deployed scene, not this later documentation commit.
- Saved version: `appgprj_6ac49343ea048191b93c8d1135390e39~appgver_c6ceda20f1dc8191afa9a306fe00f46f`.
  Successful deployment: `appgdep_6acfb0ec153c8191b9775db38aaa0902`
  at `2026-10-14T16:42:33.407999+00:00`. Keep that accepted deployment live.
- Saved-results/share tools: `2026-10-13-share-resume-1`, unchanged.
- Canonical source: private Sites repo, approved source/deploy branch `main`;
  project `appgprj_6ac49343ea048191b93c8d1135390e39`, owner-private.
- GitHub continuation mirror: `jcarroll44/ocean`, `wip/tidewater-verdict-first`.
  **Never commit/push GitHub main.** Evidence: `wip/tidewater-in-app`.
  The GitHub mirror is not the canonical scene source or the tag location.
- Same gate + Share results:
  https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-14-sustained-scene-rc11

## What passed

- **Accepted iPhone RC11 gate:** **40.62364587847072 average FPS / 34 minimum /
  zero seconds below 30**, 4,875 GPU-completed frames over **120.004 seconds**.
  All 120 whole-second samples meet the existing cadence requirement.
- **Captures 36/36:** 10 weather fixtures + 5 wave cases + 21 location/phase stills.
  Uploaded report is complete (`partial: false`, `part: complete`).
- Gate parent run: `2026-10-14T16-50-34Z-a920eb8e-e19c-4847-bfa0-2fa487a0d76b`.
  Complete report: `results/2026-10-14T17-06-15Z-655fcb35-b920-49d5-8068-a1302b71567c/report.json`
  on `wip/tidewater-in-app`; blob `b1bc3ca3440324ad2ad19c210d8d57c6732ae07a`.
  These numbers were read from that JSON and accepted by the user. Its user
  agent identifies an iPhone with GSA; do not relabel it a controlled Safari A/B.
- RC11 release validation passed: all seven interaction checks, full build,
  78 WGSL modules / 82 complete default-limit pipeline creations, all 36 local
  still command paths, production startup/allowlist and startup-cache checks.
  Per-stage maxima: 12 uniforms / 8 storage buffers / 9 samplers / 16 textures.
  Shader manifest: `b312de3bab24e63bd78640c869cad56dda007434919098d647ac9dd72133cc91`.
- Local tests are not a real-browser/device/visual pass. The phone result above
  is authentic uploaded evidence; local Dawn-null/mocked checks validate code
  and commands, not rendered pixels or sustained phone performance.
- Freeze pass: all seven automated interaction checks and the full build were
  rerun successfully. Only these handoff/workflow documents changed; all other
  tracked source and deployed build files remain identical to the baseline tag.

## Open issues

**Deferred polish backlog — record only; do not work on it without a new request:**

1. Hard horizon line in squall approaching and clearing.
2. Night storm: bright zigzag line on sand and white blob in surf.
3. Inlet overcast dawn: dark crack line on sand.
4. Soft glow on the sun.

These are accepted deferred items, not permission to change the frozen scene.
WeatherKit/RevenueCat activation, signing and TestFlight remain owner/Mac work.

## Next steps

1. **Stand by for the UI/brand spec.** Do not start the deferred polish backlog.
2. Future UI/brand work must preserve the frozen scene and performance.
3. Keep the existing 120-second gate, captures, saved-results resumption and
   Share results as the required check for **every future build**, including
   UI/brand builds. Require a fresh matching-build run: >=36 average FPS,
   every whole second >=30, and 36/36 captures. Old RC11 results never certify
   changed code. Do not relax the gate or change capture tooling as a side effect.

## Rules and invariants

- **No scene, wave, sky or shader changes unless Jacob explicitly asks.**
  Freeze RC11 ocean, geometry, foam, lighting, sand, sun/moon, camera framing,
  shader/resource adapters and renderer/performance settings. This acceptance
  supersedes all earlier candidate permissions to keep refining the scene.
- No secrets in output/commits. Never GitHub main; private Sites main approved.
  Preserve the private audience, acknowledged results and immutable baseline tag.
- Before every future build delivery, run the existing interaction/full-build
  checks and complete local WGSL/default-limit validation. No raised limits
  (12 uniform, 10 storage buffers, 16 samplers, 16 sampled textures per stage).
  No GPU runner. Keep the matching device gate required for acceptance.
- Preserve the 1.1 DPR floor and all accepted RC11 budgets: 16,384 spray capacity,
  256² underwater lightmap, 6s stationary reflection refresh, exact 4-tap tent,
  two GPU frames in flight, FFT reuse40 Hz, crest48×4, cloud512×128 triple cache,
  256 idle/2048 transition pixels, 18primary/3shadow/8shelf, 20s refresh, 384 rain.
  No capture/encoding/upload during 15s warmup + 120s measured gate.
- Pinned Tidewater `4811ba48d795197de5621985f404e765c0b7c0ef`; keep MIT
  Tidewater/Takram credits, `est.` + source labels, no advice copy/crowd reporting.
- This freeze pass changes documentation and adds the baseline tag only.
  Runtime, scene, UI, gate, captures and the accepted deployed artifact stay intact.

## Archived handoff — RC11 candidate before acceptance

# DayBuoy handoff

Updated: 2026-10-14 UTC · RC11 sustained scene candidate.
Start a new thread with **“Read HANDOFF.md and continue.”** Read AGENTS.md and
INTERACTION-CONTRACT.md. This section supersedes the archived history below.

## Current revision and source

- Renderer/evidence: `2026-10-14-sustained-scene-rc11`.
- Saved-results/share tools: `2026-10-13-share-resume-1`, unchanged.
- Canonical source: private Sites repo, approved deploy branch `main`.
  RC10 base: `c0abbaed3147ac263e137c74e15e689f5313e55f`.
- Project: `appgprj_6ac49343ea048191b93c8d1135390e39`, owner-private.
- GitHub mirror: `jcarroll44/ocean`, `wip/tidewater-verdict-first`.
  **Never commit/push GitHub main.** Evidence: `wip/tidewater-in-app`.
- Gate + Share results:
  https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-14-sustained-scene-rc11
- Final source/deployment receipts go in the GitHub WIP handoff after publication.

## What passed

- RC10 iPhone captures 36/36; cadence FAILED: 33.371663 average / 28 minimum /
  five seconds below 30 in 120.012 seconds (4,005 completed frames).
  Parent run `2026-10-14T15-49-28Z-b41715c0-59d1-4d1f-b297-e7e4ec86b429`;
  retrieved report blob `266dc04991b74d1a76c53f4b3ec81716e3c4ab11`.
- RC8 accepted iPhone: 39.646035 average / 31 minimum / zero seconds below 30.
- Reviewed all three authentic RC10 contact sheets and sampled GPU timing traces.
  `night-report/rc11-device-analysis.json` records source IDs and the comparison.
- Full build and all seven interaction checks: PASS (automated).
- Strict local WGSL: 78 modules; all 82 complete pipeline creations pass on a
  default-limit Dawn null device, with no requested raised limits. Per-stage
  maxima: 12 uniforms / 8 storage buffers / 9 samplers / 16 sampled textures.
  All 24 boundary/one-over negative cases pass.
- All 36 settled still GPU command sequences pass: Inlet 22, Cocoa 7, San Diego 7.
  Existing phase orchestration and upload/resume scenarios also pass.
- Exact shader manifest SHA-256: `b312de3bab24e63bd78640c869cad56dda007434919098d647ac9dd72133cc91`.
  Receipts: `night-report/rc11-sustained-checks.json` plus current-revision
  pipeline/startup details in `night-report/rc10-default-resources.json`.
- Production minified startup/forecast/camera and 25-file allowlist checks PASS.
  Native startup has 11 verified assets; caching and retry tests PASS.
- Exact optimized bloom tent passes 1,800 arbitrary-coordinate/HDR/edge cases;
  new budgets and RC10 waveform/foam/functional source preservation pass.
- Local tests are not a real-browser/device/visual pass. Dawn null validates
  GPU pipelines/commands; DOM/JPEG/settle-clock doubles produce no real images.
  No GPU runner used. No claim of a measured RC11 FPS gain before the phone run.

## What changed and decisions

- Exact four-channel fields now use one aligned vec4 storage load in place of
  four separately bounded scalar loads. Float32 values, bounds and uploads stay
  identical. Native default-limit packing and pinned vendor remain intact.
- Native spray capacity 32,768 -> 16,384; visible splash/mist emission unchanged.
  Existing emission feedback reduces subpixel drops/ligaments to fit capacity.
- Underwater illumination lookups 512² -> 256² (75% fewer generated texels).
  This is low-frequency submerged lighting, not the water/foam surface. Visible
  foam/caustic textures, ocean mesh, crest samples and FFT remain unchanged.
- Stationary environment probe refresh 3 -> 6 seconds. Real solar movement and
  forced still refresh still bypass the timer. No reduction to cube resolution.
- Original bloom pyramid/resolution/strength retained. Exact phase-aware bilinear
  folding reduces each tent from nine taps to four; no new post pass.
- Remove duplicate grey horizon blend; narrow the sky convergence, move water
  haze completion before the far clip and sample clear air above the intense
  orange horizon row. Slightly soften the existing solar glare coefficients.
  No added texture taps, passes or raymarches for these optical refinements.
- RC10 UI, capture tooling, Share results/resume, cloud cache, 1.1 DPR floor,
  High mesh, all wave/foam expressions, FFT and two-frame submission unchanged.

## Open issues

- RC11 target: >=36 average, every second >=30 for a full 120 s. Device speed
  and the final rendered appearance await Jacob's cool-phone Safari run.
- Uploaded RC8 and RC10 user agents identify the Google app embedded browser;
  source differences and heat are not controlled A/B variables. GPU pass timing
  intervals can overlap on tile hardware; do not add them as independent costs.
- Scene freezes AFTER RC11 device acceptance. It is not accepted or frozen yet.
- WeatherKit/RevenueCat activation, signing and TestFlight remain owner/Mac work.

## Next steps

1. Local validation complete. Package the checked source and production bundle.
2. Deploy private Sites main and verify delivered assets; mirror final receipts.
3. User runs RC11 in Safari with phone cool. Retrieve fresh JSON and images;
   accept only >=36 average and >=30 each second, then freeze the scene.

## Rules and invariants

- No secrets in output/commits. Never GitHub main; private Sites main approved.
- Fresh Sites helper before edits; preserve private audience and prior evidence.
- Pinned Tidewater `4811ba48d795197de5621985f404e765c0b7c0ef`; MIT Tidewater/Takram
  credits. Estimates retain `est.` + source; no advice copy or crowd reporting.
- Local complete WGSL/default-limit pipeline creation before any gate link.
  No raised limits. No GPU runner. No phone/pixel claims from null tests.
- DPR 1.5/min1.1/max1.6/step.05, 38 down/46 up; High/FXAA/no flare;
  two frames in flight; FFT reuse40 Hz; crest48×4; cloud512×128 triple cache,
  256 idle/2048 transition pixels,18primary/3shadow/8shelf,20s refresh;384 rain.
  No capture/encoding/upload during 15s warmup + 120s measured gate.

## Archived handoff — RC10

# DayBuoy handoff

Updated: 2026-10-14 UTC · RC10 default-resource startup repair.
Start a new thread with **“Read HANDOFF.md and continue.”** Read AGENTS.md and
INTERACTION-CONTRACT.md. This section supersedes the archived history below.

## Current revision and source

- Renderer/evidence revision: `2026-10-14-default-resources-rc10`.
- Saved-results/share tools: `2026-10-13-share-resume-1`, unchanged.
- Canonical source: private Sites repo, approved deploy branch `main`.
  Base RC9 source: `2e0bdf67d07e25eb5a744e2e410d24822d8f5196`.
- Project: `appgprj_6ac49343ea048191b93c8d1135390e39`. Preserve owner-private access.
- GitHub continuation mirror: `jcarroll44/ocean`, `wip/tidewater-verdict-first`.
  **Never commit/push GitHub main.** Evidence stays on `wip/tidewater-in-app`.
- Gate + Share results:
  https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-14-default-resources-rc10
- This source-helper commit is the RC10 candidate. The GitHub WIP handoff mirror
  receives final source/deployment receipts after verified publication.

## What passed

- Accepted RC8 iPhone: 39.646 average / 31 minimum / zero seconds below 30;
  36/36 captures. RC9 has NO device acceptance: startup failed three times.
- Retrieved RC9 failure from
  `results/2026-10-14T05-40-55Z-2a4fba3b-925f-4f6c-be28-04c09fbd6b01/report.json`,
  blob `dec3d72430e3412960cdaa66785a6b52504da1c1`. Spray Update layout exactly
  reproduces 13 uniforms / 7 storage buffers / 9 samplers / 14 textures.
- Full build and all seven interaction checks: PASS. Strict local WGSL: all
  78 modules; complete strict creation: all 82 pipeline descriptors (including
  direct mipmaps), no errors and no requested higher limits.
- Per-stage maxima: 12 uniforms / 8 storage buffers / 9 samplers / 16 sampled
  textures. All 24 exact-boundary/one-over negative cases pass. The guard runs
  in the build and release packaging checks and the existing CI workflow.
- Default-device startup and settled still GPU command sequences: Inlet 22/22,
  Cocoa 7/7, San Diego 7/7, total 36/36. Full-resolution bounded targets, shader
  bindings, row uploads, queue operations and restoration pass. Existing RC8
  21-phase orchestration still passes all four failure/resumption scenarios.
- Exact evidence manifest SHA-256:
  `8c02f752ced6227ef8583bc3124b34346771bf55831d530fa2491b79f7fb403b`.
  Durable report: `night-report/rc10-default-resources.json`.
- Local tests are not a real-browser/device/visual pass. Dawn null validates
  GPU pipelines/commands; DOM/JPEG/settle-clock doubles produce no real images.
  No GPU runner is used. New iPhone throughput/appearance remain unverified.

## What changed / root cause

- RC9 added the atmosphere dependency to shared weather for the horizon blend.
  Spray's compute kernel inherited its extra uniform, reaching 13, even though
  the gust computation did not read it. Module-only WGSL tests missed the layout.
- Atmosphere values now share the existing NativeWeather buffer and their exact
  original live CPU handles. Existing atmosphere bake kernels keep their buffer.
  All RC9 visual expressions, wave/foam/sand/horizon math and lighting are kept.
- Stage visibility excludes resources unreachable from that entry point. The
  full guard aggregates every group, including frame/draw and direct mipmaps.
- Native builds use a narrow adapter over the UNMODIFIED pinned vendor. Three
  exact-load CPU float32 fields use storage buffers with identical payloads and
  manual interpolation. Four identical-size RGBA8 material/foam maps share one
  array, copying every original mip unchanged once during startup. Same filters,
  gradients, LOD and resolution; old images retire after queue completion.
- No raised device limits. Build guard: 12 uniform / 10 storage / 16 sampler /
  16 sampled-texture cap per stage; strict local default device also enforces
  its tighter 8-storage cap, 4 storage textures and 16 KiB workgroup memory.
  FFT level 5 stores move from A to B using the EXISTING full-precision mipMid:
  same transforms, values, workgroups, two mip dispatches and 40 Hz reuse.
  SH scratch packs RGB without vec3 padding. Other box-mip chains use <=4 outputs
  per dispatch (512² maps add only the final 1px mip reduction).
- UI, capture/tooling, gate duration/threshold, profile/camera, startup caching,
  upload/resume, Share results, cloud/crest/rain/DPR budgets remain unchanged.

## Open issues

- RC10 iPhone startup, appearance and sustained >=30 per second require the run.
  RC9 realism was never visually verified because of its startup failure.
- WeatherKit/RevenueCat activation, signing and TestFlight remain owner/Mac work.

## Next steps

1. Local validation complete; package unchanged checked source.
2. Publish checked source/archive through private Sites main; verify assets and
   mirror final receipts to the GitHub WIP HANDOFF.md.
3. User runs RC10. Fetch fresh results/latest.json and compare images with RC8.
   Preserve earlier FPS/media; never reuse an older gate as new-build evidence.

## Rules and invariants

- No secrets in output/commits; never GitHub main; private Sites main approved.
- Fresh Sites helper before edits; preserve private audience.
- Pinned Tidewater `4811ba48d795197de5621985f404e765c0b7c0ef`, MIT Tidewater/Takram
  credits. Estimates retain `est.` + source. No advice copy or crowd reporting.
- Full build/all seven interactions, strict WGSL, all resource limits, complete
  default-device pipeline creation/startup/still checks before a link. No GPU runner.
- v8.2 DPR 1.5/min1.1/max1.6/step.05, 38 down/46 up; High/FXAA/no flare;
  two frames in flight; FFT reuse40 Hz; crest48×4; cloud512×128 triple cache,
  256 idle/2048 transition pixels,18primary/3shadow/8shelf,20s refresh;384 rain.
  No capture/encoding/upload during 15s warmup + 120s measured gate.

## Archived handoff — RC9

# DayBuoy — current handoff

Updated: 2026-10-14 UTC · RC9 shore realism pass.
Start a new thread with **“Read HANDOFF.md and continue.”** Read AGENTS.md and
INTERACTION-CONTRACT.md. This section supersedes the archived history below.

## Current revision and source

- Renderer/evidence revision: `2026-10-14-shore-realism-rc9`.
- Saved-results/share tools: `2026-10-13-share-resume-1`, byte-identical to RC8.
- Canonical private Sites repo, approved deploy branch `main`; RC8 base
  `1161f2288a034ac198d740506dbf718d5b87f5bf`.
- Private project `appgprj_6ac49343ea048191b93c8d1135390e39`; owner-private.
- GitHub continuation mirror: `jcarroll44/ocean`, `wip/tidewater-verdict-first`.
  **Never commit/push GitHub main.** GitHub app source is older than Sites.
- Evidence: `results/` on `wip/tidewater-in-app`; preserve all earlier sessions.
- RC9 gate + Share results:
  https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-14-shore-realism-rc9
- The helper commit containing this handoff is the deployment candidate. Save
  final source/deployment receipt to the GitHub WIP handoff after publication.

## What passed

- Authentic RC8 report:
  `results/2026-10-14T04-28-18Z-7ee7fad1-0986-4ef1-a49d-3d553c71fd3e/report.json`,
  blob `c35e7597cd869358908405183d67f83f853940b5`.
  **39.646035 average / 31 minimum / zero seconds under 30 / 120.012 seconds**;
  4,758 completed frames. 21 solar phases + 10 weather + 5 wave captures complete,
  all 21 phases settled. User accepts RC8 functionality. This is NOT RC9 FPS.
- Reviewed authentic RC8 waves, weather and 21-phase contact sheets and the
  original thunderstorm photo, all via that report's immutable evidenceIndex.
- RC9 actual scalar shader tests reproduce RC8's submerged large-wave bores:
  about 50% of sampled 3 ft nearshore crests and 81% of 6 ft nearshore crests
  were at/below mean water. RC9 sampled large bores are above water, conserving
  their depth-limited height. This is mathematical coverage, not rendered pixels.
  Small-day amplitudes/profile remain numerically exact. About 21% of sampled
  6 ft set crests reach the outer-bar depth; 1/3 ft do not.
- Final full build and all seven interaction checks: **PASS**. Strict local
  Dawn WGSL: **78 modules / 79 pipeline descriptors**, zero errors; RC4 invalid
  reserved-identifier test rejected. Manifest hash:
  `a1c759a6bcf3fcefb3badf8fbb7d6f8f6bfe799cea632005e0c7f1c24fb39b51`.
- Actual RC8 capture orchestration again passed 21/21 phases in four mocked
  scenarios: busy/pending work, unsettled timeout, upload/reload and draw failure.
  UI/capture/source/FFT/budget byte checks passed against RC8. New mathematical
  receipt: `night-report/rc9-realism-checks.json`. No additional foam taps/loops,
  and the same proven lip/spray vertices and independent compile-failure isolation.
- Local tests are not a real-browser/device/visual pass. No browser renderer
  is available here. No GPU runner used; user's iPhone is the device test.

## What changed and decisions

- Fix the bore datum: RC8 carried an offshore trough into a dissipated shallow
  roller, burying large breaking waves under the swash. Keep physical H/2 and
  depth-limited Hb; larger rollers now straddle mean water. Do not inflate Hs.
- Long-period crest phase/amplitude variation is smoother and its plunge interval
  broader. Remove the duplicate arbitrary 85 m cutoff; the shared depth/set
  calculation remains the authority for outer-bar breaking. Same 48 samples,
  4 m step, 1.2 m station spacing, 12 lip vertices and one secant refinement.
- Distant foam no longer averages each vertex patch to a solid white rectangle.
  World-space streak breakup reuses the existing bubble sample; no added texture
  fetches, loops or passes. Foam remains on the simulated surface/roller.
- Foam and spray diffuse illumination now neutralizes the ambient hemisphere as
  well as direct sun, including dusk. Proven Spray/BreakerLip vertices untouched.
- Sky and distant water converge on the same atmospheric radiance and bearing
  before the far clip. Retain physical gold scattering, soften the solar horizon
  row, and remove the dark shelf's exemption from horizon haze. Heavy opaque
  weather skips the added clear-air LUT lookup.
- Cloudy sand receives diffuse sky fill; rain alone no longer makes all emerged
  sand nearly fully wet. High-sun diffuse sand chroma follows the profile pigment
  instead of a pink horizon probe. Wet solar/lightning reflections remain.
- Select a visible, forecast-supported lightning sector and bound bolt height.
  If only an offscreen sector is supported (or view too tight), show cloud flash
  without inventing a bolt inside the frame. Existing sun glare widened softly.
- All UI, startup, source data, profile/camera, still/video capture, upload/resume,
  Share results, cache scheduler and v8.2 throughput settings unchanged from RC8.

## Open issues

- RC9 appearance and sustained iPhone performance require the new gate/photos.
  Mathematical and compiler checks cannot confirm the finished on-screen look.
- WeatherKit/RevenueCat activation, signing and TestFlight remain owner/Mac work;
  keep the existing instructions. No account activation claimed by this pass.

## Next steps

1. Publish the checked exact source/archive through the private Sites helper.
2. Verify delivered revision/assets and update the WIP handoff with receipts.
3. User runs RC9; fetch fresh latest/report and compare original images to RC8.
   Preserve completed FPS/media on reload; never reuse RC8 FPS for RC9.

## Rules and invariants

- No secrets in output/commits; never GitHub main; private Sites main approved.
- Fresh Sites helper before edits; preserve private audience.
- Pinned Tidewater `4811ba48d795197de5621985f404e765c0b7c0ef`, MIT Tidewater/Takram
  credits. Estimates retain `est.` + source. No advice copy or crowd reporting.
- All seven interaction checks, full build and complete strict local WGSL before
  a link. No GPU runner. Capture tooling and UI must remain accepted RC8 bytes.
- v8.2 budgets: DPR 1.5 / min1.1 / max1.6 / step.05, 38 down / 46 up,
  High/FXAA/no flare, two frames in flight, FFT reuse40 Hz; crest48×4,
  cloud512×128 triple cache / 256 idle / 2048 transition pixels,18primary/3shadow/
  8shelf samples,20s refresh,384 rain quads. No capture/encoding/upload in timing.

## Archived handoff — RC8

Updated: 2026-10-14 UTC · RC8 frozen-capture regression repair.
Start a new thread with **“Read HANDOFF.md and continue.”** Read AGENTS.md and
INTERACTION-CONTRACT.md. This section supersedes the archived history below.

## Current revision and source

- Renderer/evidence revision: `2026-10-14-frozen-capture-rc8`.
- Saved-results/share tools: `2026-10-13-share-resume-1`, unchanged.
- Canonical source: private Sites repo, approved deploy branch `main`.
  Base RC7: `dae16d5837ff6b57a6884e883e961b4567d293bd`.
- Private project: `appgprj_6ac49343ea048191b93c8d1135390e39`.
  Preserve owner-private access; do not deploy the separate public Site.
- GitHub continuation mirror: `jcarroll44/ocean`, `wip/tidewater-verdict-first`.
  **Never commit/push GitHub main.** The GitHub app source is older than Sites.
- Evidence remains `results/` on `wip/tidewater-in-app`; preserve earlier sessions.
- Gate + Share results:
  https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-14-frozen-capture-rc8
- The source-helper commit containing this handoff is the RC8 deployment
  candidate. Final private source SHA/deployment receipt goes in the GitHub WIP
  handoff mirror after publication and delivered-asset verification.

## What passed

- Retrieved RC7 JSON:
  `results/2026-10-14T02-52-00Z-dd648789-98de-4cad-97ff-6156526dd5e4/report.json`,
  blob `d1b26bbe4c2cdad161e2c9adf814260392c4dc94`:
  **40.184969 average / 33 minimum / zero seconds under 30 / 120.02 seconds**.
  4,823 GPU-completed frames. Phase captures 0/21, 12 failed profile attempts.
- Local reproduction executes the RC7 settle function: stationary camera and
  complete sky still time out when GPU submission capacity periodically closes.
- RC8 actual collector → screenshot adapter → native capture method → still
  helper completes **21/21** for busy/pending work, permanent sky timeout,
  interrupted upload/resumption and failed-draw recovery. All per-phase settle
  attempts log seven metrics. Timeout case retains all 21 marked unsettled.
  Receipt: `night-report/rc8-local-captures.json` (mock GPU/encoder/clock).
- Native-resolution bounds, zero shutter, held clocks, restore-before-encoding,
  hidden-page handling and byte-identical accepted scene/budgets checks pass.
- Full build and all seven interaction checks: **PASS**. Strict local Dawn WGSL:
  **78 modules / 79 pipeline descriptors**, zero errors; reserved-identifier
  negative test rejected. Exact RC8 manifest hash:
  `caff9de0ac9121771126aa3148958a40ca12d5c449713249d3b93280bfc130ca`.
  Cloud display blend completion and still-only periodic-refresh suppression also
  passed against the actual cache on Dawn null. No GPU runner used.
- Local tests are not a real-browser/device/visual pass. No browser renderer is
  available here. Do not call the local 21/21 tests authentic rendered images.

## What changed / root cause

- RC7 incorrectly used `api.ready` as content stability. It is a scheduling flag
  that goes false at two outstanding GPU frames (and during a capture lock).
  Every such sample reset the 1.8-second stable window; this was unrelated to
  whether the surf or cloud pixels were actually stable. Its timeout occurred
  before native capture began, explaining null `native.still` and absent metrics.
- Private still mode freezes the parent clock/camera, selects the same approved
  target (or held manual view), drains native work and applies one frozen packet.
  Wave/FFT time, sky inputs, simulation updates and motion blur are held before
  checking. Finish only pending immutable sky/shore work at that same instant.
  A newly completed shore field refreshes its geometry at zero time step. Finish
  the display blend with periodic refresh disabled; resolve forecast display easing
  and reflected-sky faces to the same frozen hour so no prior-phase haze survives.
- Metrics: native camera matrix/projection delta, wave/FFT clock deltas, sky-input
  change, complete target sky, pending shore field and stable-window duration.
  Every metric records threshold, final value and elapsed ms in each phase's
  `phaseAttempts[].captures[].settle`; native.still also updates during checks.
- At 45 seconds, still capture continues with `unsettled: true` and failed metrics.
  Contact-sheet labels and JSON disclose this. No image is fabricated. Hidden,
  GPU, allocation and encoding failures still propagate and restore capture state.
- Removed the redundant live phase-camera readiness loop. Normal product camera,
  UI, shaders, waves/colors, strict FPS gate and live rendering remain RC7 bytes.
  Keep DPR 1.1–1.6 and all v8.2 FFT/crest/cloud/particle/frame budgets unchanged.
- RC7's resumable/immutable uploads, segmented video and Share results unchanged.

## Open issues

- RC8 actual iPhone 21-phase rendering and peak memory remain to be verified.
  RC7 colors/wave corrections still lack authentic phase images because RC7
  captures failed. Do not claim visual acceptance or new RC8 FPS from RC7 results.
- WeatherKit/RevenueCat activation, signing and TestFlight are still owner-account
  and Mac tasks; retain the existing release instructions.

## Next steps

1. Finish mandatory build/WGSL checks, publish the exact RC8 source/archive, verify
   deployed assets and save the final receipt in the GitHub WIP handoff mirror.
2. User runs RC8 gate + Share results. Fetch JSON and originals without asking for
   manual downloads; inspect all 21 metrics/images, contact sheets and memory.
3. Compare actual RC8 imagery to RC6 references; preserve completed uploads on
   reload and never substitute an older measurement for a new revision.

## Rules and invariants

- Autonomous work; no secrets in output/commits; never GitHub main.
- Fresh Sites source helper before edits; private source main deploy is approved.
- Pinned Tidewater `4811ba48d795197de5621985f404e765c0b7c0ef`; MIT Tidewater/Takram
  credits retained. Estimates `est.` + source. No advice copy or crowd reporting.
- All seven interactions + full build + strict complete local WGSL before a link.
  No GPU runner. Physical iPhone rendering/performance is the user's device test.
- Preserve RC7 appearance, functional UI, input ownership, startup/cache, optional
  compile-failure isolation, frame/DPR budgets, durable evidence and Share results.

## Archived handoff — RC7

Updated: 2026-10-14 · RC7 coherent-surf / still-quality pass.
Start a new thread with **“Read HANDOFF.md and continue.”** Read AGENTS.md and
INTERACTION-CONTRACT.md. This section supersedes the archived history below.

## Current revision and source

- Renderer/evidence revision: `2026-10-14-coherent-surf-rc7`.
- Saved-results/share tools: `2026-10-13-share-resume-1`; compatible and unchanged.
- Canonical source is this private Sites repository, approved branch `main`.
  Base: accepted RC6 `e7e113f2d6bd0ee8e867258899944d05ed01dd40`.
- Private project: `appgprj_6ac49343ea048191b93c8d1135390e39`.
  Fresh get_site + credential + source helper before edits; preserve audience.
  Never deploy the separate public Site during these passes.
- GitHub integration: `jcarroll44/ocean`, `wip/tidewater-verdict-first`.
  **Never commit/push GitHub main.** GitHub source is older than Sites; its root
  handoff is a continuation mirror, not the deployed app source.
- Evidence stays on `wip/tidewater-in-app`, `results/`. No secret output/commits.
- Gate + Share results:
  https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-14-coherent-surf-rc7
- New pixels get a new evidence session. Never delete/relabel RC5/RC6 sessions.
  Capture failures resume from acknowledged uploads without remeasuring FPS.
- Deployment and source provenance must be verified after packaging; the GitHub
  mirror records the final private source SHA and deployment receipt.

## What passed

- Retrieved RC6 JSON, parent `2026-10-14T00-53-45Z-f9b12ba2-62e5-44a2-9021-48f32cd9d689`,
  final `results/2026-10-14T01-09-37Z-9a2d3831-c75e-4952-ba97-589a0f8fda41/report.json`:
  **41.183333 average, 34 minimum, zero seconds below 30, 120 seconds / 4942 frames.**
- Reviewed original RC6 small/medium/groundswell/onshore/offshore images, Inlet
  sunrise/sunset/overcast dawn and Cocoa dusk. RC6 visual defects are genuine.
  Most later originals were only 429×768 at adaptive DPR 1.1.
- Targeted RC7 scalar-wave and still-lifecycle tests pass; source tests preserve
  the real gold sky, core live draw, strict gate, resume and Share results.
- Full build, all-seven-interaction audit and all-pipeline local WGSL validation:
  **PASS**. Strict Dawn WGSL: **78 modules / 79 pipeline descriptors**, no errors;
  RC4 reserved-word negative test rejected. Manifest hash:
  `d1f8638167bb01f12cbd7702b026e2e0d5f25b9bc0a8d205bea6b7bebd87b23b`.
  Expected invalid-pipeline log is the negative test, not a shipping failure.
  No GPU runner. Packaging rechecks this exact revision/hash before release.
- Local tests are not a real-browser/device/visual pass. RC6 FPS is baseline
  evidence only; RC7 must be measured separately on the iPhone.

## What changed and decisions

- Coherent three-slot crest identity by wave index rather than distance zone.
  Previously adjacent stations selected different waves at the zone boundary,
  and the valid-endpoint guard correctly left disconnected teal fragments.
- Larger-wave sets retain an organized wave through the lull; reduced alongshore
  amplitude variation for long swell. Keep true H/2, period, directions and FFT.
  Outer-bar gate remains restricted to big set waves; 1 ft reference unchanged.
- Restore connected, irregular whitewater density on actual landing/roller masks
  instead of masking most of the foam out again. Spilling wind-sea foam starts
  at the crest; collapsed rollers no longer retain low-curl unbroken geometry.
- Onshore plunging-sheet opacity is suppressed in the fragment only. Proven
  Spray and BreakerLip vertex sources/dependencies and validity guards remain.
- Low-sun swash no longer clamps occluded rays into the orange solar horizon
  away from the actual sun bearing. Preserve the true gold Fresnel path.
- Sand separates broad diffuse peach / gray-blue shadow from wet solar glints,
  with fill reaching damp sand too. Opaque-dawn water neutralizes warm sediment
  and seabed constituents rather than merely changing the illuminant.
- Cloud ambient is peach toward the low sun and soft blue overhead, in the
  existing bake. The approved RC6 physical sky/disc implementation is unchanged.
- Clear dusk sky/water use one twilight air endpoint; opaque distant water
  converges before the far clip instead of exposing a hard horizon seam.
- Inlet sunrise now uses −65° seaward yaw, −13° pitch, 70° FOV: horizon ~33.5%,
  entire horizontal view water-facing. Real sun stays astronomical, even offscreen.
- Stills: drain timed work; hold one settled simulation/light/cache/exposure;
  render at device DPR up to 3 (3 MP hard bound), zero motion-blur shutter; copy
  synchronously and release high-resolution GPU targets before JPEG encoding.
  Restore production DPR on all exits. Still metadata records exact resolution
  separately from measured DPR. No upscale, temporal average or retouch.
- Every still now waits for 1.8 seconds of stable camera plus complete target
  sky/shore state. Small/medium wave comparisons no longer capture different
  points during the automatic camera transition. Bounded failure, not a blurry
  "successful" screenshot. Native still allocation/draw/encode/hidden errors
  are covered by restoration tests; existing durable uploads are unchanged.
- Keep segmented low-memory video and per-part immutable uploads unchanged.

## Open issues

- All eight corrected appearances still require authentic RC7 iPhone captures.
  No rendering browser is available here; do not promise pixel perfection from
  scalar tests/WGSL. Check both new looks and 120-second thermal throughput.
- Native-resolution still peak memory is bounded but needs iPhone verification.
  If interrupted, acknowledged FPS/media remain intact and reload resumes.
- WeatherKit / RevenueCat account activation, signing and TestFlight remain
  owner-account/Mac tasks; existing release docs are not activation evidence.

## Next steps

1. Reconcile the completed publication receipt in Sites / GitHub WIP handoff.
   The source commit containing this handoff is the deployed source candidate.
2. Verify deployed revision/assets before delivery; never substitute an older
   source tree from GitHub for this canonical private Sites checkout.
3. User runs 120-second gate and Share results; fetch latest JSON and originals.
   Compare wave scale, 21 solar phases and contact sheets to authentic RC6.

## Rules and invariants

- Autonomous implementation; never expose secrets, never GitHub main.
- Vendor `4811ba48d795197de5621985f404e765c0b7c0ef` unchanged; MIT Tidewater and
  Takram credits. No advice / “safe” copy, crowd reporting or fabricated evidence.
  Estimates retain est. + source.
- v8.2 timing budgets: DPR 1.5 initial / 1.1 floor / 1.6 ceiling / .05 steps,
  38 down / 46 up; FXAA/no flare; two GPU frames; FFT reused at 40 Hz;
  crest 48×4, spacing 1.2 m, 12 lip vertices, one secant; cloud 512×128 triple
  cache, 256 idle / 2048 transition pixels, 18 primary / 3 shadow / 8 shelf,
  20-second refresh; 384 thin-rain quads. No capture during 15+120 second gate.
- All seven interaction checks and full build are mandatory before delivery.
  Full actual pipeline/module WGSL validation locally; no GPU runner.
- Preserve functional UI, seven gestures, source validity, startup caching,
  compile-failure isolation, saved receipts, resumption, Share results.

## Archived handoff — RC6

Updated: 2026-10-14 · RC6 low-sun color pass only.
Start a new thread with **“Read HANDOFF.md and continue.”** Read AGENTS.md and
INTERACTION-CONTRACT.md. This section supersedes the archived history below.

## Current revision and source

- Renderer/evidence revision: `2026-10-14-low-sun-rc6`.
- Capture tools unchanged: `2026-10-13-share-resume-1`.
- Canonical source: this private Sites repository, approved branch `main`.
  Source is the commit containing this handoff (`git rev-parse HEAD`). Base:
  `2f678e567de4bb483d2a8a3e64024ef66bf152d6` (functional RC5).
- Owner-private project: `appgprj_6ac49343ea048191b93c8d1135390e39`.
  Use fresh Sites get_site + credential + source helper before edits. Preserve
  audience and newer remote work. Never deploy the separate public Site.
- GitHub integration: `jcarroll44/ocean`, `wip/tidewater-verdict-first`.
  **Never commit/push GitHub main.** GitHub app source is older than Sites;
  the root HANDOFF there is a continuation mirror, not canonical deployed code.
- Evidence: GitHub `wip/tidewater-in-app`, `results/`. No secret output/commits.
- Same gate workflow + Share results:
  https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/weather-fixtures.html?gate=1&v=2026-10-14-low-sun-rc6
- RC6 changes real pixels, so it gets a new evidence key. Existing RC5 sessions
  and uploaded files remain intact. Capture-only fixes must NOT bump that key.
- Publication uses this exact committed source and matching validated archive.
  Verify its status using Sites; the GitHub mirror records the completed deploy.

## What passed

- **Retrieved actual RC5 JSON** (not merely user-reported): parent run
  `2026-10-13T23-49-02Z-8c7938d3-2460-455b-93c6-c5189caae283`, final report
  `results/2026-10-14T00-05-46Z-3104df5d-2734-48a7-b7a5-8a64dcfe0d11/report.json`.
  **40.621953 avg, 33 minimum, zero seconds below 30, 120.009 seconds.**
  21 phase photos, ten weather photos, five waves, twelve live locations and
  four day/paywall video parts completed. See `night-report/rc5-accepted-evidence.json`.
- User accepted RC5 functionality and captures; no functional changes this pass.
- v8.2 baseline: 40.3 avg / 35 min / zero under 30. Not RC6 device evidence.
- Targeted RC6 checks passed: actual opaque-dawn lighting rejects the red key;
  night air endpoint is shared; material relighting avoids near-zero blue division;
  sand fill uses albedo/normal/occlusion above the wet band; functional, simulation,
  quality and camera files remain byte-identical to accepted RC5.
- Full build / strict WGSL / seven-interaction suite: **PASS** locally.
  All 78 shader modules from 79 pipelines validated; the RC4 reserved-word
  negative case was rejected. Final production packaging reruns its release guard.
  Local tests are not a real-browser/device/visual pass. No GPU runner is used.

## What changed and decisions

- Low-sun background and disc now use the existing Tidewater Hillaire scattering
  and solar-transmittance LUTs, which already light the ocean. No screen tint,
  new renderer, texture assets, lookup-table size, raymarch or extra render pass.
- Clear-air haze used to replace that solar sector with neutral gray. It now
  preserves directional low-sun radiance; opaque forecast weather stays neutral.
- Clouds reuse physical solar chroma in the existing immutable bake; warm light
  is localized toward the sun, with cooler subdued ambient away from it.
- Dry quartz sand gets broad diffuse sky fill through its actual albedo, normal
  and occlusion. Wet sand and lightning reflections retain their existing path.
- Orange crest plumes were primarily Spray's vertex-carried solar lighting:
  earlier foam fixes never reached vCol/vFwd. Relight both in the fragment only,
  using existing frame uniforms and reconstructed scalar scattering weights.
  Spray and BreakerLip vertices/dependencies stay on the proven path. Foam/lip
  diffuse illumination is also bounded away from red/yellow chroma at low sun.
  Physical gold Fresnel glints are retained; the old broad red-channel clamp
  was whitening them and is now limited to genuine magenta outliers.
- Night sky and distant ocean now converge to one air color before the far clip;
  the old dark fog constant caused the horizontal belt in the reviewed image.
- An opaque dawn deck previously retained the red direct key because its deck
  weight began above +1 degree. Close that key and supply gray-blue diffuse light.
- Kept the current physical atmosphere instead of adopting Takram's separate
  Three WebGPU/TSL atmosphere stack during a bounded color pass. Current Takram
  WebGPU docs describe work-in-progress integration; existing MIT credits remain.
- Four user photos were read as color references only. None entered app assets.
- Inspected genuine RC5 Inlet sunset/night/overcast-dawn and Cocoa sunrise photos.
  No new images are invented, edited, or substituted for RC6 device captures.

## Open issues

- RC6 colors and sustained FPS need the iPhone run. Local WGSL proves syntax /
  module validation, not Safari appearance or frame rate. New gate must include
  all low-sun phases and Share results; compare against the supplied Gulf photos.
- No physical browser is available in this work environment; no rendered preview
  was performed here. Do not claim a visual match or a fresh 30+ FPS pass.
- Signing/TestFlight and WeatherKit/RevenueCat owner account setup remain separate
  Mac/account tasks. Existing release documentation does not prove activation.

## Next steps

1. Verify the latest Sites deployment and its exact source SHA if resuming.
   The GitHub WIP handoff current section records the completed publication.
2. Run the linked 120-second gate on iPhone; use Share results after captures.
   Preserve saved results and receipts; never remeasure to conceal a capture failure.
3. Review the actual new JSON and original phase/weather/wave sheets. Narrow any
   further changes to observed color issues. Update this handoff at end of pass.

## Rules and invariants

- Work autonomously; concise updates and one link. Never commit/push GitHub main.
  Private Sites main is authorized. Never print or commit credentials/tokens.
- Freeze vendor `4811ba48d795197de5621985f404e765c0b7c0ef`, wave geometry/spectra,
  startup caching/retries, UI, camera, gestures, native astronomy and Share results.
  MIT credits: Tidewater and Takram. No advice / “safe” wording or crowd reports;
  estimates labelled est. with their source.
- v8.2 budgets unchanged: DPR 1.5 initially / 1.1 floor / 1.6 ceiling / .05 steps /
  38-down,46-up; FXAA, no flare; two GPU frames in flight; reused FFT at 40 Hz;
  crest 48×4, 12 lip vertices; 512×128 triple cloud cache, 256 idle / 2048 transition
  pixels, 18 primary + 3 shadow + 8 shelf steps, 20 s refresh; 384 rain particles.
- 15 s warmup then uninterrupted 120 measured seconds, EVERY second >=30 GPU
  completions. No upload/encoding/capture/share prep during timing.
- Local strict validation of all shipping WGSL before release. No GPU runner.
  Compile errors are nonretryable; disable only the failing optional effect,
  keep the ocean running; a degraded scene cannot pass the full-effects gate.
- Saved evidence DB `daybuoy-evidence-v1`, schema 2. Never clear earlier sessions.
  FPS uploads first, each immutable image/clip follows with acknowledgment.
  Retry pending bytes before new captures; null errors normalize without mutation.
  Four 8 s video parts, max 288×640, 12 fps, 600 kb/s; last includes paywall.
- Required every delivery: `node scripts/check-interactions.cjs` and
  `node scripts/build.mjs`, production build/check, hosting build/release guard.
  Seven checks: look, sun drag, timeline, pinch/reset, water sheet, Back to now,
  Watch pause. Keep source/data validity assertions; don't weaken a failing gate.

## Useful paths

- `NativeBeachScene.js`, `native-weather.js`, `weather-optics.js`,
  `weather-surfaces.js`, `layered-weather.js`, `cloud-cache.js` under ocean-proof/proof.
- `scripts/check-low-sun.mjs`: bounded color contract and functional byte freeze.
- `scripts/export-pipelines.mjs`: complete runtime inventory; checks both proven vertices.
- `scripts/check-pipeline-modules.mjs`, `check-pipeline-release.mjs`: strict local release.
- `results-upload.js`, `share-results.js`, `weather-fixture-page.js`: unchanged evidence.

---

## Archived handoff — historical only; do not follow over current section

## Historical: combined live gate — October 8, 11:35 PM Chicago

This section supersedes the diagnostic instructions below. New integration branch: `wip/tidewater-verdict-first`; main, `proof/tidewater`, and the existing WIP code branch stay untouched. The approved exact Verdict-first v1 is already in the Tidewater source. Do not merge the older September 30 `app-v2` UI over it. Reference: `ui-reference/daybuoy-reference.html`, exact `src/reference.css` and bundled Poppins fonts. Tidewater pin: `4811ba48d795197de5621985f404e765c0b7c0ef`. Integration starts from GitHub WIP `2e9aab0481200280ffcf0d70cb225a70268bcc48` / Sites source `0b253b18e47aa73a1417f4dcc7a577fb7b48c49d`.

Single device link: [live 120-second gate](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-live.html?gate=1). iPhone only; open directly in Safari. Auto-run 15 seconds warmup, then 120 seconds of completed-frame evidence with adaptive DPR 1.25–1.6 / FXAA / flare, actual current time, fresh live marine and NOAA tide. No forced noon/clouds. Screenshots and a 10-second scene-only clip follow timing; upload is automatic. The existing server endpoint still saves evidence to `results/` on `wip/tidewater-in-app`; each report identifies the integration branch/revision. On “ran it,” retrieve that branch's `results/latest.json` and folder. Token remains server-only.

The test pins its iframe, app and native layer to initial CSS dimensions. This overrides dynamic viewport units only inside the test, so Safari toolbars cannot change the render workload. Outer/visual viewport changes are logged; the FPS clock never restarts and slow/zero seconds are not discarded. Real output/DPR mismatches, missing adaptation, hidden pages and stale/incomplete data still reject the run. Normal product resizing and UI/scene/camera source are unchanged. Wake lock is requested and status/denial shown; it is not guaranteed in an embedded browser or under OS restrictions.

Verified uploaded device report: `results/2026-10-09T04-32-36Z-c9ead86e-d5da-48aa-8a9b-8c10e7cb8b15/report.json`. Forced-noon overcast-1 baseline: **55.8248788045 average, minimum 54, DPR 1.5, 20 seconds**; aborted later with `DPR/output dimensions changed`. Wake lock was denied. The slow regression did not reproduce; this does **not** prove heat/mirroring caused earlier runs and is not a 120-second pass. Overcast diagnosis landing page is retired; cheap-sky candidate is not promoted. No more ablations requested.

Verification required: all seven interaction checks; exact reference UI/fonts and pinned vendor preservation; actual capture handler with mocked toolbar resizes, adaptive steps, bad-DPR/output rejection and post-timing capture/upload order. This round has no new physical two-minute run or rendered UI verification.

## Historical: overcast speed regression diagnosis — October 8, 2026 (closed)

Jacob approves the smooth overcast sky, removed pillars, visible shore curl and neutral sand, but reports **6.7 FPS with DPR at 1.25**, versus his previous 42. No new raw device results were supplied here. Temperature and the responsible change are not established.

Open [overcast diagnosis](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-overcast-profile.html). Close Safari completely and cool the phone for 10 minutes first; run unplugged without mirroring or recording. One button runs the suite; `?run=1` starts on open. Results persist in the phone's local storage and can be copied or downloaded. There is no automatic server upload.

- Same freshly fetched live forecast, tide, sun and approved camera snapshot in every row; fixed DPR 1.5, FXAA, flare on and full High ocean detail. The timestamp/conditions are disclosed. Adaptation is intentionally disabled for fair isolation. Missing/stale marine/tide or changed dimensions cannot pass. Non-daytime/full-overcast conditions are flagged as not reproducing the reported scene.
- Cases: overcast-1, the exact pre-overcast renderer, deck off, oblique-surf adjustment off, exposure increase off, old-FOV control, lip-guard off, cheap deck, repeated overcast-1 and repeated previous renderer. Then cheap deck for 120 seconds. Each has 15 seconds warmup and 20 seconds measurement except the final sustained row. Expected total 8–12 minutes including compilation/loading. CPU draw time includes warmup and is synchronous native JS only; FPS counts asynchronous GPU completions, not submissions or encoder rate.
- Prior native deployment source is pinned to Sites commit `b29957b11d46a92416233f2f4bcf8e2c44610404`; overcast-1 is `9104aae084372722e6124c9c0995aaad45a639b7` (GitHub WIP `b355d9157176f83f98f8b82ea63e75ca716ba9bc`). The checked-in historical archive has SHA-256 `f0f7cdd7cf6ea7c01896492adabb00d516ed200b68abcf27e6336f346235a22e`. Packaging adds only pending-shore-worker telemetry to that old native evidence API; renderer/shaders are unchanged. The current parent camera/UI is byte-identical to the prior version except diagnostic routing. FOV did not change in overcast-1, so that row is honestly an identical-camera repeat, not an invented narrower view.
- Cheap deck is **diagnostic only**, not promoted to the ordinary app: preserve grey radiance/gradient, neutral lighting, exposure, shore curl and lip guard; remove at most 1.8% animated sky variation, and use uniform early returns to avoid computing discarded clear-sky radiance in reflections/environment at full daytime overcast. Dawn/night/partial-cloud paths remain. This removes known work but is not proof of the sixfold regression's cause or a 40-FPS recovery.

Validation: all seven automated interaction checks and full build; actual runner exercised with mocked DOM/GPU across all eleven rows, constant snapshot and historical reloads, partial-result persistence and dimension rejection; all ablations checked for isolation. Cheap native sky/stand/lip/reflection/environment-input shaders compile and submit on Dawn null (no pixels). Full upstream environment filtering still needs 18 KB workgroup storage versus this container's 16 KB limit. No rendered browser/phone clip or new FPS here. Main, frozen proof, pinned vendor, product UI and approved camera remain unchanged. Next: cool-phone JSON identifies the winning cut; target 40 average and at least 30 in every sustained second, followed by look approval before promotion.

## Live overcast correction — October 8, 2026

Jacob reports live data working at **42 average / 40 minimum FPS**, with 2.4 ft, roughly 4.4 s, 9 kt ENE wind and full overcast. This is user-reported evidence; no clip or raw JSON is attached in this turn. The five-item WIP correction is a review candidate, not a verified visual fix or a new phone benchmark.

- Full daytime overcast now uses a soft, bounded-direction grey deck (subtle broad variation, no binary cloud blobs). Its module is installed before environment compute pipelines compile, so visible sky, water reflection and the sand/stand environment probe share the same deck. Direct sun fades out at full daytime overcast, diffuse light becomes neutral, and daytime exposure increases by at most 12%. Clear, low-sun/night paths, sand pigment and water material are unchanged.
- Native-only lip geometry now rejects disconnected/out-of-bounds crest endpoints symmetrically and collapses invalid segments to a bounded point instead of the distant sentinel. This targets a possible source of vertical slivers; **without the clip, the reported horizon pillars are not diagnosed or confirmed removed**.
- Confirmed 2.4 ft maps to 0.36576 m H/2 and period remains 4.4 s. A CPU sample of ESE 112.5-degree swell showed upstream nearshore exposure around 0.23–0.34. The WIP shore-worker applies a bounded square-root energy-to-height interpretation in shallow water for shoreward oblique swell, preserving field phase, refracted direction, tide, offshore FFT and H/2. It is an open-coast modelling adjustment, not a validated nearshore wave-height calibration. Head-on and offshore cases are unchanged; no minimum fake swell is added. Phone confirmation of visible small breakers/whitewash remains required.
- [Live capture and gate](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-live.html): first **Measure FPS, then record 10 seconds**. Then **Run live 120-second gate** uses a 15-second warm-up and 120-second completed-frame window on fresh ordinary live conditions, not the fixed sunny profiler fixture. Every whole second must reach 30; average alone cannot pass. Recording is never active during this gate. It rejects stale/missing marine or tide data, backgrounding, changed viewport, wrong revision or post settings. JSON includes before/after evidence, conditions/DPR samples, all one-second FPS bins and pass/fail.

Validation: seven automated interaction checks; full build; overcast/light math; H/2 and period; phase/direction-preserving shore processing; full two-minute synthetic pass/fail accounting; real native sky/stand/overlay, shared environment/reflection sky-input and guarded lip shaders compile/submit on Dawn null (no pixels). Full upstream environment SH filtering needs 18 KB workgroup storage, above this container's 16 KB limit, and is not device-validated here. No connected physical iPhone: new 10-second clip and live two-minute gate remain pending. All 214 pinned vendor files, product UI/camera sources, main and frozen proof remain unchanged.

## Sunny midday sky and live phone evidence — October 7, 2026

Jacob reports **round 7 passed: 39.1 GPU-completed fps average over 120 s, minimum 33, zero seconds below 30**, with adaptive DPR rising from 1.5 to 1.6. He approves the screenshot pair's waves, foam, water colour, sand and DPR 1.5/FXAA sharpness. No raw round-7 JSON or images were attached here; these are user-reported performance and visual acceptance. Temperature was not measured. The remaining visual request is a brighter sunny midday sky matching the proof.

Native sunny midday now samples `atmosphereSkyLuminance` from the same existing Tidewater atmosphere LUT used by its proof and sky reflection shader. It blends in between sun-direction Y 0.35–0.65, fades out with cloud cover 0.2–0.7 and rain 0.05–1 mm/h, and is fully applied in the fixed clear midday fixture. DayBuoy's real sun/moon discs, sunrise/sunset and night palette, clouds and time-of-day changes remain. No water colours, wave shaders, foam, sand material or reflection-strength multiplier were changed. The upstream water already used its atmospheric sky radiance plus screen-space reflection; the old visible custom sky was a different calculation. This aligns the visible midday base with that radiance. Pixel matching and performance of this new sky still require the phone.

The ordinary app already forwards current/selected real forecast height, period, incoming direction, wind and NOAA tide to the native ocean. `forecast.js` maps height to H/2 metres, period to shore/swell frequency, directions into scene coordinates, knots to wind speed/chop, and metres MSL to sea level. FFT energy is still a relative height mapping, not a measured Hs calibration. Existing real-clock phase remains. A new full-app test exposed that ordinary home still selected the older resting view, despite the approved beachPose being available for time exploration/Watch. The native adapter now routes only its ordinary unheld home view through the existing approved target/easing; user look, camera reset, sheets and Watch retain their original priority. Fixed profiling/capture retains its comparison camera. Tests exercise changing synthetic live marine rows, the approved midday position/FOV, manual look and the water-sheet camera. Original camera/gesture/UI/astronomy/forecast source files remain byte-identical; only the native adapter's default dispatch changes.

The fixed screenshot page loads `review=1` and deliberately skips live weather/marine refresh. Its fixture source is not classified as a live forecast, so the existing app UI shows Offline / Forecast paused. That banner is intentional there, not evidence of a failed fetch. An explanation/link is added on the separate comparison page; the product banner is unchanged. Ordinary fetch failures and cached data remain disclosed normally. A server-side run of the actual app loader at **2026-10-07T19:08:32.792Z** returned all five feeds fulfilled (weather, marine, air, NOAA tide/hourly and high-low): roughly 2.02 ft, 3.6 s, direction 81°, wind 9.57 kt, tide 0.048 m MSL, cloud cover 100%. This verifies that request path from this environment only, not iPhone Safari. The phone uses its freshly loaded values, never this snapshot.

Open [live phone recording](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-live.html). It embeds the ordinary live app with the existing debug FPS badge, with no review date, fixture or camera override. **Measure FPS, then record 10 seconds** waits through 15 s warm-up, counts confirmed GPU frames for 20 s without recording, then exports a 10-second device-canvas clip and conditions/FPS JSON. Fresh live data and a valid NOAA tide are required; sample/saved/stale data or missing tide cannot masquerade as current conditions. Encoding rate is not performance FPS. If Safari cannot encode that canvas, use iPhone Screen Recording on [the live app](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/?ocean-debug=1); the separate measured FPS download remains available. No physical iPhone is attached here, so no new phone clip or FPS is claimed. Today's fetched cloud cover was overcast; use [the fixed sunny pair](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-proof/proof/native-compare.html?profile-pass=native-pipe-combo&profile-dpr=1.5&profile-aa=fxaa&profile-flare=1) to review the specific midday sky change.

Also corrected diagnostic initialization: `BeachApp.profileConfig` is now parsed in its constructor, before native-scene selects the loop/adaptation/post settings. Previously it was only assigned inside async init, allowing initial choices to fall through to production defaults. Ordinary and round-7 settings stay the same; explicit fixed-DPR captures and historical diagnostics now take their requested settings from startup. A real-constructor test guards this order. Profiler revision `2026-10-07-sky-1` distinguishes this sky revision from the accepted prior run.

Verification: required seven interaction checks and full build, unchanged-source checks, live adapter/approved-camera tests, actual constructor configuration, stale/missing-tide guards, completion-before-encoding accounting and recorder cleanup. The revised atmospheric sky/celestial/stand/overlay pipelines compile and submit on Dawn null, which produces no pixels. These are automated tests, not phone evidence. Next: phone clip + JSON at real conditions, sunny sky pair review, then the existing 120-second gate for this revision. Main, frozen proof, 214 pinned MIT vendor files and product UI remain unchanged. No credentials belong here.

## iPhone round 7 — October 7, 2026, adaptive production resolution

Jacob reports round 6 at DPR 1.5 + FXAA + lens flare on: **36.5 GPU-completed fps average over 120 seconds, minimum 28, seven seconds below 30**. No raw round-6 JSON or phone images accompanied this request. The strict every-second gate remains unmet. Reported DPR-2 drift from 25 to 23 does not establish device temperature.

By explicit user instruction, the ordinary native WIP now starts at **DPR 1.5, FXAA, flare on** with full High ocean detail. This supersedes the earlier DPR-2/TAA default restriction. Adaptive resolution counts confirmed GPU completions in consecutive one-second windows: below 32, lower by 0.05 toward 1.35; if cadence stays low, continue to the hard floor 1.25. Above 38, raise by 0.05 up to 1.6. At 32–38, hold. It changes no wave, foam, spray, refraction or scene settings. At most one resize is pending. New submissions pause until the existing window empties; resize never destroys targets used by outstanding frames. That pause stays in measured FPS. WaveClock continues real elapsed time; the next camera packet restores the approved projection after resize. The two-frame pipeline and asynchronous readback throttles remain.

Open [the profiler](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-profile.html) and choose **Run round 7 · adaptive · 2 minutes**. It uses the same sunny 3 ft / 8 s / zero-tide fixture, 15-second warm-up and 120-second measured window. Schema 7 / revision `2026-10-07-adaptive-1` records every whole-second completion count, seconds below 30, actual DPR range, each change and triggering FPS, empty-window resize evidence and dimensions checked for every submitted frame. Every whole measured second must have at least 30 confirmed completions; average alone cannot pass. Old diagnostic cases retain fixed settings and their existing rejection checks. Background interruption or viewport change rejects the run. No physical iPhone is attached here, so the round-7 device gate remains pending.

Use [the fixed phone capture link](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-proof/proof/native-compare.html?profile-pass=native-pipe-combo&profile-dpr=1.5&profile-aa=fxaa&profile-flare=1) separately from measurement. It holds the same ocean state and wave time for DPR 1.5 / FXAA / flare-on native and DPR 2 / TAA / flare-on embedded reference. Adaptation is disabled during capture. The embedded reference uses the proof sky with WIP white-sand terrain; it is not a screenshot of the [frozen external proof](https://daybuoy-ocean-proof.jacobcarroll51.chatgpt.site). No actual screenshot pair or visual acceptance is claimed. Review pixels on the phone before accepting the look.

Verification covers strict thresholds, zero-completion windows, both bounds, idle-only resize, dimension audits, unchanged fixed-case routing, and synthetic two-minute accounting that retains an injected slow second despite a high average. Seven interaction checks and the complete build are required before delivery. These checks do not establish iPhone performance or pixels. Product UI, camera/gestures/astronomy, main, frozen proof, all 214 pinned Tidewater MIT vendor files and labelled fallback remain unchanged. No API keys or passwords belong in this handoff.

## iPhone round 6 — October 7, 2026, bounded production pipeline

Jacob reports round 5: clear-only 60, native without the one-frame gate 27.4, readbacks plus gate removed 28.5, final queue drain about 134 ms. No round-5 JSON or screenshots accompanied this turn. The ungated rows counted rAF submissions, not GPU completions. They support removing serialization; the drain is evidence of backlog, not an isolated GPU execution time or proof of 30 fps.

The ordinary native WIP now permits at most **two submitted, unconfirmed frames**. Draw/rAF does not await GPU completion. One asynchronous queue-fence observer records a submission watermark, retires only frames covered by that resolved fence, and releases capacity; a third submission is skipped until space exists. No unbounded render queue or frame-count wave clock. The debug FPS counter counts confirmed frames in its trailing window. Queue failures use the existing labelled fallback. Forecast-driven shore-field uploads still use their occasional resource-transfer fence; there is no new per-frame blocking readback.

WaterQuery's GPU kernel and current GPU height buffer still update each rendered frame. Its asynchronous CPU staging copy/mapAsync is requested at most once per four rendered frames, using cached CPU height between completions. Atmosphere readback is asynchronous and limited to once per 250 ms in addition to its upstream scheduling. GPU query producers and ocean shaders are unchanged. Default DPR 2, TAA, flare and High detail remain; only the loop/readback policy is promoted. Previous diagnostic routes retain their original one-frame/ungated behavior for comparisons.

**Run round 6 · pipelined** at [the profiler](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-profile.html). With 15 s warm-up each: 20 s at DPR 2 → 1.75 → 1.5 → FXAA at DPR 2 → flare off at DPR 2 → DPR 2 repeated. Then measure a suggested combination for 20 s. Selection uses the highest DPR already recording at least 30 completions in each second, otherwise the fastest tested DPR; FXAA/flare changes require over 3% average gain against the repeated baseline. This heuristic selects a candidate to measure, not a globally best or visually accepted combination. Among measured candidates, prefer the sharpest/least-changed one holding 30, otherwise the fastest; rerun that candidate for **120 seconds**. A separate button tests production DPR 2 for 120 s. Visual settings are never promoted automatically.

Schema 6 / revision `2026-10-07-pipeline-1`: `gpu-completed-pipelined` counts exact confirmed submission IDs at asynchronously delivered fence notifications. It records completed counts in every whole-second bin, notification gaps, maximum batch size, CPU callback time, actual AA/flare/DPR and observed in-flight maximum. Completion notifications can batch frames; their p95 gap is explicitly not an individual GPU frame duration. Acceptance requires at least 30 confirmed completions in every whole second of a 120-second window, plus average at least 30; display scanout and visual acceptance remain separate. Final draining does not add frames to the measured window. The runner rejects wrong settings, unbounded/submission-only results, geometry/DPR changes and background interruptions.

After the sustained row, **Capture tested candidate / proof pair** opens the exact tested settings. Capture drains the production window first, then holds the wave clock, stateful surf and exposure. Left is the embedded reference at DPR 2/TAA/flare; right is the tested native candidate. Both panels use the same logical size, with native source resolutions labelled. Settings and projection are restored on success/failure. This is still an embedded proof reference with WIP terrain, not a capture of the [frozen proof deployment](https://daybuoy-ocean-proof.jacobcarroll51.chatgpt.site). The original proof comparison and phone image review remain outstanding.

Verification: seven interaction checks and full build pass; delayed GPU-fence tests verify the two-frame bound, exact counts, drain/error behavior, readback spacing, sustained-window accounting and adaptive runner routing. Capture orchestration verifies equal clock/state and restoration with mocked pixels. A separate Dawn null check completed 64 real WebGPU queue submissions with exact counts and a two-frame maximum; it produces no pixels or device FPS. No physical iPhone, new measured device FPS or screenshot pair exists here. Next: Jacob runs round 6, exports JSON and captures the selected candidate; reject visual regressions and accept no 30-fps claim before that device evidence. Main, frozen proof, product UI and all 214 pinned MIT vendor files remain unchanged. No API keys or passwords are recorded here.

## iPhone profiling round 5 — October 7, 2026, frame scheduling

Jacob reports round 4 at about 19.98 fps / p95 52 ms for every native variant, including lower DPR, FXAA and flare off. The round-4 JSON and phone images were not attached; these are reported aggregates, not newly measured evidence. Resolution invariance suggests a shared limit but does not establish its cause or GPU headroom.

Source finding: both the native app and embedded proof allow only one frame in flight, waiting on `GPU.queue.onSubmittedWorkDone()` before accepting another rAF render. This is a scheduling gate as well as a measurement fence. Native CPU readbacks are WaterQuery (camera height) and Atmosphere (irradiance); their staging copies/mapAsync are asynchronous, and there is no active timestamp/occlusion profiler. The fixed forecast disables the separate shore-worker texture-upload fence. These are suspects, not a proven explanation for 20 fps.

**Run round 5 · loop** at [the iPhone profiler](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-profile.html). Sequence: native baseline → clear-only with original GPU gate → clear-only without gate → native with CPU readbacks AND gate removed → native with only gate removed → repeated baseline. Every row uses DPR 2, 15 s warm-up and 20 s measurement. Clear-only submits one color clear through the same device/canvas and parent callback; it retains parent scene/UI CPU work and allocated native resources. The extra clear-only rAF row separates the gate from the rest of that loop.

Readback-free mode primes the fixed scene for 3 seconds, then suppresses both staging-copy/mapAsync request sites. It retains the GPU height/irradiance kernels and uses cached CPU lighting/height; it is a diagnostic, not an approved appearance change. Pending readbacks after warm-up reject the case. The gate-only row keeps normal readbacks, so comparing it with the readback-free row isolates the extra removal. No per-frame completion fence is registered in either rAF mode; one final queue drain records backlog before returning results.

Schema 5 / revision `2026-10-07-loop-1` labels `gpu-completed` separately from `raf-submitted`. Submission FPS cannot satisfy the two-minute acceptance gate. Each native case reports parent rAF cadence, skipped render opportunities, synchronous parent callback CPU mean/p95/max and native draw/encoding CPU subset, readback request counts, and final drain milliseconds. CPU measurements exclude async callbacks, workers and GPU execution. A large drain means queued work; higher submission FPS alone is not higher GPU/display cadence. Output/DPR, visibility and source checks remain enforced; only the explicitly clear-only cases permit absent geometry.

Ordinary rendering, default quality, ocean shaders, real-clock timing and product UI are unchanged this round. Seven interaction checks, complete build, delayed-fence/readback/CPU accounting tests and actual app callback routing pass. These are CPU/source checks, not iPhone results. No phone/proof screenshot pair or new device FPS exists in this environment. Use [the capture page](https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-proof/proof/native-compare.html) separately; its reference is the embedded proof, not the [frozen original proof](https://daybuoy-ocean-proof.jacobcarroll51.chatgpt.site). Next: Jacob runs round 5 and returns JSON; identify the limiting path from measured cadence, CPU and drain, then test one ordinary-loop change for 120 seconds with the required images. Keep main/proof untouched and no credentials in this document.

## Native scene candidate — October 7, 2026

Jacob reports round 3: embedded proof alone 20.0 fps at DPR 2 with TAA/flare, hybrid host 12.1–12.8, all host cuts 16.2. The actual round-3 JSON was not attached in this turn; do not invent its per-row timings or thermal evidence. Existing `night-report/iphone-round2.json` remains the prior supplied raw evidence. These numbers motivate removing interop; they do not establish that the native DayBuoy scene will reach 20 or 30 fps.

The WIP default now selects a CPU-only Three camera/interaction host plus one native Tidewater WebGPU scene. No legacy renderer, wave mesh or WebGL context is constructed on successful native startup. No host layer render, external canvas upload or OceanComposite runs. The iframe remains a code boundary, not a second rendering context. Tidewater's internal refraction/depth copies, environment, shadows and postprocessing remain; “no copies” refers specifically to the removed cross-renderer host images.

New native scene: shared white-sand terrain and original water; directional DayBuoy sky palette; NOAA sun/moon directions and geometric lunar illumination; forecast cloud layers; an empty stand; native geometry for the existing solar arc and rain rings. Original camera, gestures, story, astronomy, forecast and all UI source files are byte-preserved. Native cloud shapes are a new procedural port, not a pixel-identical reproduction; sky grading, night/storm/cloud appearance, stand placement and solar presentation require device review. Catalogue stars, airborne sand and rain streak overlays are not yet ported. The requested fixed sunny fixture is the acceptance scope of this first scene pass; full-weather visual parity is not claimed.

All 214 vendor files and the full High ocean systems remain unchanged. Default native output is locked to DPR 2, TAA and lens flare, with no automatic quality reduction. Elapsed-time WaveClock is retained. Unsupported WebGPU uses the original labelled water; actual initialization/device loss lazily activates the original WebGL renderer with the existing camera and forecast. Old profiling cases still explicitly select the hybrid path for historical comparisons.

**Run round 4 · native** at `/ocean-profile.html`: native DPR 2 → DPR 1.75 → DPR 1.5 → FXAA at DPR 2 → flare off at DPR 2 → native DPR 2. Each case changes one setting, retains full ocean detail and records actual AA/flare/output settings with 15 s warm-up / 20 s measurement. Separate **Run native · 2 minutes** checks the sustained baseline. Schema 4 / revision `2026-10-07-native-1`; prior suites remain available. No phone result or accepted combination exists for this candidate.

`/ocean-proof/proof/native-compare.html` captures a pair on the actual device, holding the ocean state and wave clock. Left uses the embedded proof's native sky with the WIP white-sand terrain; right restores DayBuoy's native surroundings. It is explicitly NOT a capture of the frozen external proof deployment. Post history re-resolves, exposure/stateful surf are held, and capture runs separately from FPS measurement. No image has been generated in the agent environment; the exact frozen-proof comparison remains outstanding.

Automated verification: seven interaction checks, complete build, real Three camera projection, complete app startup/scene updates with zero WebGL context requests, profiler routing/independent settings and vendor/UI preservation. New native sky, celestial, stand and overlay pipelines validate on Dawn null with real draw submissions; it produces no pixels. Full native GPU validation still exceeds this environment's upstream adapter limits, and browser/iPhone visual/FPS verification is unavailable. Next: Jacob runs round 4, captures the pair and returns results. Keep main and the frozen proof untouched; revert an observed visual regression before accepting an optimization. No API keys or passwords belong in this handoff.

## iPhone profiling round 3 — October 7, 2026, host diagnostics

Jacob's supplied round-2 JSON is retained at `night-report/iphone-round2.json` (run `2026-10-07T04:48:52.202Z`). Baselines were 12.30, 12.30 and 12.54 fps; atlas 12.33; DPR 1.0 18.93; DPR 1.5 14.00; all-ocean-off 12.48; grid128 12.52; lower LOD 12.79. Every reported ocean/output dimension matches the requested DPR. Atlas offered no measurable benefit and is not promoted into the ordinary app. No 30 fps result exists.

The all-off row did not disable the complete Tidewater renderer: native terrain, atmosphere, shadows and post remained, along with DayBuoy's layer draws/copies. Source inspection also found that the legacy fullscreen background (`renderOrder=-100`) still shades old water inside `backgroundFragment`, despite the old displaced mesh being hidden. Thus these results identify substantial retained work; they do not yet prove which renderer is the bottleneck or that all wave-related math is cheap.

**Run round 3 · host** on `/ocean-profile.html` runs baseline → proof alone → second layer removed → shadows off → background baked/atmosphere frozen → post/composition bypass → all four cuts → baseline. All six new rows retain the native ocean, High wave settings and DPR 2, with 15 s warm-up / 20 s measurement. Schema 3 / revision `2026-10-07-host-1` reports exact scopes, native post settings, cut flags and ocean/lip/spray visibility; stale revision, viewport/DPR/output mismatch, hidden ocean geometry or background interruption rejects the case.

- Proof alone loads the embedded native proof's actual `frame.html`/`tidewater.js` directly; it never loads the DayBuoy app document. It retains native terrain/sky and original proof post defaults, so AA/flare settings are recorded rather than concealed. The external frozen proof branch/site remains untouched.
- Single-layer removes the legacy foreground draw and its upload. The empty transparent overlay removes sun/path/weather foreground graphics in this diagnostic. The base draw/copy and all native ocean work remain.
- Shadows uses native SunShadows' enabled switch, which skips cascade updates/draws and shadow texture sampling, and disables WebGL shadowMap. Procedural/analytic background shading is still present.
- Sky bakes the original fullscreen background once at full resolution and replaces that expensive material with a texture lookup. The baked image includes sky, sand and the old-water background shader. Native atmosphere LUT/irradiance updates prime once in the fixture then freeze. Other scene objects, both host copies, reflection refresh and all ocean work remain.
- Post bypass replaces native PostFX rendering and the final mask/overlay composite with one direct scene HDR-to-display tone-map pass. It retains camera/target preparation, host draws/copies, native scene rendering and refraction; overlays and full post effects are absent. All-cuts combines exactly these four switches. These images deliberately differ and are diagnostic only.

Source/runtime tests verify each cut's isolation, one-time bake, preserved ocean update functions, disabled shadow uniform behavior, direct-proof routing and rejection conditions. The seven interaction checks and complete build pass; modified compositor/presentation pipelines validate on Dawn null, which renders no pixels. Full native GPU/device and WebGL bake pixels remain unverified in this environment. No new phone FPS, screenshot pair, or visual acceptance is claimed. Next: run round 3 on the phone and return JSON before selecting a structural optimization. Main, UI files, elapsed-time clock, fallback and MIT credits remain unchanged.

## iPhone profiling round 2 — October 7, 2026

This section supersedes the older "no per-pass phone results" statements below. Jacob supplied a real iPhone Safari run at 390×689, DPR 2, sunny 3 ft / 8 s / zero tide. Baselines were 12.82 and 14.08 fps (p95 90 and 85 ms); freezing only imported image copies reached 19.97 fps (p95 52 ms). Both legacy scene-layer draws remained active in that diagnostic. Copy/interop is the clearest measured lead; this does not isolate redundant rendering or prove wave work negligible. The ~10% baseline spread prevents confident ranking of the smaller gains and does not establish phone temperature. Swash is excluded from like-for-like comparison: its final output fell to 624×1102 despite the native ocean retaining 780×1378.

The published runner adds **Run round 2**: baseline → one-transfer candidate → baseline → DPR 1.0 → DPR 1.5 → all-ocean-off → 3×128 FFT → lower mesh LOD → baseline. Each is independent, with 15 s warm-up and 20 s measurement. Separate buttons measure a two-minute baseline or candidate. Schema 2 / revision `2026-10-07-atlas-1` rejects stale results and checks native AND final-output dimensions every submitted frame. The profiling-only legacy resize wrapper prevents the former silent drop to DPR 1.6. The ordinary app remains unchanged pending acceptance.

One structural candidate only: `profile-pass=atlas` draws the original two full-resolution layers into scissored halves of one WebGL drawing buffer, then transfers it to WebGPU once. Both required layer draws and the same total source texel count remain. It removes a transfer/synchronization point, not all rendering or bandwidth cost. There is no smaller wave grid, cheaper lighting, reduced spray, reduced DPR, or stale-frame reuse in this candidate. Final output remains DPR 2. Atlas edge clamping preserves each layer's sampling boundary; phone pixels are not yet verified.

Diagnostic grid128 uses a reproducibly generated MIT derivative outside the untouched vendor tree: 128-point / seven-stage IFFT, three cascades, eight mip levels, adjusted midpoint strides and sampling footprints. CDLOD-only changes range factor 2.5→2.0, retaining tile size and all other budgets. All-ocean-off hides water/lip/spray and stops their associated simulation/lighting updates; it retains the legacy scene/copies, terrain, atmosphere, shadows and post/composition. It measures that retained pipeline's floor, not an empty frame.

Automated verification: all seven interaction-contract checks, source preservation, round-2 isolation/resize/order tests and complete build pass. Baseline and atlas compositor WGSL/pipelines validate on Dawn null. Derived FFT WGSL validates; complete FFT dispatch validation is blocked by that adapter's four-storage-texture limit versus five required by the upstream mip-A design. Null renders no pixels. No physical iPhone is attached, no new phone FPS or proof/candidate screenshot pair exists, and the 30 fps / two-minute acceptance gate remains unmet. Main and the standalone proof are untouched; MIT credits are retained. Next: Jacob runs round 2, returns JSON and phone images; reject the candidate if the look regresses, and combine no settings before measurement.

## iPhone profiling round — October 6, 2026, 9:38 PM request

Work continues only on `wip/tidewater-in-app`. The standalone proof and GitHub main are unchanged. Entry point: `https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ocean-profile.html` after this round's publication.

This round adds opt-in instrumentation, not an appearance/performance optimization. The ordinary app keeps its existing quality selection and scene. The diagnostic fixture locks the resting proof camera, sunny 3 ft / 8 s / zero tide / 8 kt conditions, High detail and DPR 2. It excludes 15 seconds of warm-up, measures each ablation for 20 seconds, and repeats the baseline at the end. A separate baseline run measures 120 seconds. It aborts on backgrounding, renderer failure or changed viewport; JSON includes backend context, resolution, settings, average completed-frame cadence, lowest whole one-second count, p95/p99 frame intervals and longest frame. This is not display scanout measurement or an isolated GPU timestamp profiler.

The runner distinguishes FFT updates, shore evaluation in shaders, surface foam shading, spray, swash updates, the refraction render, transparent surf draws, reflection shading/cubemap refresh and cross-context image copies. Scope is recorded in every result. Several systems share computations and affect pixel coverage; ablation gains are not additive. The spray switch keeps the shared crest-update kernel, so the lip still moves. Normal profile settings never reduce resolution automatically.

Latest user-reported measurements supersede the older evidence inventory below: laptop 42 fps at 780×1688; iPhone approximately 6 fps at full resolution and 5–19 fps at 390×689–487×861 with blur. These are reports supplied in the takeover request, not measurements made by this round. There are no per-pass phone results, new phone screenshots or accepted 30 fps / two-minute run yet. A physical iPhone is not connected to the agent environment. Do not infer the largest costs from source or these aggregate measurements.

Source/CPU checks verify the diagnostic branches, real upstream shader-source transformations, switch isolation, elapsed-time statistics including stalls, and unchanged UI/camera files. The seven required interaction checks and build pass. The available Dawn null backend cannot run the whole native renderer: its 16 KB workgroup-memory limit is below the upstream 18,432-byte environment kernel, and its resource limits also reject existing pipeline layouts. This backend renders no pixels. Browser/phone render verification and same-moment proof comparison remain pending.

Next: Jacob opens the profiler in iPhone Safari, runs pass comparison and returns the exported JSON. Rank measured costs with the repeated baseline to account for drift, make one optimization, then collect matching phone/proof images and repeat the two-minute test before accepting it. Do not change the UI or wire new forecast behavior during this diagnostic round.

Updated October 6, 2026 (America/Chicago). This handoff supersedes older status notes. No application code was changed for this export. Use branches only; no tag was created. Do not merge either branch into main without Jacob's approval.

## Repository and checkpoints

Repository: https://github.com/jcarroll44/ocean

| Branch | Contents | GitHub code-snapshot commit | Original Sites source commit |
| --- | --- | --- | --- |
| `proof/tidewater` | Deployed standalone Tidewater proof: native ocean, 1/3/5 ft comparisons, phone quality controls, elapsed-time wave clock, diagnostics and recording controls. This is the separate laptop-reference proof, not the in-app compositor. | `132a0137c1875b3e7633794be2038a1864f24fa8` | `124632669171841898300055efaa26a333d0619d` |
| `wip/tidewater-in-app` | Current night-pass app: exact Verdict-first UI reference and native Tidewater ocean composition over the retained DayBuoy surroundings. Unapproved WIP; visual and phone acceptance remain outstanding. | `cedbf01f291953995f61d6dbefa63e6fe861bb56` | `a0a6c778c489fbea02a077136dace2859b972e1b` |

The final branch heads are documentation/archive-only children of these code snapshots. Obtain their current hashes with `git rev-parse HEAD` or `git ls-remote origin refs/heads/proof/tidewater refs/heads/wip/tidewater-in-app`. The code-snapshot trees exactly match their respective original Sites trees: proof `f426b4d8f4073d4c2cd7dab4fd9781d970549c58`, WIP `7d237b870dea5a88983348b01866b42eedee5656`.

GitHub main was `e7cdb9194b1a1df6f9e6beee16e85a7014097a46` at export; it was not moved. GitHub app-v2 remains `ce9fd044b535095fa230e3a482d2a50d847ab33b` (the GitHub parent used for both exported snapshots). The separate main Sites app remains at `30826de2b421b6fae157e69374433aa0fb75b701`. These are different repositories/checkpoints; do not confuse their hashes.

## Live previews

- Standalone proof: https://daybuoy-ocean-proof.jacobcarroll51.chatgpt.site
- Current in-app WIP: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site
- WIP diagnostics: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/?ocean-debug=1
- WIP UI reference comparison: https://daybuoy-night-pass.jacobcarroll51.chatgpt.site/ui-review/
- Unchanged main app: https://daybuoy-app-v2-preview.jacobcarroll51.chatgpt.site

These are existing deployments, not newly published by this handoff. The standalone source is the deployed proof checkpoint; the historical laptop recording was not mapped to a separate exact commit in the available evidence. Do not claim a newer device or visual approval.

## Goal and boundaries

Open the app and quickly see your beach and whether to go. Jacob wants Tidewater's actual ocean and wave forms only, with DayBuoy's own beach, sky, sun/moon, approved beachPose camera, gestures and UI. A Tidewater island/scene replacement and the old two-formula wave approximation were rejected. Keep the current app and the proof distinct. Main stays untouched.

Read `INTERACTION-CONTRACT.md` on the WIP branch before further work. Scene drag looks around and never changes time; only the sun target, dock track, sheet curves and Watch change time. Preserve the approved Watch choreography and NOAA astronomy. No unlabelled fabricated forecast, no human/crowd reporting, no beach-vending/booking work. Never describe conditions as "safe". Estimates retain their labels and methods.

## Upstream pin and licensing

- Tidewater: https://github.com/dgreenheck/tidewater
- Pinned revision: `4811ba48d795197de5621985f404e765c0b7c0ef`.
- MIT, copyright 2026 DRG Software Solutions LLC. Retain LICENSE and CREDITS; the app exposes credits through Waves → source details → Open-source credits.
- All 214 retained upstream files match the recorded integrity hashes. Proof vendor path is `vendor/tidewater`; WIP vendor path is `ocean-proof/vendor/tidewater`.
- Native systems are OceanFFT, WaterSurface/WaterMaterial, ShoreWaves, Breakers, SurfFoam, ShoreSim and Spray. The separate TunedSpray adapter changes GPU slot budget, dispatch/draw counts and ring wrapping; it does not substitute a CPU spray system.
- The retained public upstream `SkyProClouds.js` is covered by Tidewater's own repository licensing/credits. No separately purchased Water Pro or Sky Pro package was supplied or added. Never publish separately licensed proprietary package source.

## Phone evidence — measured versus implemented

Only one physical-iPhone result is available: Jacob reported Safari WebGPU at approximately **6 fps, 1170 × 2532**, equivalent to DPR 3 for 390 × 844. Other settings for that run were not captured. The laptop appearance was liked, but that is not phone-performance evidence.

No subsequent physical-iPhone retest result, sustained 30 fps for two minutes, or completed ten-second phone timing clip is available. The following settings are implemented and CPU/source-tested, not individually benchmarked on an iPhone:

| Level | Preset | DPR cap | Wave CDLOD range factor | Active spray slots | Refraction scale | Environment refresh | Cloud buffer scale | iPhone result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | High | 1.5 | 2.5 | 32,768 | 0.5 | 3 s | 1.0 | Not retested |
| 1 | Balanced+ | 1.5 | 2.0 | 16,384 | 0.4 | 4 s | 0.85 | Not retested |
| 2 | Balanced | 1.25 | 1.75 | 8,192 | 0.3 | 5 s | 0.70 | Not retested |
| 3 | Phone | 1.0 | 1.5 | 4,096 | 0.25 | 6 s | 0.60 | Not retested |
| 4 | Low | 1.0 | 1.2 | 2,048 | 0.2 | 8 s | 0.45 | Not retested |
| 5 | Minimum | 1.0 | 1.0 | 512 | 0.125 | 12 s | 0.30 | Not retested |

Effective DPR is the smaller of device DPR and the preset cap. At 390 × 844, caps 1/1.25/1.5 correspond to approximately 390 × 844 / 488 × 1055 / 585 × 1266; read the actual framebuffer dimensions in the overlay because rounding and viewport size vary. Internal extra render scale remains 1. Phone reflection cubemaps are 64²; desktop 128². The original four 256² FFT cascades, 32-cell LOD tiles, 768² swash and breaker geometry remain. Quality reduces LOD range, spray, refraction/environment budgets and cloud resolution instead of removing the breaking system. In-app `noClouds=1` disables Tidewater's visible cloud pass, retaining DayBuoy's visible sky.

Auto starts at Balanced on phones and High on desktop. It uses completed GPU submissions in a trailing three-second window, drops for a severe miss below 24 fps or two below-30 windows, waits for settling and reports an unmet target at the minimum. The standalone host uses a four-second settling interval; the in-app host checks quality approximately every five seconds after warm-up. GPU-completion rate is a diagnostic, not proof of displayed smoothness, thermal stability or touch latency.

The frozen standalone proof contains a **20-second benchmark**. The newer embedded proof inside WIP extends that to **120 seconds** and records rolling-window minimum FPS. Do not describe the frozen proof's old button as a two-minute test.

The WIP embedded proof adds same-moment full/tuned captures. Full uses High ocean detail and native DPR up to 3; both phone captures retain the 64² reflection cube. Wave time and stateful swash/whitewater updates are held. Spray buffers reset on budget changes, so individual spray particles are not identical. No full/tuned phone stills were obtained; inspect curl, foam and clear shallows before accepting a preset.

## Clock, forecast and physical calibration

The original loop lost elapsed time under GPU backpressure and clamped frame delta to 0.1 s. WaveClock now derives absolute wave phase from `performance.now()` and seeds both G.time and FFT.time. Simulation integration delta is bounded to 0.25 s for particle stability during stalls; absolute wave phase keeps real time. CPU tests cover 1/6/15/30/60/120 fps and backpressure: an eight-second phase takes eight real seconds. This has not yet been confirmed with the requested phone recording.

The ten-second recorder uses actual rendered frames at 390 × 844 and overlays elapsed clock, wave phase, quality and resolution. It chooses MP4 when supported, otherwise WebM; use native screen recording if canvas recording fails. Encoding adds load: run FPS benchmarks separately, foregrounded, without recording.

The WIP forecast adapter maps wave height in feet to metres and amplitude H/2, plus period, incoming wave direction, wind/chop and tide. Source/CPU unit checks pass. FFT energy remains a relative mapping, not a validated significant-wave-height calibration. Controlled 1/3/5 ft inputs are tests, not measured field conditions. The physical beach slope is 0.105; upstream swash retains a nominal internal 0.066 slope. The visual/physical mismatch remains open. WIP's separate sugar-white adapter changes dry-sand pigment toward #EFEBE2, preserving original wetness/lighting logic; the frozen standalone proof predates that addition.

## Current in-app implementation and known issues

`src/ocean-layer.js` automatically loads `ocean-proof/proof/ocean-only.html?noClouds=1&quality=auto` on supported WebGPU browsers. It forwards the original camera transform/projection and selected forecast every native frame. The original scene supplies sky, celestial objects, beach and weather overlays; its old displaced water and spray are suppressed when native rendering is active. `OceanComposite.js` replaces ocean coverage only. Original WebGL framebuffer alpha changes from false to true in a build adapter for transparent composition. The native ocean uses DPR 1–1.5; final composition retains the original sky/land dimensions. Share capture selects the displayed native canvas.

- **Appearance remains unverified:** native cross-context canvas copying, coverage boundaries, transparent foreground composition, night/storm rendering and share output need a real WebGPU browser review. Source tests cannot prove that these pixels look correct.
- **GPU validation limits:** new background/final WGSL pipelines compile on the Dawn null backend, which renders no pixels. The complete ocean check is blocked by this environment's 16 KB workgroup-memory limit versus 18,432 bytes required upstream, and its 16 sampled-texture limit. No features/limits were disabled to manufacture a pass.
- **Phone performance remains open:** startup time, sustained 30 fps, memory use, thermals and quality changes were not measured on the device. This is the first acceptance gate, before more visual tuning.
- **Lighting calibration:** native water radiance still uses Tidewater atmospheric lighting with supplied sun/moon direction and cloud cover. Visible sky stays DayBuoy's. Their visual match has not been checked.
- **Fallback is deliberate and disclosed:** unsupported/failed/lost WebGPU keeps the standard WebGL ocean and forecast with a visible `Standard ocean · Tidewater unavailable` message. Native loading or missing marine data has a status. Scrubbing, story, night and storms do not deliberately switch back to old water. Diagnose backend first if old waves appear.
- **Diagnostics:** native startup shows a six-second acknowledgement; `?ocean-debug=1` keeps backend, resolution, FPS and preset visible. `window.__tidewater` exposes pin, metrics and errors. This is diagnostic disclosure, not a claimed phone result.
- **Exact UI journey issue:** the selected-day reference replaces Play with Back to now, so there is no visible selected-day → Watch starting button. This requires a design decision; do not silently invent another control.
- **Reference validation scope:** CSS and fonts match the supplied reference; six-state binding tests pass. No physical-iPhone screenshots, ≤2 px rendered match or full-journey video has been established.
- **Old documentation:** older round files describe superseded UI/camera/water states. Use this handoff plus the latest interaction-contract addendum and OCEAN-INTEGRATION.md. Do not promote an archived adapter or formula patch because a historical test passes.

## Verification at export

Both source trees and all uploaded blobs were hash-checked. The standalone `node scripts/build.mjs` passed upstream integrity, imports, syntax, matched projection/slope and clock/quality CPU tests. WIP `node scripts/check-interactions.cjs` and `node scripts/build.mjs` passed without source changes:

1. Scene drag rotates view; time unchanged — PASS.
2. Sun drag changes time along the projected path — PASS.
3. Track drag changes time and compacts dock — PASS.
4. Pinch zooms; double-tap resets without changing time — PASS.
5. Water curve scrub stays water-locked — PASS.
6. Back to now returns live/default view — PASS.
7. Watch plays; touch pauses and releases control — PASS.

These are registered-event/geometry tests with mocked DOM and synthetic inputs, not physical-device results. Reference-state/data bindings, preservation checks, celestial tests, native adapter/fallback/share selection and archived overnight tests also passed. The full renderer limitation above remains, and no new clip was fabricated for the handoff.

## Continue from a clean clone

The GitHub API exported exact code snapshots; it did not recreate original Sites commit identities in their ancestry. To preserve historical regression checks and all prior source work, original Git history is included as split Git bundles. No credentials or repository configuration are included.

On `wip/tidewater-in-app`, restore its original history before running the preservation tests:

```sh
cat handoff-history/night-pass-source.bundle.part* > /tmp/daybuoy-night-pass-source.bundle
sha256sum /tmp/daybuoy-night-pass-source.bundle
git bundle verify /tmp/daybuoy-night-pass-source.bundle
git fetch /tmp/daybuoy-night-pass-source.bundle HEAD:refs/remotes/sites-archive/night-pass
npm ci
node scripts/check-interactions.cjs
node scripts/build.mjs
```

Expected bundle: 101,924,677 bytes; SHA-256 `d357be9650e4a15e013300e24b84047b040767f374bef3204c777feb1b158f44`. Fetching this history adds objects/a remote-tracking ref; it does not move the checked-out branch or main. Tests reference original commits such as `d008588a`, `93a10eb91d888f40984d3edacadd67ced0642778` and `30826de2b421b6fae157e69374433aa0fb75b701`.

On `proof/tidewater`, original proof history is optional for its build:

```sh
cat handoff-history/proof-source.bundle.part* > /tmp/daybuoy-proof-source.bundle
sha256sum /tmp/daybuoy-proof-source.bundle
git bundle verify /tmp/daybuoy-proof-source.bundle
git fetch /tmp/daybuoy-proof-source.bundle HEAD:refs/remotes/sites-archive/proof
node scripts/build.mjs
```

Expected bundle: 2,584,275 bytes; SHA-256 `080cf31d8c0eca6267431b437868caa5c51afbc9aca7a8a67a19b0fb7a0dd78d`. Serve `dist/` from HTTPS or localhost for WebGPU. Preserve each branch's existing hosting identity; never deploy one to the other's Site accidentally. Keep main unchanged until explicit approval.

Next useful action: test the diagnostic WIP and isolated proof on Jacob's iPhone Safari, record backend/resolution/preset and sustained FPS, then compare 3 ft and 5 ft shapes against the approved laptop reference. Resolve composition or GPU failures before additional styling or wave changes.

## October 8 — automatic device evidence uploads

- Runtime: existing owner-private Site now uses a Sites Worker for `/api/results`; the approved scene/forecast/camera/UI static bytes are preserved. `hosting/` retains the supported Sites/Vinext build integration. Run `npm run build` at root to build both parts.
- Server credential: `GITHUB_RESULTS_TOKEN` is configured as a hosted secret (expires January 6, 2027 per owner). It is never a client variable or checked-in value. Preserve owner-only Site access; the upload endpoint relies on Sites dispatch authentication plus a same-origin/custom-header check.
- Fixed destination: `jcarroll44/ocean`, branch `wip/tidewater-in-app`, `results/<UTC timestamp>-<UUID>/`. Each completed commit includes `report.json`, available scene screenshots and clip, and a SHA-256 `manifest.json`. `results/latest.json` points to the latest real test. Synthetic transport checks use kind `smoke` and do not replace that pointer.
- `/ocean-overcast-profile.html` and `/ocean-live.html` auto-run on open. `?run=0` opts into manual operation. `?gate=1` selects the live 120-second gate. Native comparison auto-captures and uploads. Historical suites also upload automatically after completing their selected tests.
- Encoding and network uploads never run during a timed FPS gate. Overcast screenshots are copied after individual passes; the ten-second clip follows the final pass. Live tests capture two screenshots and a clip after the selected gate. These are real scene canvas pixels, not browser chrome/HTML UI screenshots. Unsupported/failed captures are recorded explicitly, never fabricated.
- Pending bundles (including blobs) persist in IndexedDB until GitHub confirms the commit. Reopening a current test page retries prior bundles before measuring again. No token enters the client. Retries are idempotent; branch races retry against the new parent without force pushes.
- On the owner's “ran it,” fetch `results/latest.json` from the WIP branch, then its report, manifest, screenshots and clip. Check timestamps and capture errors. Do not ask the owner to download/upload JSON.
- Automated checks: all seven interaction handlers, unchanged camera/scene/UI source checks, actual live/overcast runner mocks, exact static-byte packaging, and upload validation/conflict/idempotency tests. No physical iPhone run or rendered browser QA was performed in this setup round. A hosted transport smoke test is separate from phone FPS evidence.
