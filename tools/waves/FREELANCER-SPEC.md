# Single breaking-wave asset — contingency specification

Produce **one** convincing, physically simulated beach breaker for a Three.js browser app. No full library is commissioned at this stage.

## Physical setup

- Metric world units; gravity 9.81 m/s².
- One target individual wave with **1.2192 m crest-to-trough height** before breaking, characteristic period around 6 s. Supply the measured height, gauge location, and measurement method.
- Idealized beach slope 0.105 (approximately 1:9.5) near shore, documented offshore depth and boundaries. This is a prototype beach, not a measured Inlet Beach seabed.
- Film the same crest approaching, steepening, spilling or plunging as appropriate, impacting, and advancing/retreating wash. Do not force a giant barrel merely to make the motion dramatic.
- A useful alongshore span, initially 6–12 m, with boundary regions suitable for joining to a live ocean. Include enough quiet water before and after the active crest to inspect the join.
- Real-time playback at native 30 fps; select the useful action window. Do not supply only a rendered video.

## Required delivery

1. Editable Blender/Mantaflow or Houdini project, complete dependency list and reproducible bake settings. Identify any paid plugins or licenses before using them.
2. Actual simulated free-surface mesh sequence or Alembic cache with source FPS, frame range, world units, coordinate axes, shoreline location, depth profile, and initial conditions.
3. Normals and, if available, surface velocities, whitewater/foam emission data, and wetness/runup masks. Keep these separately identifiable.
4. A plain-material side/oblique review video and a water-material review video, both using a fixed camera and a visible metre scale reference.
5. A mobile export compatible with the BOBVAT2 specification in `README.md`, or an agreed Houdini VAT package with all decoding metadata. A lone GLB/FBX does not encode a changing-topology fluid sequence by itself.
6. Clear permission to use, modify, and redistribute the resulting baked assets commercially in the app; list any third-party assets and applicable terms.

## Initial budget targets

- Approximately 4,000–6,000 visible surface triangles per frame for the first test, preserving the lip silhouette.
- Atlas dimensions at most 4096; declared decoded GPU memory, not only compressed file size.
- Aim for about 10 MB or less additional compressed download for the single useful clip. Report tradeoffs if that compromises the geometry.
- Preview in the existing app camera on a real iPhone. Final acceptance depends on the in-app result, seam quality, height calibration, and sustained 30 fps—not the beauty render alone.

Deliver one sample first. Agree revisions and actual price/schedule before commissioning further assets. No hiring or spending has been performed by this development pass.
