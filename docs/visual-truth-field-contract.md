# Visual Truth georeferenced field contract

**DRAFT — 2026-10-19. Awaiting Data-lane acknowledgment.** This is a proposed
V2/V3/V7 handoff, not an implemented endpoint, agreed schema, rendered result or
device pass. No runtime changes accompany this document. The user has superseded
the RC15 startup4 device-test request with Visual Truth; do not promote RC15.

## Verified integration starting point

The public GitHub branches `wip/data-v1` and `wip/features-v1` were both absent
(branch and file requests returned 404; the complete branch list agreed). This
does not establish what unpublished work exists in those threads.

The actual Features Sites source was opened read-only at commit
`d52c2cebb888e88497a60d5d735fc8b55e38dfed`, project
`appgprj_6ad04f8df74c8191a0b60ae2e10fa300`. Its scene remains the accepted
`scene-baseline-rc14c-startup` (`c6d8241f1a2f248e62b3ad3c15ffc1203df65473`).

| Current path | Git blob | Actual support / gap |
| --- | --- | --- |
| `server/feature-maps.js` | `ee47597041e65ed2f7a6e680c9c1e3ee051f7a36` | Four hours of IEM N0Q radar timestamps at five-minute cadence; GOES Band 13 IR via GIBS. Separate observation tiles, no shared scene field. |
| `server/storm-radar.js` | `e7600c67b96d4d10f3873eaa38aa9977f8a720ae` | Three radar frames decoded server-side; cached footprint tracks. No echo tops or raster nowcast. |
| `features/storm-model.js` | `9c414b8fa73cd6d7001968b3d419eb32cb8ae381` | 30 dBZ envelope, 35 dBZ core, centroid motion and estimated arrival; not full-field advection. |
| `server/hrrr-grid.js` | `478edfe514fc546ed2a48fc284c93c2494fb705b` | TMP/UGRD/VGRD sampled at 25 nodes. No simulated reflectivity. |
| `features/maps.js` | `027a32a2dab4c7a840ce9bdb4f85b1ad8e903a72` | MapLibre raster layers; shared selected clock, independently selected imagery. |
| `features/scene-bridge.inc.js` | `93c52b20b4bbcc5a9d5707796cdadbc6d512ddc5` | `conditionsJSON()`; `setConditions({radar})` is metadata-only. Other setter inputs are treated as complete forecasts. |
| `features/forecast-guard.js` | `b1d3143a8e322887438a06227a420f2e5d72adfb` | Existing `weatherField` is schema 1 with 22 offshore hourly point series. |
| `LICENSES-DATA.md` | `8478aa2dda0985a5025693b118142a3b20549bad` | Existing NOAA/IEM/GIBS/HRRR attribution and commercial-use record. Extend for new products. |

The Scene source audited at `ca42b26912675ba2d4253e7311631473b73007e9` has
`src/storm-cells-api.js` blob `4e814c5c750d52c5016a728b498c2440c1053d19`:
`__daybuoy.setConditions()` presently accepts only `stormCells` patches.
Therefore use a distinct additive **`geoWeather`** key and explicit narrow-patch
handling in both bridges. Never replace the existing `weatherField`, confuse a
field patch with a full forecast, or remove `conditions()`, `conditionsJSON()`,
`setConditions({stormCells})`, or Features `{radar}` behavior. Texture bytes are
loaded once per content ID, not cloned through every conditions/health poll.

## Canonical manifest and immutable image

Proposed endpoint: `GET /api/visual-weather?beach=<id>&time=<UTC-ms>`. It returns
the selected immutable frame manifest plus available frame times. Providers are
called server-side; caches are shared per beach and source update. URLs below
are illustrative field names, not deployed resources.

| Field | Required meaning |
| --- | --- |
| `schema` | Exact string `seaglass.geo-weather/1`. |
| `contentId` | SHA-256 of canonical JSON describing grid, channel encoding, source identities/times, processing version and decoded pixel hash. Exclude transport retrieval time and mutable URLs. |
| `beachId`, `center` | Profile ID; WGS84 `{lat, lon}` in degrees. |
| `grid` | Projection, extent, dimensions and north-up pixel convention below. |
| `image` | Same-origin immutable URL, MIME `image/png`, encoded byte length, encoded-file SHA-256 and decoded-RGBA SHA-256. |
| `validAt` | UTC epoch milliseconds represented by this frame; never request time substituted for source time. |
| `asOf` | Latest source/model information permitted when constructing this frame. |
| `issuedAt` | Model initialization/issue time; null for observations without an issue time. |
| `retrievedAt` | Actual transport retrieval time. Cache reads preserve it. |
| `kind` | `observed`, `extrapolated`, `model`, or `fixture`. |
| `sources` | Per channel: provider/product, object identity, observed scan start/end or model issue/valid time, retrieval time, native resolution, missing/stale status, attribution and license URL. |
| `processing` | Versioned reprojection, parallax policy, resampling, motion method, cloud adapter and palette IDs. |
| `uncertainty` | Lead seconds, source age, edge-softness policy below, and exact `est. · <source>` label for estimates. |

