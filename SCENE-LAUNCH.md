# Accepted scene import for the Features lane

The launch tag is **scene-baseline-rc14c-startup**, on the canonical private Sites source repository. It peels to **c6d8241f1a2f248e62b3ad3c15ffc1203df65473** (revision `2026-10-17-perf-rc14c-startup2`). The historical `scene-baseline-rc14c` tag stays unchanged at `ed8981803abe0d98a97dd7940499699c86a91352`; it is already an ancestor of the accepted startup runtime.

## Fetch the exact source

1. Use Sites `get_site` and `create_source_repository_write_credential` for project `appgprj_6ac49343ea048191b93c8d1135390e39`. Open it with the supported Sites source helper in a separate checkout; do not substitute the Features project ID.
2. Using that source credential in memory through hidden stdin and an environment-backed Git HTTP authorization header, fetch this exact refspec from the tool-returned `remote_url`: `refs/tags/scene-baseline-rc14c-startup:refs/tags/scene-baseline-rc14c-startup`. Never put a token in the remote URL, command arguments or a tracked file. The ref is available on the canonical private Sites repository; it is not advertised as a GitHub tag.
3. Verify `git rev-parse 'scene-baseline-rc14c-startup^{}'` returns `c6d8241f1a2f248e62b3ad3c15ffc1203df65473`. A fresh empty receiving repository was used to verify that this remote ref and its required source objects can be fetched.
4. In the Features checkout, integrate only the accepted scene/startup source and its matching build inputs. Preserve Features UI/data changes and its own `.openai/hosting.json`; do not reset to this full tree or deploy the scene project's configuration over Features. Original startup parents are available for a three-way integration; do not transplant generated renderer files without their corresponding sources/adapters.

## What the tag contains

RC14c accepted visuals and locked surf truth; bounded async pipeline initialization and timeout retry; optional-effect degradation; complete owned GPU-device/resource teardown; 15-second stage watchdog; verified cached asset reuse and per-request retry/deadline diagnostics; startup-only saved/resumable checks. Normal healthy shader/physics/scene output is unchanged from accepted RC14c.

## Acceptance and freeze

User-reported iPhone Safari: 20/20 Wi-Fi and 20/20 cellular, zero leaked tracked GPU resources across 41 sessions, first-frame median 4.0–4.4 s. Prior scene gate: 39.3428 average FPS, minimum 30, zero seconds under 30, 36/36 stills and wave truth 5/5. Tracked resource counts do not measure driver-resident memory.

No further scene work until Jacob explicitly asks. The original full gate and Share results remain the check for future changed builds. Never push GitHub main or move accepted baseline tags. Read the current HANDOFF.md, AGENTS.md and INTERACTION-CONTRACT.md before integration.
