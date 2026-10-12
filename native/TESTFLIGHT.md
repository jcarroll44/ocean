# DayBuoy v8 release preparation

The current guide is [release/v8/testflight.html](../release/v8/testflight.html); status is [release/v8/index.html](../release/v8/index.html). These supersede the previous OTA instructions. v1 has no Capgo; updates ship through TestFlight and the App Store.

Run `npm ci`, `npm ci --prefix native`, then `npm run prepare:ios --prefix native`. Configure the Apple public RevenueCat SDK key and anonymous HTTPS shared forecast origin with `npm run configure --prefix native` before using `-- --testflight`. Server credentials never belong in native config.

The accepted performance baseline is v7 (40.1 average, minimum 32, zero seconds below 30). v8 requires the physical-iPhone gate and WKWebView test. Linux checks do not sign or compile Swift. Account setup, WeatherKit credentials, StoreKit testing and anonymous production API access are still required.

Production project appgprj_6acbce20c2508191bd5f0bb8ef426c08 remains owner-private. Only production/dist belongs in its consumer build; never publish the development dist, diagnostic routes or results Worker. Do not copy owner-access or results-upload credentials to a public host or app.
