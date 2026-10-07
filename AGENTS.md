# DayBuoy work rules

Before editing, read `INTERACTION-CONTRACT.md`. It is the current interaction authority and supersedes historical handoffs and camera-restoration notes.

Before every delivery, run `node scripts/check-interactions.cjs` and `node scripts/build.mjs`. All seven contract checks must pass. Fix failures; do not weaken assertions to approve a regression. Report the checklist and state whether verification was automated or performed on a real browser/device. Never claim a rendered clip or phone FPS from mock tests.

Do not change approved water, sky, lighting, NOAA astronomy, scene objects or brand as a side effect of input/camera work. Preserve unrelated edits from other threads. Any new explicit user correction must be reflected in the contract and its tests in the same round.
