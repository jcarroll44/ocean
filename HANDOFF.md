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
