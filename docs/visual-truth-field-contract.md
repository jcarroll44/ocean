# Visual Truth weather-field contract v1

**Scene consumer format finalized, 2026-10-19. Core format acknowledged by Data; live producer pending.**
The user approved a beach-local, north-up field sampled directly in scene
metres by our existing WGSL cloud adaptation. There is no globe/cube-sphere
mapping and no dependency on the stock Takram package's WebGPU support.
This document is the concrete Data/Features handoff, not evidence that a live
Data endpoint exists or that every route/field name has been implemented.

Data preview source `a4991c7c51b606592a0adfb4080191c21a727054`
(root HANDOFF.md, read 2026-10-19) confirms agreement on additive geoWeather,
512-square WGS84 ellipsoidal AEQD ±75 km, numeric RGBA8, immutable hashes and
per-channel timestamps/missingness. It explicitly marks source ingestion,
encoding and refresh as pending. The pinned forecast endpoint is already
`/api/data/v1.0.0`; it is not the semantic weather-field endpoint. Data has not
yet published the V2 route. Preserve its owner-private boundary: use a
server-held Site credential and same-origin proxy, never browser credentials.

Consumer implementation: `src/geo-weather-field.js`. Deterministic checks:
`node scripts/check-geo-weather-field.mjs`. These checks validate contracts,
coordinates, missingness and atomic selection; they do not establish rendered
alignment, first frame or iPhone performance.

## Shared field, independent presentation

Data produces one immutable semantic field per beach and selected source time.
The map and scene consume that exact field, with the same selection transaction,
class table and certainty envelope. They may color or render it differently;
they cannot select different weather or move its boundary independently.

Existing Features `weatherField` is an offshore hourly point series, so the
new additive conditions key is **`geoWeather`**. Preserve `conditions()`,
`conditionsJSON()`, `setConditions({stormCells})`, Features `{radar}` behavior
and full-forecast handling. Never interpret a field patch as a full forecast.
Image bytes do not appear in repeated conditions, health or debug snapshots.

Proposed Data route: `GET /api/visual-weather?beach=<id>&time=<UTC-ms>`.
It returns one manifest plus available frame times. Immutable image routes
are content-addressed. These route names remain a handoff proposal until Data
publishes its actual endpoint. All provider fetching/caching is server-side.

## Exact manifest shape

All times are UTC epoch milliseconds, not ISO strings. All hashes are 64-character
lowercase SHA-256 hex. Required field names below match the consumer validator.

```js
{
  schema: 'seaglass.geo-weather/1',
  contentId: '<sha256>',
  beachId: 'inlet-beach',
  center: { lat: 30.27, lon: -86.00 },
  grid: {
    projection: 'aeqd', datum: 'WGS84', units: 'm',
    extent: [-75000, -75000, 75000, 75000],
    width: 512, height: 512, rowOrder: 'north-to-south'
  },
  image: {
    url: '/api/visual-weather/frames/<contentId>.png',
    mimeType: 'image/png', byteLength: 123456,
    sha256: '<encoded-png-sha256>', decodedSha256: '<raw-rgba-sha256>'
  },
  validAt: 1792440000000,
  asOf: 1792440060000,
  issuedAt: null,
  retrievedAt: 1792440060000,
  kind: 'observed',
  sources: {
    reflectivity: {
      status: 'available', provider: 'NOAA', product: '<exact-product>',
      objectId: '<immutable-source-object>', attribution: '<source-credit>',
      validAt: 1792440000000, retrievedAt: 1792440060000,
      nativeResolutionM: 1000,
      scanStart: 1792439880000, scanEnd: 1792440000000,
      licenseUrl: '<source-terms-url>'
    },
    cloudCoverage: { status: 'missing', reason: '<specific-product-gap>' },
    echoTop18: { status: 'missing', reason: '<specific-product-gap>' }
  },
  processing: {
    version: '<reprojection-resampling-adapter-version>',
    classification: 'seaglass.dbz/1',
    parallax: 'corrected'
  },
  uncertainty: { leadSeconds: 0, edgeSoftnessM: 0, label: '<source>' }
}
```

The example coordinates/timestamps/product placeholders are illustrative, not
live Inlet data. `kind` is `observed`, `extrapolated`, `model` or `fixture`.
Source status is `available`, `stale` or `missing`; missing always carries a
reason. Available/stale sources require the provenance fields shown through
`nativeResolutionM`. Add actual scan bounds, model issue time, product-quality
flags and license URL whenever applicable. A single frame may have missing
channels; missing must never silently become clear sky or zero rainfall.

`validAt` is the represented instant; `asOf` is the latest information allowed
when constructing it. An observation cannot be later than `asOf`. Model frames
require actual `issuedAt`; observations use null. Transport cache hits retain
original `retrievedAt`. Source scan/model valid times remain independent of the
selected/request time. Record product-specific stale-age limits in processing
metadata when Data supplies them; do not invent current observations.

### Deterministic content identity

