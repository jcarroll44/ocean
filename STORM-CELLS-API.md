# Storm-cell conditions API — RC15

Revision `2026-10-16-stormcells-rc15`. Candidate based on `scene-baseline-rc14c-startup`; hardware/visual acceptance pending.

```js
const result = window.__daybuoy.setConditions({
  stormCells: [{
    bearingDeg: 225,
    distanceKm: 18,
    widthKm: 14,
    intensity: 0.85,
    motionBearingDeg: 45,
    speedKmh: 30
  }]
});

// Explicitly remove added cells.
window.__daybuoy.setConditions({ stormCells: [] });
```

The setter is available in both the private diagnostic host and the production host after initialization. It changes only storm cells. Native integrations may supply the same `stormCells` array in the complete `forecast` object passed to the existing `native.draw(packet)` API. Forecast rows carrying `stormCells` also flow through `conditions()` and `weatherScenePacket()` without another setter call.

| Field | Meaning | Accepted values |
|---|---|---|
| `bearingDeg` | Bearing from the current beach to the cell center, clockwise from true north | Finite number; wrapped to [0,360) |
| `distanceKm` | Horizontal distance from the beach to the cell center | 0–500 km |
| `widthKm` | Full horizontal diameter of the cloud footprint | 0.01–500 km |
| `intensity` | Relative local cloud/optical-depth enhancement | Clamped to 0–1, with diagnostic if clamped |
| `motionBearingDeg` | True-north clockwise direction the cell travels **toward** | Finite number; wrapped to [0,360) |
| `speedKmh` | Translation speed | 0–400 km/h |

All six fields must be finite numbers. Invalid entries are skipped with diagnostics. At most four valid cells are rendered; input inspection is bounded to 32 entries, and truncation is reported. The bounds control rendering cost, not a claim about storm measurements. Cell geometry/intensity are supplied by the caller; the scene neither fetches radar nor labels these values observed. Any user-facing estimate needs its actual source.

`setConditions` returns `accepted`, `changed`, `revision`, `stormCells`, `key`, and `diagnostics`. Omission or `undefined` preserves the current override; `[]` clears added cells; `null` rejects without replacing the prior override. Unsupported fields are reported and ignored. Repeating equivalent cells, reordering them, or wrapping bearings by 360° does not reset motion. Changing the beach profile clears the override. Complete native forecast snapshots with omitted cells use the legacy offshore field rather than retaining cells from the previous profile/hour.

Positions and velocities derive from the selected beach's offshore bearing. Motion is evaluated from the existing forecast plus weather clock; still capture freezes that same clock. New input geometry establishes a new position epoch. Independent motion is sampled into each existing 20-second atlas refresh and shown through the existing coherent crossfade; it adds no extra cloud refresh, texture, render pass or per-water-pixel work. The full no-cell rendering path, existing offshore shelf and cloud budgets remain intact.

The existing volume supplies local low/mid-cloud coverage, deeper rounded storm forms, optical depth/self-shadow and dark bases. Cells are world-space volumes in the existing cloud bake, never sprites. Budget: total GPU <= accepted launch +1.0 ms, measured on device; no raised WebGPU limits. Diagnostic evidence includes normalized inputs, projected positions, movement clock and baked snapshot state.

The RC15 baseline tag is reserved for a passing matching device run. Until then, `scene-baseline-rc14c-startup` remains the accepted launch scene. All unrelated scene work remains frozen.
