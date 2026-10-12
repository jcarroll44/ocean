# DayBuoy: Mac → first TestFlight build

Checked October 12, 2026 against this WIP checkout and the official references below. Use this after the current visual pass is accepted. Main and the public website stay unchanged.

**Prepared in the repo:** bundled Capacitor app, WidgetKit extension, icon/splash generation, native scrub haptics, offline UI, privacy/credits, and Sentry/Capgo integration code. **Still requires your Mac/account:** paid Apple membership, service configuration, signing, Xcode archive/upload, App Store Connect record, and native-device testing. An unsigned compiler check or Safari gate does not establish TestFlight performance.

| Setting | Exact project value |
|---|---|
| Git branch | `wip/tidewater-verdict-first` |
| Capacitor | `8.5.3`; Swift Package Manager |
| Xcode project / scheme | `native/ios/App/App.xcodeproj` / `App` |
| App target / bundle ID | `App` / `com.jacobcarroll.daybuoy` |
| Widget target / bundle ID | `DayBuoyWidget` / `com.jacobcarroll.daybuoy.widget` |
| Devices / minimum OS | iPhone / iOS `26.0` on both targets |
| Version / build | `1.0` / `1` on both targets; increment together if already uploaded |
| Signing | Automatic signing configured; Apple team not selected |

## 1. Apple account and Mac