`geoWeatherContentPayload(manifest)` specifies the bytes to SHA-256 for
`contentId`: UTF-8 JSON with recursively sorted object keys containing
`schema`, `beachId`, `center`, `grid`, `validAt`, `asOf`, `issuedAt`, `kind`,
`sources`, `processing`, `uncertainty`, and `decodedSha256` from `image`.
Recursively omit `retrievedAt`, `url` and `licenseUrl`. Preserve arrays in order.
Exclude the PNG transport hash, byte count, URL and compression. Thus refetching
or losslessly recompressing the same semantic frame does not change identity;
changing weather, source identity/time, processing or certainty does.

Both encoded and decoded hashes must be verified by the loader before use.
Manifest validation alone is not integrity verification. Valid manifests are
copied and frozen; malformed updates retain the last valid field.

## Geometry: direct beach-local metres

Data reprojects to WGS84 ellipsoidal azimuthal equidistant centered on `center`:
`+proj=aeqd +lat_0=<lat> +lon_0=<lon> +datum=WGS84 +units=m`.
Coordinates are east/north metres. The fixed extent is a **150 km square**,
not a 150 km radius. A 512² grid is approximately 293 m per output pixel; it
does not improve the source's native resolution.

Rows go north to south, columns west to east. Pixel `(i,j)` is centered at
`E=-75000+(i+0.5)*150000/512`, `N=75000-(j+0.5)*150000/512`.
Bounds/corners are derived from this projection, not a substitute for it.

The Scene's +Z is offshore and +X is left. For profile-facing bearing `f`
clockwise from true north, including any camera-origin offset in scene metres:

```js
E = -x * cos(f) + z * sin(f)
N =  x * sin(f) + z * cos(f)
u = (E + 75000) / 150000
v = (75000 - N) / 150000
```

The cloud bake applies this directly to each world-space sample. Upload rows
without a second vertical flip. Outside `[0,1]²` is unavailable; never wrap the
field. Do not advect the footprint with an extra wind offset. Internal cloud
shape noise may move within the shared footprint.

MapLibre must use a correctly reprojected Web Mercator derivative or geographic
mesh derived from these same bytes. A four-corner affine image is not exact
reprojection. Derivatives carry parent `contentId` and processing version.
The <=5° bearing requirement does not authorize a knowingly wrong projection.

## Numeric RGBA8 and source meaning

| Channel | Decode | Validity |
| --- | --- | --- |
| R | Reflectivity `dBZ = byte*0.5-32` | A bit 0, mask 1 |
| G | Actual cloud-mask/coverage `byte/255` | A bit 1, mask 2 |
| B | 18 dBZ echo-top altitude `byte*100` metres MSL | A bit 2, mask 4 |
| A | Unsigned validity bitfield, **not opacity** | Bits 3–7 must be zero |

Missing channels have their bit clear and byte zero. Zero with its bit set is
valid. A source marked missing cannot have any valid pixels for that channel.
Known absence of an 18 dBZ echo can be valid zero height; missing coverage cannot.
Data must publish its provider no-echo/below-threshold/missing/bad-quality flag
table, and reject out-of-range values instead of clipping them silently.

**PNG must be decoded as raw bytes.** Canvas/HTML image alpha premultiplication
can destroy RGB precision when A contains small validity values. Use a raw PNG
decoder, verify decoded SHA-256, upload `rgba8unorm`, no sRGB conversion, no
premultiplication. Do not upload a display-colored radar screenshot as data.

Sample validity and intensity class from the nearest pixel. Bilinear continuous
values use only valid neighbors and renormalize weights per channel. If the
nearest pixel is missing that channel, the sample remains unavailable rather
than growing weather into nodata. `sampleGeoWeatherField` is the CPU reference.

GOES Band 13 brightness is **not** cloud-cover percentage. G needs a disclosed
actual cloud-mask/coverage product conversion. Correct GOES parallax when source
support exists, or record it as uncorrected; map and scene share the same policy.
An 18 dBZ echo top is **not** visible cloud top/base. Inferred cloud geometry,
base altitude, optical density and precipitation appearance stay `est. · <source>`.
Optional quantitative cloud-height data can be added in a versioned extension.

`seaglass.dbz/1` is a display classification, not a surface rain-rate claim:

| dBZ | Shared class | Scene intent |
| --- | --- | --- |
| <15 | `weak` | No asserted significant precipitation class |
| 15–<35 | `green` | Gray base, light rain veil |
| 35–<50 | `yellow-orange` | Darker base, rain shafts |
| 50–<60 | `red` | Very dark base, heavy curtains |
| >=60 | `purple` | Near-black base, heavy curtains, reduced visibility |

The map palette and scene use this one table. Cloud noise shapes volume inside
its footprint; it must not shift the classified boundary independently.

## Public API and lock-step publication

The additive Scene API is:

