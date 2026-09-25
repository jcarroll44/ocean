# Wave prototype checkpoint

User authorization: direction/wind fixes, one offline-simulated 4 ft breaker connected to the ocean, an in-app clip, then a physical iPhone test before expanding. Standing authorization permits publishing isolated previews. Do not replace the production root with unaccepted wave changes.

Source recovery is complete. `tools/waves/recover_candidate.py` reconstructs the earlier public sun/surf candidate and applies the two current input fixes. Verified recovered SHA-256: `47b1c58928921228a0dc4b18e919850c93fab3e371bedc754a463fdcc162aceb`. An automatic review rejected uploading a separate compressed candidate backup; that archive is excluded. The reconstruction was checked against the already-public review, so earlier work remains recoverable without that archive.

The September 24 local bake produced 270 native frames, approximately 4.21 ft crest-to-following-trough at the 8 m approach gauge, 8.81 MB compressed textures, and 15.03 MiB GPU texture storage. Those are historical run observations, not retained-file verification: the exported asset was lost during the paused session before publication. Do not claim it is currently downloadable unless the new build actually succeeds.

The source and controls are retained on GitHub. The persistent build workflow regenerates one specimen and commits only its assets and `tools/waves/STATUS.json` to `wave-prototype-checkpoint`. The main preview fetches the asset from that branch. Check GitHub Actions and the branch's current status before reporting availability. Refreshing the preview after a successful build enables the baked controls.

Checks performed: recovered-candidate input tests passed 49 direction cases, continuous 5 mph wind response, and an exact 4:3 ratio between 2 ft and 1.5 ft spectral heights. Six shader programs compile/link in native Mesa EGL. These checks do not prove the size difference is visually clear on a phone.

The previous cloud browser could not create WebGL. Actual in-app appearance, recording, and physical iPhone performance remain unverified. The preview contains a native canvas recording button when MediaRecorder is supported. Never describe a Blender or native diagnostic render as an in-app recording.

Quality risks remain: coarse 0.161 m simulation cells, a single-pulse wavemaker, offshore gauge height differing from breaker-face height, lateral and upstream patch joins, changing-topology playback without correspondence, absent baked whitewater/foam handoff, and non-seamless restart. Existing large-wave architectural transition and separate swash clock are not declared fixed. Do not expand to further assets until this one is reviewed.

The user asked whether work continues after a reply. Be precise: conversational work stops when the turn stops. A verified GitHub Actions job can continue independently, and its run URL is the evidence. Never imply the assistant is continuously working without such a job.
