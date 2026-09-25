# One-breaker prototype

This pass establishes one Blender/Mantaflow fluid bake and an isolated Three.js player. Do not expand to a wave library until the shape, ocean connection, and physical iPhone performance pass review.

## Current scope

- Root candidate: fixes the height-dependent spectral direction reversal and the zero wind-displacement cutoff below 5.5 kt. A 5 mph east wind now has a small nonzero response.
- Preview: `review/wave-lab/`. Matched 1.5/2 ft ocean controls, one baked fluid mesh, timeline, plain/water materials, beach/side cameras, similarity scaling, measured browser cadence, and a scene recording button.
- The asset is a **4 ft target**, not yet a calibrated 4 ft result. `STATUS.json` is the current checkpoint.
- The old 2.5–3 ft architectural transition, larger-wave foam accumulation, and separate swash clock remain in the original ocean model. They are not silently declared fixed by this prototype.
- The previous candidate's sun/golden-hour work is preserved. Experimental bake hooks exist only in the generated review app.

## Reusable resources inspected

| Resource | Decision |
| --- | --- |
| [Blender Mantaflow](https://docs.blender.org/manual/en/latest/physics/fluid/index.html) | Use the existing offline FLIP solver. No new fluid solver is being written. |
| [Houdini Beach Tank](https://www.sidefx.com/docs/houdini/shelf/beachtank.html) | A useful established alternative for an artist if the Blender result is unsuitable; no purchase is required for this prototype. |
| [SideFX VAT documentation](https://www.sidefx.com/docs/houdini/nodes/out/labs--vertex_animation_textures-3.0.html) | Confirms the geometry/texture playback pattern and dynamic-topology/memory constraints. |
| [manthrax/three-vat](https://github.com/manthrax/three-vat) | Inspected documentation as a reference. No reusable license was established from the retrieved files; its exporter/runtime code was not copied. It also targets a newer Three.js dependency than we need to introduce for this pass. |
| [Older Three.js texture-cache example](https://github.com/sneha-belkhale/vertex-texture-cache) | Reference only; not adopted as a production dependency. |

The prototype reuses Blender's solver and the app's existing Three.js/shaders. Its small exporter/player implement the documented BOBVAT1 format below without adding a new rendering framework.

## Reproduce

Use official Blender 4.5 LTS. In the execution environment used for this pass, unpacking large executables inside the artifact workspace yielded incomplete files; extracting the same official archive into `/tmp/ocean-blender-runtime` produced a working Blender 4.5.9 runtime. This was an installation issue, not a fluid-solver limitation.

```bash
blender -b --factory-startup -t 6 --python tools/waves/bake_breaker.py -- \
  --out /tmp/bobuoy-wave --resolution 224 --frames 360 --width 6 --phase all

blender -b --factory-startup -t 6 --python tools/waves/export_breaker.py -- \
  --tank /tmp/bobuoy-wave --out /tmp/bobuoy-wave/export --max-triangles 4000

python3 tools/waves/inspect_sections.py /tmp/bobuoy-wave --output /tmp/wave-sections.png
python3 tools/waves/measure_sections.py /tmp/bobuoy-wave
python3 tools/waves/pack_indexed.py /tmp/bobuoy-wave/export /tmp/bobuoy-wave/indexed
python3 tools/waves/build_preview.py
node tests/waves/input-response.cjs
node tools/waves/check-shaders.cjs /tmp/wave-shaders.json
```

Copy a reviewed indexed export's `breaker.json` and its three `.gz` textures into `review/wave-lab/assets/`. Serve the repo over HTTP(S), then open the review page. The preview runs fixed, explicitly labelled conditions and does not call the live forecast service.

Before publication, `python3 tools/waves/package_preview.py` packs the isolated review as a checked delta against the existing published root. No separate source backup is uploaded. Automatic approval review rejected that backup upload over possible disclosure of unaccepted source. A subsequent comparison established that the candidate is exactly recoverable from the already-public sun/surf preview plus this pass's two input fixes. `recover_candidate.py` makes that recovery reproducible without a separate archive.

On a fresh published checkout, run `python3 tools/waves/recover_candidate.py /tmp/candidate.html` (the output must not exist), test with `node tests/waves/input-response.cjs /tmp/candidate.html`, and rebuild the full preview with `python3 tools/waves/build_preview.py --source /tmp/candidate.html`. The shader checker also reads the packaged preview directly. Do not run the input-fix test against the unchanged production root and mistake that expected failure for a broken saved candidate.

`--phase build`, `data`, and `mesh` allow resuming stages. Keep cache files outside Git. The scripts, saved parameters, and final exported geometry are the reproducible handoff. Initial piston sizing uses a linear wavemaker transfer function and must be calibrated from the nonlinear result.

## BOBVAT2 asset contract

- `breaker.json`: schema, units, source parameters, native sample FPS, frame count, frame vertex counts, atlas dimensions, position origin, bounds, compressed file names, byte counts, and acceptance status.
- `positions.f16.gz`: gzip-compressed little-endian half-float RGBA. RGB stores Y-up positions in metres relative to `positionCenterM`; alpha is 1 for valid vertices and 0 for padding.
- `normals.oct8.gz`: gzip-compressed RGBA8. RG stores octahedral normals; alpha is validity. These are data textures with no color-space conversion or mipmaps.
- `indices.u16x2.gz`: gzip-compressed RGBA8. RG is the low/high byte of one vertex index; BA is the next. Frame index tables use `indexRowsPerFrame` rows. The carrier's triangle slots look up that frame's vertex indices before fetching its positions and normals.
- Position/normal frames occupy `rowsPerFrame` complete rows. All widths/heights are explicit in the manifest. Per-frame deduplication reduces GPU memory without changing any position or normal bytes; the packer verifies an exact round trip for every frame.
- The intermediate BOBVAT1 export has expanded triangle corners. `pack_indexed.py` converts it to BOBVAT2; the browser only loads the smaller indexed form.
- Fluid remeshing changes vertex identity. Playback selects a native frame; it **does not blend unrelated triangle slots**. Better temporal interpolation requires explicit correspondence or velocity data.
- Positions are centered before half-float quantization. Export reports maximum position error, compressed download size, and actual decoded texture memory separately.
- Stop export if the atlas exceeds 4096 in either dimension. Limit simultaneously resident assets; a small download does not imply small GPU memory.

## What integration currently proves—and does not prove

The player uses the existing ocean's lighting functions and joins a finite baked surface patch through a masked overlap. The patch follows the app's shoreline curve. This is a geometric seam treatment, not a momentum-conserving coupling. The original beach slope is used for the revised tank. The tank's deep end is capped at 2.4 m; inspect that boundary before accepting the join.

Uniform similarity scaling changes lengths/heights together and changes time by the square root of scale. Arbitrarily changing period independently would require another appropriate simulation or a validated approximation. Playback speed is not automatically a new physical sea state.

The baked surface includes its simulated runup. Foam, droplets, backwash interaction with other waves, multiple overlapping patches, and seamless repeat cycles remain quality risks. They are not solved merely because the mesh loads.

The cloud browser used for this pass reports `GL_VENDOR = Disabled` and cannot create WebGL. Desktop EGL shader compilation is a useful code check but does not validate browser rendering or a physical iPhone. The preview includes a recording button for the actual rendered ocean canvas on a capable browser. Do not describe a Blender render or a native shader render as an in-browser recording.

## Acceptance before expanding

1. Measure the individual crest-to-trough height and report the gauge/window; do not relabel an undersized surge as 4 ft.
2. Observe approach → steepening → spill/plunge → impact → advancing and retreating wash in the fixed app camera.
3. No visible patch walls, seams, disappearing crest, or distracting native-frame stepping.
4. Modest similarity scaling preserves shape; independent period behavior is explicitly tested before supporting it.
5. Record an actual in-app clip and profile a physical iPhone against a 33.3 ms/frame budget over a sustained run.
6. Only after those checks, commission/generate additional regimes. Keep the one-breaker deliverable as the review gate.
