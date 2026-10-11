# DayBuoy protected production beta

Production project: `appgprj_6acbce20c2508191bd5f0bb8ef426c08`, owner-private until explicit launch approval.
Production origin: <https://daybuoy.jacobcarroll51.chatgpt.site>.
Private development project: `appgprj_6ac49343ea048191b93c8d1135390e39`. Its owner-only audience, diagnostic routes, evidence Worker and runtime secret are unchanged.

Only `production/dist/` is published through the separate public Sites checkout. Never deploy the repository-root `dist/` or root hosting manifest to that public project: those are the private development build. Never clone its runtime environment variables. The public project has no Worker/API endpoint or token. Preserve the exact public project ID in its own `.openai/hosting.json`.

The site contains minified app/scene/worker JS and CSS, five Poppins font files, icon, privacy/credits and a 404 page. No source maps, test/capture routes, upload client, development server, upstream module tree or secret is included. The render worker only computes the shore field; it is not an HTTP upload endpoint. Browser-delivered minified JavaScript is still inspectable. This does not make the already-public GitHub source repository private.

## Rebuild and verify

From the repository root, install the existing project dependencies normally and run `npm ci --prefix native` for the pinned native/build helpers, then:

```bash
node scripts/check-interactions.cjs
node scripts/build.mjs
node scripts/build-production.mjs
npm run prepare:ios --prefix native
node scripts/check-production.mjs
node scripts/check-polish-shaders.mjs
```

`build-production.mjs` uses build-time transforms to keep only the ordinary BeachApp/App renderer path. The pinned vendor sources are untouched. The public adapters retain the approved parent camera/forecast/astronomy, High quality, FXAA, DPR 1.25–1.6, 36 FPS down threshold, bounded two-frame pipeline, prewarm and staged shore uploads. Test-only controls, ablations, captures and profiler dependencies are removed. Legitimate `hour`, `t` and `sheet` shared links remain; test query strings are ignored.

The generated `build-manifest.json` records scene/shore dependencies for audit; it is **not** a public asset. The checked-in baseline record distinguishes user-reported 37.3/30/0 acceptance from the older failed report still at the latest-results pointer. No production minification or native-wrapper phone pass is inferred from it.

Checks cover the seven registered interactions, preserved camera/UI sources, marine mappings, adaptive/timing/upload invariants, actual minified app startup in a mocked DOM/GPU host, the public file allowlist, no source maps/credential/test signatures, legal text and native config/assets. Dawn null checks shader/pipeline validity, not pixels or throughput. No authorized browser-control skill was available for this turn, so browser-rendered QA is not claimed. Xcode signing/build and real iPhone offline/WKWebView performance checks are pending the steps in `native/TESTFLIGHT.md`.

## Deployment and rollback

Copy **only** the verified `production/dist` contents into the production checkout's `dist/`, preserving its own hosting manifest. Use the Sites workflow to push that exact source, package the static artifact, save the pushed commit as a version and deploy privately. Preserve both owner-private audiences until Jacob explicitly says launch. Protection uses platform sign-in; a separate shared-password mode is unavailable.

Future rollback: redeploy the prior saved public version. Do not reset main/proof or overwrite the private testing deployment. The frozen GitHub branch `baseline/iphone-gate-2026-10-11` points at `0f6ff5b83dad580a9ea6c2272bb79aa67d556ce4`.

## Bundled iPhone beta

The app bundles the minified web build; Capacitor `server.url` is absent. Native sharing, scrub haptics, offline/legal pages and a current-conditions WidgetKit extension are included. Capgo encrypted updates and Sentry crash/feed reporting remain off until configured in the user's accounts. Follow `native/TESTFLIGHT.md`. The unsigned macOS workflow can establish compilation, not signing, service delivery or device acceptance. Native permission/plugin/widget changes require a new binary. Compatible OTA changes must remain within the reviewed functionality.

## Layered weather evidence

The October 11 pass adds data-driven low/mid/high clouds and shadows, humidity/visibility fog, rain/dimples/wet sand, radiation lighting, gust spray, heat shimmer and 21 offshore samples at 5/20/40 miles. Offshore storm movement uses wind-advection interpolation between exact hourly forecast knots. Shapes, layer heights and sub-hour placement are labelled estimates, not radar or exact arrival predictions. Missing rain remains unavailable; missing tide holds the last sea level with disclosure. Existing astronomical sun/moon calculations are unchanged.

`weather-fixtures.html?gate=1` on the private preview is iPhone-only. It tests synthetic night storm for 120 seconds with production DPR/FXAA/pipeline settings, preserving every slow bin, then captures all ten fixture screenshots and a clip and uploads them to the existing results branch. No weather phone pass or rendered gallery is claimed before those files exist. Linux validation covers shader semantics, data/unit/missingness behavior, product DOM/interaction logic, upload/gate logic and minified/native packaging. Dawn null cannot execute the complete ocean pipeline because of texture/storage limits; it is not pixel or performance evidence.

Review forecast-provider commercial licensing/capacity before monetization or a large launch. The current app uses existing public forecast endpoints; this deployment does not purchase commercial API service or guarantee provider availability. The published privacy page describes current behavior, not a substitute for the operator's own policy review.
