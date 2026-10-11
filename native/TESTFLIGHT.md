# DayBuoy → first TestFlight build

This branch is a release candidate, not an uploaded or signed iPhone build. The web app is bundled locally, with offline forecasts/fallback, a WidgetKit extension, native scrub haptics and configurable Sentry/Capgo integrations. The ocean and seven gesture contracts remain the approved baseline. iPhone/iOS 26+ only.

The website is owner-private behind platform sign-in. The app itself needs no site login. Main, preview capture tools and the server-held evidence token are separate.

## 1. Your accounts and Mac

1. Enroll at https://developer.apple.com/programs/enroll/ using your Apple Account if you are not already a paid member. Complete Apple’s identity/agreement/payment steps. Processing time varies.
2. Install a current App Store-supported Xcode with the iOS 26 SDK or later; open it once and install requested components. Xcode → Settings → Accounts → add the same Apple Account.
3. Install Node.js 22 or newer from https://nodejs.org/.
4. In Terminal:

```sh
git clone --branch wip/tidewater-verdict-first https://github.com/jcarroll44/ocean.git daybuoy
cd daybuoy
npm ci
npm ci --prefix native
```

Use a full clone: the regression checks compare historical approved source. If you already have this checkout, commit/stash your own edits before pulling the WIP branch. Do not merge it into main yet.

## 2. Configure diagnostics and updates once

These accounts were not available in the development session. The integrations are installed but are **off until configured**. No admin token belongs in the app or this chat.

**Sentry**

1. Sign in at https://sentry.io/, create/select your organization, and create a JavaScript/Capacitor project named DayBuoy.
2. Go to **Settings → Projects → DayBuoy → Client Keys (DSN)**. Copy the **DSN**. This is the public client endpoint, not an auth token.
3. In the project’s data settings, enable IP scrubbing and choose retention appropriate to your beta. The app disables replay, tracing, user breadcrumbs and default PII.

**Capgo**

1. Sign in at https://web.capgo.app/. Create an app with ID **com.jacobcarroll.daybuoy**, then create a **beta** channel. Choose a suitable service plan in your own account.
2. On your Mac, from the repo:

```sh
cd native
npx @capgo/cli@latest login
npx @capgo/cli@latest key create
npm run configure
```

Follow Capgo’s login prompt locally. The configure script asks for the Sentry **DSN**, then the **public key file path**. Press Return for the generated `./.capgo_key_v2.pub`. It writes ignored `release.local.json`; never enter the private key or GitHub token there.

Keep the generated private key backed up securely and out of Git. The bundle script copies only the public key into Capacitor configuration. Automatic updates download on foreground and apply after backgrounding; they do not interrupt an active scrub. A missing startup acknowledgement triggers the updater’s rollback mechanism. That mechanism still needs a real-device failure/rollback test.

## 3. Build and open Xcode

From `daybuoy/native`:

```sh
npm run prepare:ios -- --testflight
npm run open:ios
```

Preparation runs the full interaction/ocean/product checks, builds minified production assets, bundles them and the native integrations, creates the icon/splash, syncs Swift packages and checks the widget project. The `--testflight` flag stops if Sentry/Capgo configuration is missing. It checks configuration presence; successful server delivery must still be verified on the phone.

For a local development build before setting up those accounts, omit `-- --testflight`. Do not call that an integration-complete beta.

## 4. Sign both targets

1. In Xcode select the blue **App** project.
2. Select target **App → Signing & Capabilities**. Enable **Automatically manage signing** and choose your paid Apple team. Bundle ID: **com.jacobcarroll.daybuoy**.
3. Select target **DayBuoyWidget → Signing & Capabilities**. Choose the same team and automatic signing. Bundle ID: **com.jacobcarroll.daybuoy.widget**.
4. Both targets use version **1.0**, build **1**, iPhone, minimum iOS **26.0**. No location permission, app group or push capability is needed.
5. If an ID is unavailable, choose your unique base ID and update the app ID in Capacitor, both Xcode target IDs (widget must retain the base prefix), and the Capgo app together. Re-run preparation.
6. Let Xcode resolve Swift packages. Open the **App** scheme and connect your iPhone. Trust the Mac and enable Developer Mode if Xcode asks. Press Run.

## 5. Confirm the native build