**Projection:** WGS84 ellipsoidal azimuthal equidistant centered on the beach
(`+proj=aeqd +lat_0=<lat> +lon_0=<lon> +datum=WGS84 +units=m`). Coordinates are
east/north metres. Extent is exactly `[-75000,-75000,75000,75000]`; initial image
size is 512×512. This is a 150 km square, not a 150 km radius. Native source
resolution remains recorded; a 293 m output pixel does not create finer data.

Rows run north to south; columns west to east. Pixel `(i,j)` represents its
center: `E=-75000+(i+0.5)*150000/512`,
`N=75000-(j+0.5)*150000/512`. Bounds and four WGS84 corners are derived from
this exact projection. Bounds alone are insufficient to define the transform.

The current Scene's +Z points offshore and +X points left. For profile-facing
bearing `f` clockwise from true north, convert metres using
`E=-x*cos(f)+z*sin(f)`, `N=x*sin(f)+z*cos(f)`. Image coordinates are
`u=(E+75000)/150000`, `v=(75000-N)/150000`. The upload adapter declares its
texture-origin convention and compensates exactly once. Clamp outside the
field to unavailable; never wrap/repeat it. Validate all cardinal bearings.
MapLibre uses a correctly reprojected Web Mercator derivative or mesh from this
same canonical image. A four-corner affine approximation is not an exact
reprojection. Record derivative parent `contentId` and processing version.

## Numeric channels and missingness

Lossless RGBA8 stores **data**, not display colors. Decode without gamma/color
conversion or alpha premultiplication; verify decoded bytes before upload.

| Channel | Decode | Validity |
| --- | --- | --- |
| R | Reflectivity `dBZ = byte*0.5-32` | A bit 0 |
| G | Cloud-mask/coverage value `byte/255` | A bit 1 |
| B | 18 dBZ echo-top altitude `byte*100` metres MSL | A bit 2 |
| A | Unsigned validity bitfield, not opacity | Bits 3–7 reserved, zero in v1 |

Missing values have their validity bit clear and channel byte zero. Zero with
its bit set is valid, and must not be mistaken for missing. Provider no-echo,
below-threshold, missing, outside-coverage and bad-quality flags require an
explicit ingestion table; do not map all flags to clear weather. Known absence
of an 18 dBZ echo may encode valid height zero. Reject out-of-range valid data
instead of silently clipping. Sample validity with nearest lookup; scalar
interpolation must renormalize valid neighbors and never interpolate a missing
sentinel into rain or cloud. Diagnostics retain per-channel availability.

G must come from an actual cloud mask/coverage product with a disclosed
conversion. **GOES Band 13 brightness is not cloud-cover percentage.** GOES
parallax correction or its absence must be recorded, with the same corrected
field used by map and scene. **18 dBZ echo top is not visible cloud top or cloud
base.** Vertical extent/base and optical density inferred from these inputs
remain `est. · <source>`; add optional quantitative GOES cloud-height data in a
versioned extension rather than relabeling echo top.

The canonical channels are not Takram layer-coverage channels. A deterministic
adapter must generate the low/mid/high local-weather coverage, density and
height controls expected by the selected cloud implementation. Cloud noise may
shape volume inside the shared footprint; it must not independently translate
its boundary. The map's radar palette and the scene's rain/base-darkness class
must use one versioned classification table. Proposed bands: below 15 dBZ
unclassified/very weak; 15–<35 green/light; 35–<50 yellow-orange/moderate;
50–<60 red/heavy; ≥60 purple/very heavy. These are display rules awaiting
agreement, not observed surface rain-rate measurements.

## One clock and one selection transaction

1. The controller requests a selected UTC time and receives immutable frame
   IDs. Observed, extrapolated and model products retain their own timestamps.
2. Load, verify and prepare the next map derivative and cloud bake offscreen.
   Keep the previous matched pair visible while either consumer is pending.
3. Commit one transaction `{selectionId, selectedAt, fromId, toId, blend}` only
   after both consumers acknowledge readiness. Both expose that transaction
   in their completion evidence. Reject stale asynchronous responses.
4. Both consumers use the same controller-owned blend value and clock during
   crossfade. Neither advances motion on wall-clock time independently. Freeze
   that transaction for paired captures; resume from the same absolute clock.
