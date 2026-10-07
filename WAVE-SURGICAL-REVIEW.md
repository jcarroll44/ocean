# Restore first; borrow one wave behavior at a time

## Implementation update — October 6, 2026, 04:18 UTC

The user approved a wave-only pass. `src/breaker-pass.js` now adapts the pinned ballistic-lip and landing-whitewater calculations described below into the existing mesh and foam buffer. It is available only through `?breakers=tidewater`; the ordinary URL retains the approved ocean until a rendered before/after comparison is reviewed. See `BREAKER-PASS.md` for the exact scope, checks and remaining visual gate. The historical source review below is retained as the provenance record.

## Earlier source-review round — October 6, 2026 UTC

This is a source review, not a new wave implementation. The sun camera is restored separately. Water, sky, lighting, weather effects, NOAA astronomy and menu styling remain the current app's own code. No Tidewater runtime code was added in this round. The required visual comparison and real-device frame-rate checks are blocked because browser recording is not available in this session; no wave port should pass that gate without them.

## Historical restored baseline

Approved pre-evaluation commit: `d008588a293bdfbafc78d530edbbf995f4808b1c` (October 4, 2026). The subsequent evaluation notes explicitly identified this as the unchanged approved homepage. Restore covers the complete tracked baseline, including original water, sky, lighting, camera, UI, build scripts, assets and quality settings. New engine integrations, comparison routes and their deployed assets are removed. The experiments remain recoverable in Git history; this is not a history rewrite.

At the rollback, rebuilding produced the identical `dist/index.html`; subsequent controls/menu/camera corrections mean the whole app no longer has that hash. The water/sky source is still unchanged. This establishes source identity, not a new iPhone rendering or performance test. No new wave behavior has been ported.

## What the current app actually uses

This checkout exposes custom Three.js/GLSL modules inside `src/scene-data.js`, including `incoming-waves.js`, `BreakingEvents`, `sectionCurve`, `breakingSurface`, `foamFragment` and `swash`. It does not expose a verified Water Pro displacement/foam API at these integration points. The plan below connects to the code actually running; it does not assume a missing API.

Reviewed Tidewater source: revision `4811ba48d795197de5621985f404e765c0b7c0ef`, previously vendored and retained in our Git history at `8118b3b`. Repository: https://github.com/dgreenheck/tidewater. Paths below are relative to that repository.

Evidence route: actual file bytes read with `git show 8118b3b:vendor/tidewater/<path>`, checked against that snapshot's `tidewater/upstream-integrity.json`. This is a pinned source review, not a claim about current upstream HEAD. The public repository page was reachable; its pinned raw/blob URLs could not be fetched this session. The preserved source is available, so none of the six requested wave features needs to be reconstructed from memory.

| Behavior | Tidewater file / function | What matters | Smallest connection to our water |
|---|---|---|---|
| Depth-triggered breaking | `src/ocean/ShoreWaves.js`: `shoreBreakDepth`, `shoreBreakParams` | Samples depth under the crest and derives shoaling → plunge → bore progress. Default depth ratio gamma is 0.78; it is a model parameter, not universal beach truth. | Our `depthTable` already limits height by depth and `BreakingEvents.update` tracks crests. Compare crest-sampled depth and transition continuity; do not replace the spectrum or blindly add another breaking rule. |
| Crest pitch and falling lip | `src/ocean/ShoreWaves.js`: `shoreProfile`; `src/ocean/Breakers.js`: `_buildMesh` vertex shader, `breakersProcessCrest`, `breakersPlunge` | A concave face and a separate ballistic lip ribbon share the crest position. Spray is emitted at physically related stages. | Adapt only the throw/fall curve to our `sectionCurve` / `breakingSurface` and existing tracked crest. Retain our water material and normal calculation. A separate ribbon is optional and higher risk; seam and depth-order artifacts must be tested. |
| Impact whitewater | `src/ocean/ShoreWaves.js`: `shoreWhitewater`, `shoreFaceFill` | Whitewater starts where the lip lands, spreads, then becomes a roller. The unbroken face stays clear. | Feed a landing-position and impact-progress mask from our existing event into `uBreakerInjection` and `foamFragment`. Keep existing foam buffers and lighting. This is the recommended first experiment. |
| Foam lace and decay | `src/ocean/SurfFoam.js`: `makeLaceTexture`, `laceData`, `surfFoamFlowLace`, `surfFoamShading`; `src/ocean/ShoreSim.js`: compute `main` | Dense whitewater thins into strands and bubbles; flow moves the pattern, while distance filtering prevents shimmer. | Add one CPU-generated, mipmapped lace texture to the existing foam material; drive coverage with our current foam density. Port pattern/coverage math to GLSL, not Tidewater's shader framework or lighting. Evaluate separately from impact timing. |
| Swash and wet sand | `src/ocean/ShoreWaves.js`: `shoreSwashRunup`, `shoreSwashClip`; `src/ocean/ShoreSim.js`: compute `main`, `shoreSimSandFoam` | Wave-linked run-up and backwash move a thin sheet. Foam advects, wetness persists, and retreat leaves residue. This is an analytic run-up plus state update, not a complete fluid solver. | Improve our existing `swash` and `foamFragment` using the same crest event that just broke. Preserve current foam/wetness channels; add residue only if needed. Keep our shoreline, sand shading and renderer. |