- Cold launch: icon/splash, current timestamp, real Tidewater scene, no fallback tag.
- Drag the scene; hold without drift; pinch; drag the sun and timeline. The selected hour, waves, tide, wind and light must agree; detents should have gentle haptics.
- Water shows timestamped NWS risk; home has only a small High chip when valid. Sun and Watch contain no burn-time or sunset scores.
- Background/resume and a widget tap return correctly. Add the widget via long-press Home Screen → Edit → Add Widget → DayBuoy. Check small and medium sizes. It requests refresh about every 30 minutes, but iOS controls scheduling. Saved/unavailable values must be labelled.
- Force-close after a successful fetch; turn Airplane Mode on **and Wi-Fi off**; reopen. The local UI loads with a dated saved forecast when usable. With no cache, it says forecast unavailable. Reconnect and Retry. Privacy and credits open locally. The fallback HTML is for a page-load failure, not the normal offline state.
- Check sharing, every sheet, larger text and VoiceOver on the real device.
- In Sentry, confirm a real failed-feed event arrives after an offline/failed refresh and reconnect. Confirm native/JS error reporting on a development build using the SDK’s documented test procedure; do not ship a crash button.
- In a dedicated Capgo test channel/device, verify one compatible update and a deliberately failed startup rollback. Never send the rollback-test bundle to normal beta users.

Disconnect Xcode, charging and mirroring; let the phone cool for 10 minutes. Test the Release/TestFlight build for two minutes and a longer warm session. Previous Safari results are **not** proof of native performance. Keep the accepted DPR/FXAA settings; fix a native regression before external beta. Production assets intentionally contain no capture page or profiling tools.

## 6. Create the App Store Connect record

1. Open https://appstoreconnect.apple.com/apps → **+ → New App**.
2. Choose **iOS**, name **DayBuoy**, language **English (U.S.)**, bundle ID **com.jacobcarroll.daybuoy**, SKU **daybuoy-ios-001**.
3. Use your real contact and feedback email. No app login credentials are required.
4. The app site remains private. A public readable privacy policy is available in the existing public repository:
   https://github.com/jcarroll44/ocean/blob/wip/tidewater-verdict-first/PRIVACY.md
5. Support URL: https://github.com/jcarroll44/ocean/issues
6. Complete App Privacy based on the configured Sentry/Capgo build and providers’ data handling. Diagnostics are included; do not automatically choose “Data Not Collected.”

Prepare listing copy and real-device screenshots while testing. Keep DayBuoy unless you deliberately choose another available name. No fishing, extra beaches, burn-time or sunset-score expansion is part of v1.

## 7. Archive, upload, install

1. Xcode: scheme **App**, destination **Any iOS Device (arm64)**.
2. **Product → Archive**. In Organizer choose the archive → **Distribute App → App Store Connect → Upload**. Use the same team and leave native debug-symbol upload enabled.
3. App Store Connect → DayBuoy → **TestFlight → iOS**. Wait for **1.0 (1)** to finish processing and resolve any emailed errors.
4. Complete export-compliance questions for the actual build, including HTTPS and the Capgo encrypted-update implementation. No blanket exemption answer is hard-coded here.
5. **Internal Testing → +**: create **DayBuoy Internal**, add the processed build and yourself as an eligible App Store Connect tester.
6. Install Apple’s TestFlight app on the iPhone, accept the invitation and install DayBuoy.
7. For external friends, create an External Testing group, complete Test Information, add the build and submit for Beta App Review when requested. Invite only after approval.

If a build number has already been used, increment **Build** on **both** App and DayBuoyWidget, archive and upload again.

## 8. After the first beta

Use it for several real days; fix native problems before App Store submission. Complete screenshots, description, age rating, privacy responses, contact details and review notes in parallel. Make the app site public at launch, leaving the preview/tests/upload endpoint private.

For later compatible web fixes, rebuild via preparation, then upload the `native/www` bundle through Capgo to **beta** first. For example, from `native`, after increasing the web bundle version in package.json:

```sh
npx @capgo/cli@latest bundle upload com.jacobcarroll.daybuoy --channel beta --key-v2 ./.capgo_key_v2
```

Verify the chosen version/channel in Capgo before rollout. Changing native plugins, widget code, signing, permissions or encryption keys needs a new Xcode build; OTA cannot add those capabilities. Updates must remain within the app’s reviewed functionality. Bundling plus a widget does not guarantee Apple approval.

## Official references

- https://capacitorjs.com/docs/config
- https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/
- https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers/
- https://developer.apple.com/app-store/review/guidelines/
- https://developer.apple.com/documentation/widgetkit/keeping-a-widget-up-to-date
- https://capgo.app/docs/cli/reference/login/
- https://capgo.app/docs/cli/reference/bundle/
- https://capgo.app/docs/live-updates/encryption/
- https://docs.sentry.io/platforms/javascript/guides/capacitor/