```js
const result = scene.setConditions({
  geoWeather: { manifest, rgba /* optional verified raw Uint8Array */, selectionId }
});
await result.ready; // Prepare only; old matched pair remains visible.
// Map prepares the matching field/derivative and acknowledges the same identity.
scene.commitGeoWeather(manifest.contentId); // Controller commits map in same turn.
scene.setConditions({ geoWeather: null }); // Explicitly clear the override.
```

`accepted/pending` and a `ready` promise report preparation. Omitting the key
preserves current behavior. Existing storm-cell patch handling is delegated
unchanged. A malformed patch is rejected without replacing the last valid field.
Conditions/health getters return immutable field identity, timestamps and status,
not RGBA data. The public API remains compatible with old callers.

`createGeoWeatherSelection()` supplies a shared controller primitive:

1. `prepare({selectionId,beachId,selectedAt,fromId,toId,blend})` returns a token.
2. `acknowledge(token,'map'|'scene',{fromId,toId})` marks verified readiness.
3. `commit(token)` succeeds only when both are ready. Old/stale tokens fail.
4. `blend(selectionId,0…1)` is controller-owned and identical for both consumers.
5. `clear()` invalidates pending work. A different beach discards the old field.

No consumer independently commits a just-loaded frame or advances forecast
motion using its wall clock. Retain the last matched pair while replacement
loads/bakes. A failed update exposes its original time and delayed status;
never label procedural fallback as observed. Paired captures freeze the same
transaction, field identity, absolute time and blend. Source field advection
is applied once, on the Data side.

## V7 time and certainty

The initial V2 cloud adapter accepts observed or fixture inputs with zero extra
edge softness. It rejects nonzero softness explicitly until V7 adds the shared
edge treatment; accepting the transport schema is not a claim that the renderer
has implemented the later forecast card.

- Past 2 h: actual observation frames; missing scans stay missing.
- Latest observation to +1 h: tracked-motion extrapolation, `est. · <source>`.
- +1…+6 h: actual NOAA HRRR simulated reflectivity, model issue/valid times,
  `est. · NOAA HRRR`. HRRR is a later Data increment; do not fabricate it now.
- A reflectivity forecast does not forecast GOES cloud cover. That channel needs
  an explicit modeled/estimated source or remains unavailable.

Shared **visual edge softness**, not a statistical confidence interval:
observed=0 additional metres; 0…60 min linearly 0…500 m;
60…360 min linearly 500…3000 m. Raw scalar/class peaks are retained. Both views
use the same edge envelope without misclassifying strong echoes by blurred color.
Observed sharpness stays limited by native resolution and quality.

Fixtures remain `kind:'fixture'`. `uncertainty.basis` is `observed` (default),
`extrapolated` or `model`, controlling the same softness policy while retaining
fixture identity. Estimated fixture labels include both `Fixture` and
`est. · <synthetic source>`. Fixtures never masquerade as actual observations.

## Truth gate, resource limits and delivery status

Five cases: light offshore green shower; asymmetric approaching yellow/orange
bank; red/purple core with known echo top; overhead rain/dry clearing edge;
two moving systems plus nonprecipitating cloud gaps. Cover observation, +1 h
and +6 h selections using honestly labeled fixtures until real archived fields
exist. Save side-by-side map/scene captures with selection/content IDs, blend,
time, source resolution and camera pose; metadata alone is not visual proof.

- Required bearing error <=5°; matching size, intensity class and edge position.
- Additional diagnostic targets: centroid distance error <=max(native pixel,5%);
  angular width error <=10%; observed edge displacement <=one native pixel.
  These numeric diagnostic targets are implementation choices, not separately
  user-approved acceptance changes. Estimate checks use the same raw contour
  and shared softness envelope. Do not classify nodata or transition-edge probes.
- Check actual completed cloud-cache coordinates/pixels, cardinal directions and
  359°/1° wrap. Record curvature, occlusion and parallax; do not turn the camera
  toward a fixture to hide a wrong mapping.
- Preserve existing 36 captures, wave truth, Share/resume and 120 s iPhone gate.
  No encoding during FPS measurement. Keep >=30 FPS every second, current >=36
  average target, <=10% late drift, DPR floor1.1, four256FFT cascades and total
  GPU<=accepted launch baseline+1 ms until explicitly superseded.
- Default limits only:12uniform buffers,10storage buffers,16samplers and
  16sampled textures per stage. Reuse existing cloud bake; no extra water-fragment
  math, render pass or unbounded texture residency. Keep displayed/preparing pairs
  bounded and release retired buffers/images. Water Pro remains an A/B candidate.
- No matching device pass or new baseline tag is claimed by contract tests.

Data still needs to acknowledge exact route/products/timestamps, canonical hash,
encoding, nodata ingestion, cloud-mask/echo-top availability and retention policy.
Features needs to wire the shared transaction and correctly reprojected map view.
This document records neither cross-lane acknowledgment nor a live source that
has not actually arrived. V1 engine comparison precedes V2 scene promotion.
Preserve Tidewater/Takram MIT credits, product attribution and private Water Pro
source. No crowd reports, advice wording, public-main writes or secrets.
