# DayBuoy: Mac → your iPhone through TestFlight

Prepared October 11, 2026. Work stays on `wip/tidewater-verdict-first`, not main.

The Xcode project is prepared, but has **not** been compiled, signed, installed or uploaded here. Your reported Safari gate passed; that is not yet a WKWebView/TestFlight performance result.

## What is included

- Capacitor 8.5.3, Swift Package Manager, iPhone-only, portrait, iOS 26 minimum for WebGPU.
- App ID `com.jacobcarroll.daybuoy`; version 1.0, build 1.
- Hosted UI/ocean: <https://daybuoy.jacobcarroll51.chatgpt.site>.
- Bundled offline/retry screen and privacy/credit pages, generated opaque 1024px icon and launch-screen artwork.
- No GitHub token, test pages, analytics SDK, GPS, microphone or camera permissions in the app. No new native plugins.

Important architecture caveat: this follows your request to load the hosted UI and scene. Capacitor documents `server.url` as a live-reload feature **not intended for production**. Treat this as a hosted beta wrapper, not guaranteed App Store-ready architecture. Apple can reject a thin wrapper under minimum-functionality rules and restrict downloaded code that changes app features. Routine hosted UI/content changes require no binary mechanically, but are not a license to bypass review. Native code, permissions, plugins, icons and launch screens still need a new build. A bundled web app is the alternative if Apple objects.

## 1. Prepare your accounts and Mac

1. Enroll at <https://developer.apple.com/programs/enroll/> using your Apple Account with two-factor authentication. TestFlight requires paid Apple Developer Program membership, normally US$99/year or local equivalent. A free Personal Team cannot distribute via TestFlight. Individual enrollment displays your legal name as the App Store seller.
2. Install a current stable Xcode supporting iOS 26 (Capacitor 8 requires Xcode 26 or newer). Check your Mac's macOS compatibility at <https://developer.apple.com/support/xcode/> before downloading it. Open Xcode once, accept its license and install the iOS platform components it requests.
3. In **Xcode → Settings → Accounts**, add the same Apple Account. Confirm the paid developer team appears.
4. Install Node.js 24 LTS from <https://nodejs.org/en/download>. In Terminal, run `node --version` and `npm --version`. Node must be at least 22.
5. Update your iPhone to iOS 26 or newer. This minimum is intentional: the Tidewater renderer needs WebGPU. Use a physical iPhone to assess the ocean, not the simulator's speed.

## 2. Get this exact branch and open the app

Open Terminal. These commands create a new checkout, so they won't overwrite an existing one. If `ocean-daybuoy-testflight` already exists, choose another new directory name in both lines.

```bash
git clone --branch wip/tidewater-verdict-first --single-branch https://github.com/jcarroll44/ocean.git ocean-daybuoy-testflight
cd ocean-daybuoy-testflight/native
npm ci
npm run prepare:ios
npm run open:ios
```

`prepare:ios` generates the icon/splash, copies the local offline/legal pages, syncs Capacitor and checks configuration. Do not run `cap add ios`: the iOS project already exists. No CocoaPods or public-site build is needed for these steps. No GitHub token goes into Xcode or the iPhone app.

In Xcode, wait for Swift Package Manager to finish downloading Capacitor. If it reports a package problem, use **File → Packages → Resolve Package Versions**. Open `native/ios/App/App.xcodeproj` if the last command did not open it.

## 3. Set signing and register the identifier

1. Select the blue **App** project in Xcode's left navigator; under **TARGETS**, select **App**.
2. Open **Signing & Capabilities**. Check **Automatically manage signing**. For **Team**, select your **paid** Apple Developer team, not Personal Team.
3. Confirm **Bundle Identifier** is exactly `com.jacobcarroll.daybuoy`. In **General**, confirm display name DayBuoy, version 1.0, build 1 and minimum deployment iOS 26.0. Leave extra capabilities off.
4. At <https://developer.apple.com/account/resources/identifiers/list>, check whether automatic signing registered that identifier. If it did not: **+ → App IDs → App → Continue**; description `DayBuoy`; Bundle ID **Explicit** → `com.jacobcarroll.daybuoy`; **Continue → Register**. No extra capabilities are required.
5. If Apple says the identifier belongs to another team, stop and choose a unique one. Update both `native/capacitor.config.json` (`appId`) and the Xcode target's Bundle Identifier, run `npm run prepare:ios` again, and use that same identifier in the next step. Changing only the display name does not fix an identifier conflict.

## 4. Create the App Store Connect record

1. Open <https://appstoreconnect.apple.com/apps> → **+ → New App**.
2. Set **Platforms: iOS**; **Name: DayBuoy**; **Primary Language: English (U.S.)**.
3. Select **Bundle ID: com.jacobcarroll.daybuoy**. Set **SKU: daybuoy-ios-001** (an internal identifier you choose). Select **Full Access** for your own team, then **Create**. If the app name is unavailable, choose an available display name; it does not change the bundle identifier.
4. Keep these URLs for Apple's metadata:
   - Privacy policy: <https://daybuoy.jacobcarroll51.chatgpt.site/privacy.html>
   - Support: <https://github.com/jcarroll44/ocean/issues>
   - Credits: <https://daybuoy.jacobcarroll51.chatgpt.site/credits.html>
