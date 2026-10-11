# Public DayBuoy release

Public project: `appgprj_6acbce20c2508191bd5f0bb8ef426c08`.
Public origin: <https://daybuoy.jacobcarroll51.chatgpt.site>.
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

Copy **only** the verified `production/dist` contents into the public checkout's `dist/`, preserving its own hosting manifest. Use the Sites workflow to push that exact public source, package the static artifact, save the pushed commit as a version and publish it. Set only this new project's audience to public, as explicitly approved. Keep the private project's audience untouched.

Future rollback: redeploy the prior saved public version. Do not reset main/proof or overwrite the private testing deployment. The frozen GitHub branch `baseline/iphone-gate-2026-10-11` points at `0f6ff5b83dad580a9ea6c2272bb79aa67d556ce4`.

## Hosted iPhone beta caveat

Capacitor's `server.url` is documented for live reload, not production. The wrapper implements the explicitly requested hosted architecture with HTTPS, app-bound navigation, inspection off and local error/legal pages. It remains a beta pending Mac/device testing and Apple's minimum-functionality/remote-code review. App Store approval is not guaranteed. Native permission/plugin changes require a new reviewed binary; hosted updates must not be used to evade review.

Review forecast-provider commercial licensing/capacity before monetization or a large launch. The current app uses existing public forecast endpoints; this deployment does not purchase commercial API service or guarantee provider availability. The published privacy page describes current behavior, not a substitute for the operator's own policy review.