## Exact source excerpts and port boundaries

The following blocks are literal excerpts from the MIT-licensed pinned files, not replacement code written for DayBuoy. WGSL syntax and JavaScript template expressions are intentionally retained. The integration notes are our proposed adaptations, not Tidewater claims.

### 1. Breaking — `src/ocean/ShoreWaves.js`, `shoreBreakParams`

```wgsl
	P.db = pow( A * 3.556 / shoreP.gamma, 0.8 );
	P.b = ( P.db - d ) / ( P.db * shoreP.breakSpan ); // <0 shoaling, 0..1 plunging, >1 bore
	let shoal = pow( 10.0 / clamp( d, 0.35, 10.0 ), 0.25 );
	P.Ash = A * shoal;
```

Breaking progress is tied to each wave's amplitude and local depth, not a fixed line offshore. `shoreWaveAmp` adds wave-set and alongshore variation; `shoreBreakDepth` evaluates the crest's depth. Our `depthTable` already computes shoaling and a depth-limited gain, while `BreakingEvents.update` follows crests. Keep those; compare the current event phase to a crest-depth-based phase before changing the trigger. Do not import Tidewater's artificial sandbar/rip-channel terrain (`shoreBar`) into our beach or portray it as observed bathymetry.

### 2. Curl — `src/ocean/Breakers.js`, `Breakers._buildMesh` inline vertex shader

```wgsl
	let xl = Xi * q * max( pv, 0.0 );
	let fl = xl / Xi;
	let yl = - Yi * ( fl * fl ); // ballistic: the jet leaves the crest horizontally
	let onLip = root + d3 * xl + vec3f( 0.0, yl, 0.0 );
```

The sheet leaves the tracked crest horizontally and falls quadratically. `shoreProfile` in `ShoreWaves.js` supplies the concave face, then blends it into a convex bore. The visible lip is built inside `_buildMesh`; there is no standalone `lipPoint` API to import. Our `sectionCurve` already generates both CPU and GLSL deformation. A later port can replace only its throw/fall profile, anchored to the existing crest event and existing normals. Retain our material; importing the entire `Breakers` class would bring its GPU framework, spray and lighting dependencies and is explicitly out of scope.

### 3. Whitewater — `src/ocean/ShoreWaves.js`, `shoreWhitewater`

```wgsl
	let landed = smoothstep( 0.86, 0.99, P.b );
	let spread = sat( ( P.b - 0.9 ) / 0.45 );
	let reach = P.Xi * 0.25 + spread * ( P.Xi * 0.9 + 1.0 ); // radius around the plunge point
	let impact = landed * smoothstep( reach, reach * 0.6, abs( xi - P.Xi ) ) * ( 1.0 - smoothstep( 1.4, 1.9, P.b ) );
```

Foam begins around `P.Xi`, the landing point, only as the lip lands, expands and then yields to the roller. `shoreFaceFill` makes the foot of the face whiten before the crest. Our current `foamFragment` injects a broad Gaussian around the tracked crest, activated from event age. **First proposed port:** replace only that event source mask with an impact-centered mask, deriving the actual landing location from our own `sectionCurve`. Do not pretend event age in seconds is Tidewater's dimensionless `P.b`; explicitly map the existing throw/collapse phase, or derive contact with the water surface. Preserve our foam buffers, decay, ocean geometry and lighting for the first comparison.

### 4. Foam lace — `src/ocean/SurfFoam.js`, `surfFoamFlowLace`