5. Read the privacy policy and confirm it accurately describes your operation. The public issue tracker is currently the contact path; you can replace it with a dedicated support address later. In **App Privacy**, assess both app behavior and hosting/forecast providers before answering Apple's questionnaire. Do not automatically choose “Data Not Collected”: network providers may retain request logs. The app itself has no analytics SDK or automatic evidence uploads.

## 5. Check it on your iPhone before distributing

1. Connect the iPhone to your Mac, unlock it and tap **Trust** if prompted. For a direct Xcode run, enable **Settings → Privacy & Security → Developer Mode** on the iPhone if Xcode requests it; follow the restart/confirmation prompts. TestFlight installation itself does not require Developer Mode.
2. Select your iPhone as Xcode's run destination and press **Run ▶**. Let automatic signing create the development profile if prompted.
3. Confirm the DayBuoy icon and splash, real Tidewater water (not its fallback tag), current forecast timestamp, scene drag, sun drag, pinch, scrubber, Watch/pause and sheets.
4. Test cold-start offline: force-close the app, turn on Airplane Mode **and turn Wi-Fi off**, then open DayBuoy. It should show the bundled offline screen. Restore connectivity and tap **Try again**. Privacy/credits should still open from the offline screen. The offline screen is not an offline live forecast.
5. Before a performance check, stop the Xcode session, disconnect the cable, stop mirroring and let the phone cool for 10 minutes. A debug run under Xcode is not the accepted performance gate. Verify the Release/TestFlight app separately; the public app intentionally contains no profiler or upload endpoint.

If the app shows “Standard ocean · Tidewater unavailable,” do not treat that as a successful ocean test. Check iOS version/network and report the exact behavior. Do not weaken the renderer or silently lower the baseline settings.

## 6. Archive and upload

1. In Xcode's top toolbar choose scheme **App** and destination **Any iOS Device (arm64)** (the generic iOS device option), not a simulator.
2. Choose **Product → Archive**. Wait for the archive to appear in **Window → Organizer → Archives**.
3. Select the archive → **Distribute App → App Store Connect → Upload** (some Xcode versions combine the Upload step with the distribution choice).
4. Use automatic signing and the same paid team. Leave debug-symbol upload enabled for crash symbolication. Native debug symbols are not website JavaScript source maps. Review the bundle ID/version, click **Upload**, and wait for success.
5. In App Store Connect → **DayBuoy → TestFlight → iOS**, wait for build **1.0 (1)** to finish Processing. If Apple emails an error, resolve it before continuing.
6. If **Missing Compliance** appears, open it and answer Apple's encryption questions based on this build. It uses standard HTTPS/system encryption and includes no custom encryption. Follow the OS-provided/exempt path when applicable; do not assert it uses no encryption. No blanket export-compliance declaration has been hard-coded into Info.plist.

If Xcode says the build number was already used, set **General → Build** to 2 (then 3, etc.), archive and upload again. Each upload needs a new build number.

## 7. Install through TestFlight

For your own first test:

1. In **App Store Connect → DayBuoy → TestFlight**, choose **Internal Testing → +**, name the group `DayBuoy Internal`, then create it.
2. Add build **1.0 (1)** to that group. Add yourself as a tester using the Apple Account belonging to your App Store Connect team. Internal testers must be eligible App Store Connect users; use **Users and Access** if you need to add another team member.
3. Install Apple's **TestFlight** app from the App Store on your iPhone. Accept the invitation in email/TestFlight, then tap **Install** beside DayBuoy.
4. Run the same look, interactions, offline/retry and sustained-performance checks in this TestFlight build. Record any native-specific problems before inviting more people.

For friends outside your team: create an **External Testing** group, fill out **Test Information** (beta description, your real feedback email, contact details and notes), add the build and submit it for **Beta App Review** if requested. The first external build generally requires review. No login is required for DayBuoy, so do not invent test credentials. After approval, invite testers by email or an enabled public TestFlight link. TestFlight access is separate from the public website; this work does not create a public beta invitation automatically.

Suggested What to Test: “Check current Inlet Beach conditions, ocean rendering, time scrubbing, sun drag, pinch zoom, Watch/pause and forecast sheets. Force-close and reopen without network to check the offline screen; reconnect and retry. Report device model, iOS version and visible problems.”

## Later changes

Hosted UI/scene changes reach the app on its next page load; an already open app may need relaunching. Keep the public origin stable. New native features/permissions, icon or splash changes need `npm run prepare:ios`, a new build number and another Xcode archive/upload. Update bundled privacy/credit copies when their online versions change. Keep preview/tests/uploads private; never paste the evidence token into this project.

## Official references

- Capacitor setup/config: <https://capacitorjs.com/docs/ios>, <https://capacitorjs.com/docs/config>, <https://capacitorjs.com/docs/updating/8-0>
- iOS 26 WebGPU: <https://webkit.org/blog/17333/webkit-features-in-safari-26-0/>
- Apple membership/Xcode: <https://developer.apple.com/programs/enroll/>, <https://developer.apple.com/support/xcode/>
- App ID/app record: <https://developer.apple.com/help/account/identifiers/register-an-app-id/>, <https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app/>
- Upload: <https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/>
- Internal/external testing: <https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers/>, <https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers/>
- Review constraints (2.5.2 and 4.2): <https://developer.apple.com/app-store/review/guidelines/>