5. All advection/extrapolation is applied once in the canonical field stage.
   Disable separate bulk cloud-wind drift for its footprint. Small internal
   turbulence may animate without moving the shared boundary.

Forecast numbers describing the selected beach sample this same frame at the
origin for overlapping quantities. Unrelated hourly variables retain their
actual provider/time. A failed update retains the previous pair with its real
timestamp and delayed status; it never substitutes procedural weather and
calls that observed. Missing one product is disclosed per channel. Omitted
`geoWeather` preserves legacy operation; explicit null clears it; malformed
patches reject without replacing the last valid field. A profile change clears
the prior beach's selection and all in-flight work.

## V7 time and certainty fade proposal

Past two hours select actual observation frames; missing scans stay missing.
From the latest observation through +1 h use explicitly estimated tracked
motion. +1…+6 h uses NOAA HRRR simulated reflectivity with actual model cycle
and valid times. HRRR reflectivity alone cannot forecast GOES cloud coverage:
that channel needs its own modeled/estimated source or remains unavailable.
Transitions between observation, nowcast and model must be versioned and
shared; never relabel old satellite imagery as a forecast.

Proposed visual edge softness, **not a statistical confidence interval**:
observed=0 m additional softness; lead 0…60 min linearly 0…500 m;
60…360 min linearly 500…3000 m. Apply the same derived edge envelope to both
consumers. Preserve the canonical raw scalars and class peaks; do not blur
strong returns into a different asserted intensity class. Source pixel size,
quality and age remain separately visible in evidence. Observed data stays at
its real resolution; “sharp” does not mean invented subpixel detail. A product
older than its manifest's agreed maximum age is delayed, not current. Specific
stale-age budgets and this softness schedule require Data-lane acknowledgment.

## Truth gate and resource constraints

Five proposed deterministic cases: (1) light offshore green shower;
(2) approaching yellow/orange asymmetric bank; (3) red/purple core with known
echo-top height; (4) overhead rain with a dry clearing edge; (5) two crossing
moving systems plus nonprecipitating cloud gaps. Include observation, +1 h and
+6 h selected times across the cases. Real archived cases can replace fixtures
only with immutable source/time provenance; fixtures are always labeled.

Every pair records the same selection ID, content IDs, blend, valid time,
camera position/orientation and source resolution. Save both map and scene
captures, plus simulation/projection measurements; matching metadata alone
does not prove visible alignment.

- **User requirement:** bearing error ≤5°; size, intensity class and edge
  position matched; iPhone 120 seconds with ≥30 completed frames every second.
- **Proposed, not yet approved numeric tolerances:** centroid distance error
  ≤max(one native source pixel, 5%); footprint angular-width error ≤10%; boundary
  displacement ≤one native source pixel on observed inputs. Estimated inputs
  compare the same pre-softening contour and must also match their shared
  softness envelope. Verify declared dBZ class exactly at interior probes;
  no class verdict at nodata or transition-edge probes.
- Check simulation coordinates and completed cloud-cache projection as well
  as paired pixels, including cardinal directions and a 359°/1° wrap case.
  Earth curvature, camera occlusion and source parallax are recorded, not
  hidden by rotating the camera toward a fixture.
- Preserve existing 36 captures, surf-truth checks, Share/resume and acceptance
  budgets; no recording/encoding inside the timed FPS window. Retain current
  ≥36 average target, ≤10% late drift, DPR floor 1.1, four 256 FFT cascades and
  total GPU ≤accepted launch baseline+1.0 ms until explicitly superseded.
- No raised WebGPU limits: at most 12 uniform buffers, 10 storage buffers,
  16 samplers and 16 sampled textures per stage. Reuse the existing cloud bake;
  no per-pixel water work or unbounded per-frame texture creation. Cap residency
  to displayed and preparing frame pairs; release replaced images/buffers.
- No runtime promotion/tag until a matching passing device gate. CPU/schema
  tests cannot establish phone FPS, rendered alignment or visual acceptance.

## Acknowledgment needed before V2 integration

Data must confirm product IDs/access, projection/encoding, source timestamp
policy, immutable cache retention, cloud-mask/height availability, nowcast and
HRRR reflectivity delivery, nodata tables and license additions. Features must
confirm the additive bridge and shared map/scene transaction. Scene must
confirm the cloud adapter and measured GPU allocation. This document records
none of those agreements as already obtained.

Primary product definitions: [NOAA MRMS operational tables](https://www.nssl.noaa.gov/projects/mrms/operational/tables.php)
and [NOAA GOES cloud-top products](https://www.star.nesdis.noaa.gov/goesr/product_cp_cloud.php).
Preserve Tidewater/Takram MIT credits and source attribution; no crowd data or
advice wording. Never push GitHub main or print/commit credentials.