```wgsl
		let p = ( q - v * ( ph - 0.5 ) ) / ${ f( LACE_TILE ) } + jitter;
		let w = 1.0 - abs( ph * 2.0 - 1.0 );
		out += textureSample( surfFoamLaceTex, smpAnisoRepeat, p ) * w;
```

Two staggered flow phases blend so foam moves without endlessly stretching a texture. `makeLaceTexture` / `laceData` generate a tileable distance-to-strand texture with bubbles and mottling; `surfFoamShading` turns density into a mat, holes and thinning lace, with footprint filtering. Port only that texture-generation and coverage/flow math into our existing GLSL foam material. Convert metres/flow units explicitly, reuse current accumulated density, and keep our shading—not `surfFoamLight` or Tidewater's sky. Distance filtering is part of the feature, not optional polish on a phone.

### 5. Swash — `src/ocean/ShoreWaves.js`, `shoreSwashRunup`

```wgsl
	let su = sat( tau / SHORE_SWASH_UP );
	let sb = sat( ( tau - SHORE_SWASH_UP ) / SHORE_SWASH_DOWN );
	let isUp = tau < SHORE_SWASH_UP;
	let Rh = select( 1.0 - pow( sb, 1.6 ), 1.0 - pow( 1.0 - su, 1.5 ), isUp ) * RhMax - 0.3;
```

Uprush slows as it climbs; backwash accelerates as the film drains. `tau` comes from when that wave reaches the shore, and `shoreSwashEdge` / `shoreSwashClip` clip a thin film at an analytic leading edge rather than exposing mesh triangles. Adapt this timing envelope to our existing `swash(float x)` and the same wave event that just broke. Use our actual beach slope (0.105 in the current beach function), not Tidewater's nominal 0.066. Preserve our shoreline and tide offset. Forecast height/period are inputs; this is not an observed run-up prediction.

### 6. Wet sand — `src/ocean/ShoreSim.js`, constructor's compute `main`

```wgsl
	let wet = max( here.y * exp( - dt / shoreSimP.dryTime ), cov );
```

The same compute body retains stranded foam:

```wgsl
	let stranded = min( here.x * 2.4, 1.0 ) * ( 1.0 - cov );
	let residue = max( here.z * mix( exp( - dt / shoreSimP.residueLife ), 0.85, cov ), stranded );
```

Wetness persists after water leaves, while residue stays on the sand and is washed away by the next wave. `shoreSimSandFoam` displays static strands and staggered bubble popping. Our `foamFragment` already stores density in R, wetness in G, and previous swash in B. Its wetness is byte-quantized with stochastic evaporation; replacing that with small exponential steps blindly could freeze drying through rounding. Keep existing wetness behavior initially. If residue is later added, use a spare channel deliberately; do not overwrite B, which drives our backwash. Retain our sand colour and existing wet-sand material response.

### What I do not have

- **I don't have it:** a verified Water Pro displacement/foam API in this checkout. The running water is the custom Three.js/GLSL implementation described above.
- **I don't have it:** a new rendered 3 ft / 5 ft comparison, or an iPhone performance measurement from this session. No visual improvement or 60 fps result is claimed.
- **I don't have it:** proof that current upstream HEAD is identical to the reviewed revision. The report is intentionally pinned to the preserved snapshot.

## Proposed rounds — not implemented

1. Impact-position whitewater, using existing foam layers.
2. Lace breakup and distance filtering.
3. Crest pitch/fall, only if the first comparisons still show a geometry problem.
4. Wave-linked swash/backwash and residual foam.

Depth-based breaking already exists; change it only if measured crest/depth behavior demonstrates a fault. Do not copy Tidewater's spectrum, atmosphere, clouds, terrain, post-processing, resolution defaults or camera.

For each round, record before/after at 390×844 with identical 3 ft and 5 ft input fixtures, period, direction, tide, time, camera, seed and render resolution. Label these as test inputs, not live forecasts or measured breaker heights. Compare full crest travel, lip attachment, foam continuity, shoreline edges and actual iPhone frame timing. Revert the isolated change if it does not improve the result. Never invent performance measurements.

When code or a generated texture algorithm is actually copied, retain Tidewater's MIT license and copyright (2026 DRG Software Solutions LLC) and add the attribution to the licenses screen in that same round. No Tidewater runtime code remains in this restored build.

## License for the quoted Tidewater excerpts

MIT License

Copyright (c) 2026 DRG Software Solutions LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
