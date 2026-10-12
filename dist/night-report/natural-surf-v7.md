# v7: natural surf and sustained rendering

Revision: `2026-10-12-natural-surf-v7`. GitHub work stays on `wip/tidewater-verdict-first`; GitHub main is untouched. Private Sites main is the authorized deployment channel.

Reviewed actual v6 iPhone upload `2026-10-12T20-27-39Z-0ff5e64e-d6bf-4d5f-a8b1-9232c4b13b0a`: 35.045 fps average, 18 minimum, 17 complete seconds below 30. Both actual contact sheets were inspected. The late decline is consistent with the reported sustained-load issue; no hardware temperature telemetry was available.

Changes:
- Retained headline, tiles, Hour by hour and all interaction/camera behavior. Enlarged the weather artwork and raised sun/rim contrast inside the same glass disc.
- Crest stations 0.6 → 1.2 m apart; transect samples 64 → 48 over the same 192 m span; one secant refinement; lip profile 20 → 12 vertices. Teal transmissive curling material retained; two existing lace samples reused.
- One foam self-shadow sample instead of three; reuse existing lace for medium-scale relief. Four wave systems still share one existing FFT cascade set. At high rendering rates adjacent frames reuse transform results; wave phase and persistent foam retain elapsed time. A changed spectrum forces immediate recomputation.
- Larger seas use deeper set/lull modulation and patch coverage through all three shore evaluation paths. The accepted 1 ft set/foam model and whitecap parameters stay unchanged. Outer breaking is restricted to big seas and the strongest set waves. Offshore wind reduces whitecaps; onshore wind increases compression whitecaps and crumbly coverage. Existing wind-driven spray continues off the back in offshore wind.
- Removed the extra constant storm-foam illumination; the prior clear-night contribution and lightning remain. Complete sky caches still crossfade without partial publication.
- Expanded rounded shelf crowns/undersides, clearer irregular rain shafts and forecast-wind movement; removed a horizon blend that was covering the shelf's lower structure.
- Overcast/light-rain horizon haze matches the cloud-deck tone; dense fog remains gray-white. Sunrise-only water correction applies to the full water reflection/transmission combination, reducing excess red while leaving clear-night water unchanged.
- DPR floor 1.25 → 1.1; reduce below 38 completed fps; raise only above 46, or after 30 sustained seconds >=44 during recovery. 30-second upward cooldown. The strict gate stays 120 seconds, every whole second >=30 completed GPU frames, with all resizing pauses counted.

Validation: seven actual-handler interaction checks, unchanged camera/vendor identity, marine data/partition checks, all three foam paths, FFT reuse/clock accounting, shader semantics, coherent cloud-cache publication, fixture capture/upload orchestration, production bundle and hosting checks. These are automated CPU/Dawn-null checks, not rendered pixels or an iPhone pass.

Verification still required: fresh v7 phone throughput and appearance. The gate automatically creates 10 weather captures/contact sheet, 5 wave captures/contact sheet, storm clip and full-app day scrub after timing, then uploads them. The full-app video is a live DOM/native-canvas composite, not an OS screen recording. This environment has no supported browser QA surface or physical iPhone; no v7 gallery, recording, or sustained-performance pass is claimed in this report.

Marine source fields and their estimate/source labels are unchanged from v6. Tidewater (pinned 4811ba48) and Takram MIT credits remain. Restored the GitHub v6 source fixes missing from the Sites source checkout (weather upload kind, layer advection, credits/assets and native manifest compatibility) before rebuilding; removed its stale tracked dependency symlink. Production icon generation now runs in its own build instead of depending on a prior native preparation.