1. [Enroll in the Apple Developer Program](https://developer.apple.com/programs/enroll/) if needed: Apple Account with two-factor authentication, identity verification, agreements and $99 USD/year. Individual enrollment lists your legal name as the App Store seller; an organization enrollment uses its verified legal entity. [1]
2. Install a current **release** Xcode supported by your Mac and iPhone. Apple currently requires Xcode 26+ with the iOS 26 SDK or later for uploads; Capacitor 8 also requires Xcode 26+. Check Apple's [Mac/Xcode compatibility table](https://developer.apple.com/xcode/system-requirements) before installing. For example, Xcode 26.3 supports macOS Sequoia 15.6+, while newer Xcode versions can require newer macOS. [2–4]
3. Open Xcode, accept its license and install requested iOS components. **Xcode → Settings → Accounts → + → Apple Account**: add your enrolled account. Under **Settings → Locations**, select the installed Xcode for Command Line Tools.
4. Install Node.js **22 or newer**. This project uses Swift Package Manager; no CocoaPods installation is needed. [3]

## 2. Get the accepted WIP build

In Terminal, for a fresh checkout:

```sh
git clone --branch wip/tidewater-verdict-first https://github.com/jcarroll44/ocean.git daybuoy
cd daybuoy
npm ci
npm ci --prefix native
node --version
xcodebuild -version
```

Keep the full Git history: regression checks compare approved historical source. For an existing checkout, preserve your local changes and pull this WIP branch with `git pull --ff-only`. Use the accepted revision, not a different branch.

## 3. Configure the existing integrations once

The repository's `--testflight` preparation checks for Sentry/Capgo configuration. This is a DayBuoy release requirement, not an Apple enrollment requirement. If already configured on your Mac, reuse it; do not generate replacement keys.

1. In Sentry, create/select the DayBuoy Capacitor project and copy **Settings → Projects → DayBuoy → Client Keys (DSN)**. Use the public client DSN, not an auth token.
2. In [Capgo](https://web.capgo.app/), create/select app `com.jacobcarroll.daybuoy` and channel `beta`. From Terminal:

```sh
cd native
npx @capgo/cli@latest login
npx @capgo/cli@latest key create
npm run configure
```

Complete login on your Mac. The configure prompts take the Sentry DSN and **public** key path (`./.capgo_key_v2.pub` by default). It writes ignored `release.local.json`. Back up the private key securely; never paste private keys or service tokens into app code or chat. Capgo's official login/key instructions are linked below. [5–6]

## 4. Prepare, open and sign

From `daybuoy/native`:

```sh
npm run prepare:ios -- --testflight
npm run open:ios
```

Preparation runs the interaction/build checks, creates production assets and icon/splash, bundles native integrations, syncs Swift packages and validates the widget. Stop on any error. `npm run open:ios` opens **App.xcodeproj**; do not look for a CocoaPods workspace.

1. In Xcode select the blue **App** project, then target **App → Signing & Capabilities**. Enable **Automatically manage signing** and choose your paid team. Confirm bundle ID `com.jacobcarroll.daybuoy`.
2. Repeat for **DayBuoyWidget**, same team, ID `com.jacobcarroll.daybuoy.widget`. Let packages resolve. No App Groups, location or push capability is currently required.
3. Confirm both targets' **General → Identity** values match: Version `1.0`, Build `1` (or the next unused build number).
4. Choose scheme **App**, connect your iPhone running iOS 26+, trust the Mac, and enable Developer Mode if Xcode requests it. Run once to confirm the bundled scene launches. An unavailable bundle ID needs a coordinated repo/Capgo ID change; do not edit only one target.

## 5. Create the Apple app record

In [App Store Connect → Apps](https://appstoreconnect.apple.com/apps), choose **+ → New App**: [7]

| Field | Enter |
|---|---|
| Platform | iOS |
| Name | DayBuoy, if available |
| Primary language | English (U.S.) |
| Bundle ID | `com.jacobcarroll.daybuoy` |
| SKU | `daybuoy-ios-001` |

If the ID is missing, complete Xcode automatic signing first and refresh the list. No separate app record is needed for the widget. Add your actual feedback/contact email under TestFlight test information. The app has no login.

Keep the public app site protected. The existing public [privacy policy](https://github.com/jcarroll44/ocean/blob/wip/tidewater-verdict-first/PRIVACY.md) and [support issues](https://github.com/jcarroll44/ocean/issues) can be linked when Apple requests those URLs. Complete privacy/age-rating responses for the actual configured build; Sentry diagnostics mean “Data Not Collected” must not be assumed.

## 6. Archive, upload and install

1. Xcode: **App** scheme → destination **Any iOS Device (arm64)** (generic iOS device, not a simulator) → **Product → Archive**.
2. Organizer → select archive → **Distribute App → App Store Connect → Upload**; use automatic signing and the same team. Keep debug-symbol upload enabled. Use standard App Store Connect distribution so this build can later be offered externally; **TestFlight Internal Only** builds cannot be promoted to external testing. [8–9]
3. Wait for processing and the Apple email. In **DayBuoy → TestFlight → iOS**, open build `1.0 (1)` and resolve any processing errors or **Missing Compliance** prompt. Answer encryption questions for the actual HTTPS/Capgo encrypted-update implementation; the repo intentionally does not hard-code an exemption. [8,10]
4. **Internal Testing → + → DayBuoy Internal → Create**. Use **Add Builds** to select the processed build and enter What to Test, then **Invite Testers** to add yourself as an eligible App Store Connect user. [9]
5. On the iPhone, install Apple's **TestFlight**, accept the invitation and install DayBuoy. Builds are available for 90 days. [9]

Suggested **What to Test**: “Scrub a full day through clear, rain, storm and night. Check the sky orb, hour label, tide/rain track and rolling readings. Confirm moonlit water, shelf cloud, storm horizon, haptics, offline reopening, widget and background/resume.”

## 7. Native acceptance, then outside testers

Verify the Release/TestFlight app on the phone: actual WebGPU beach, full-day transitions, hour/moment haptics, all sheets/sharing, widget launch, saved forecast offline and retry, local privacy/credits, and background/resume. Confirm Sentry receives an event and test one compatible Capgo update plus startup rollback on a dedicated test channel. Detailed procedures remain in [TESTFLIGHT.md](TESTFLIGHT.md).

Measure native performance separately for 120 seconds and a longer warm session, unplugged and without mirroring. A Safari pass does not establish WKWebView performance; production intentionally excludes the private profiling/capture pages.

For friends, create an **External Testing** group after the internal group, complete beta contact/test information, add the build and submit for Beta App Review. The first external build requires review. Share invitations only after approval. [11]

## Official references

1. [Apple enrollment](https://developer.apple.com/programs/enroll/)
2. [Apple upload requirements](https://developer.apple.com/news/upcoming-requirements/)
3. [Capacitor 8 environment setup](https://capacitorjs.com/docs/getting-started/environment-setup)
4. [Xcode system requirements](https://developer.apple.com/xcode/system-requirements)
5. [Capgo login](https://capgo.app/docs/cli/reference/login/)
6. [Capgo key generation](https://capgo.app/docs/cli/reference/key/)
7. [Create the app record](https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app/)
8. [Upload builds](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/)
9. [Internal TestFlight groups/builds/testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers/)
10. [Export compliance](https://developer.apple.com/help/app-store-connect/manage-app-information/overview-of-export-compliance/)
11. [External TestFlight and Beta App Review](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers/)
