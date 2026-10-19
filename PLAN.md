# Interactive Patavian Reach Map — Plan

**Status:** v0.2 — vector lithograph base + full-coverage region tessellation. (v0.1 raster-overlay prototype: 2026-06-11, same day.) Source of truth: `data/maps/patavian_reach.json` (since 2026-10-18: `campaign/setting/patavian_reach/patavian_reach.json`).

## Architecture (v0.2)

Fully vector. The raster (`reach_map_2.png`) is no longer rendered — everything is SVG drawn from data in one 3960×2160 coordinate space: paper ground, region tints, engraved nebulae, graticule, frame/cartouche, routes, planets, labels. A CSS transform pans/zooms the lot. Visual language is an original 40k take on the Victorian hand-tinted engraved chart genre (the kind of map where colored washes denote zones of equal travel time): aged-paper ground, fine sepia ink linework, letterspaced caps for area names, stipple-engraved nebulae, and flat color washes that stop just short of the boundary lines as if tinted by hand.

The map's travel-time analog is **warp route stability** — each region carries a `warp_stability` attribute, and a toggle switches region fills from their individual chart tints to a stability-keyed palette with legend (stable → sage, variable → ochre, treacherous → vermilion, impassable → mulberry, uncharted → bare paper).

## Region tessellation

The entire canvas is partitioned into regions — no gaps, no overlaps, boundaries shared exactly.

**Data model** (`tessellation` in the JSON):
- `vertices` — flat list of `[x,y]` points.
- `faces` — one per region: `{id, name, description, warp_stability, tint, label:{x,y}, vertices:[indices...]}` where the index loop is the boundary polygon.
- **Invariant:** every edge (consecutive vertex pair in a loop) either appears in exactly two faces or lies on the canvas frame. All editing operations preserve this by construction — neighbors literally share vertex objects, so boundaries cannot diverge.

**Editing operations** (all undoable):
- *Drag vertex* — moves the point in every face that uses it; rejected if any affected polygon would self-intersect.
- *Insert vertex* — double-click a boundary edge; the new vertex is spliced into both adjacent faces.
- *Delete vertex* — Alt-click a vertex (refused if a face would drop below 3 vertices).
- *Split region* — draw a cut: click a point on the region's boundary, optional interior points, then a point on another stretch of boundary. Endpoints are projected onto their edges and inserted into both adjacent faces; the loop is partitioned into two faces. The new region inherits stability/tint and gets a placeholder name.
- *Merge regions* — select a region, choose "Merge into neighbor", click the neighbor. The shared vertex chain is removed and the loops concatenated; the *clicked survivor* keeps its attributes. Refused when the shared boundary is not a single contiguous chain.
- Region create/remove is exactly split/merge — coverage is total by definition.

**Dynamic planet containment:** ray-cast point-in-polygon assigns every planet to its containing face, recomputed after any geometry, planet, or import change. The region editor lists its planets live; the planet editor shows its owning region. Planets are never "in no region" (total coverage); a planet exactly on a boundary resolves to whichever face wins the cast — flagged visually if ambiguous.

**Seed:** the 8 v0.1 region labels became Voronoi cells of their label positions (computed offline, exact coverage verified: 18 vertices, 8 faces, area sum equals canvas). Cell shapes are convex placeholders — the intent is that boundaries get edited toward dramatic shapes in the tool. Stability defaults are speculative (`_note` on each face).

## Lithograph render pipeline (SVG layers, bottom→top)

1. **Paper** — parchment fill + `feTurbulence` grain, soft vignette.
2. **Region washes** — face polygons filled with tint (chart or stability palette), `feMorphology` erode + blur filter so the wash pulls back from the line work (hand-tint effect).
3. **Graticule** — faint sepia grid pattern.
4. **Nebulae** — 15 machine-traced polygons (OpenCV segmentation of the old raster, classed crimson/violet/azure/jade) rendered as stipple-pattern fills with broken ink outlines; the two faintest wisps of the original were below tracing threshold and are omitted (re-addable by hand).
5. **Region boundaries + names** — fine ink lines; letterspaced small-caps labels at the (draggable) label point.
6. **Routes** — engraved dashed ink (seed styles re-inked from gold to sepia for paper contrast); per-route styling retained.
7. **Planets + labels** — designation glyph conventions retained but redrawn as ink-ringed marks with a hand-tint color dot; serif labels in ink.
8. **Frame & cartouche** — double-rule border, corner ticks, orientation labels (Coreward/Rimward/Trailing/Spinward), title cartouche, and the stability legend (shown when stability tinting is on).

## Files

```
art/web/reach_map_tool/
  index.html      — markup + CSS + boot
  app.js          — all logic (render, tessellation engine, editors, IO)
  data.js / designations.js — generated wrappers (gen_data_js.py)
  reach_map_2.png — kept on disk as source reference only (not rendered)
  PLAN.md
data/maps/patavian_reach.json — canonical data (v0.2 schema; now campaign/setting/patavian_reach/)
```

Round trip unchanged: Export JSON → overwrite canonical file → `gen_data_js.py`.

## Phases

1. **v0.1** ✅ raster + overlay; designations, routes, planets.
2. **v0.2 (now)** ✅ vector lithograph base; full-coverage region tessellation with attributes and live planet containment; stability tint toggle.
3. **v0.3** — vectorise the three zone boundaries (Imperial Exclusion Zone, Marian-Tau Contested Zone, Ork Battleline) as editable engraved arcs; nebula shape editing + naming; curved/route-following labels; PNG/print export of the composed chart.
4. **v0.4** — pipeline hooks: `system_ref` links to generated systems; GM/player layer split; region attribute extensions (faction control, tithe, travel-time tables per stability).

## v0.3 design — curves & splines (IMPLEMENTED 2026-06-11; all three phases shipped as v0.3.0)

Every vector-editable object gains optional curved segments alongside the existing angular ones: region boundaries, warp routes, and extrasolar feature borders. Mixed geometry is first-class — any object can be part angular, part curved.

### The hard constraint: shared region boundaries

Region edges are shared by exactly two faces, and the tessellation's no-gap guarantee depends on both faces drawing *identical* geometry. Naive per-face splining (e.g., Catmull-Rom through each face's own loop) breaks this: the curve through edge (u,v) would depend on each face's *other* neighbors, so the two faces would bow the same edge differently. Junction vertices (degree ≥ 3) make per-vertex tangents ill-defined anyway.

**Resolution: curvature is a property of the edge, not the face.** A new `tessellation.edge_curves` map, keyed by the sorted vertex pair `"u-v"`, stores a single quadratic Bézier control point `{cp:[x,y]}`. Both adjacent faces render the same `Q` segment (reversed direction reverses cleanly); straight edges simply have no entry. Coverage stays exact by construction. Quadratic (one intuitive "bow" handle) now; cubic S-curves are a possible later upgrade.

### Geometry model per object

- **Regions** — `edge_curves` as above. Editing (Regions mode, region selected): a small square *bend handle* appears at each edge midpoint; dragging it bows the edge (control point derived so the curve passes through the handle); Alt-click resets the edge to straight. Both adjacent regions update live. Vertex insert on a curved edge subdivides the curve at the projection point (de Casteljau); vertex delete drops the two incident curve entries. Split/merge: curves on edges that survive keep their entries; the new cut is straight. `compactVertices` rewrites `edge_curves` keys through the remap.
- **Warp routes** — per-route `style.path: 'angular' | 'curved'` (default angular) in the route editor. Curved renders a Catmull-Rom spline through from-planet → waypoints → to-planet (standard CR→cubic-Bézier conversion, clamped ends). Waypoint handles work unchanged; a later phase can add per-waypoint corner overrides (kept out of phase 1 because waypoints are stored as bare `[x,y]` tuples — flags would live in a parallel array to avoid a breaking change).
- **Extrasolar features** — per-point smooth flags in a parallel array `pt_smooth` (0/1, same length as `pts`, default 0 so all existing traced shapes keep their current look). Rendering mixes sharp corners and CR-smoothed runs in one closed path. UX: Shift-click a vertex handle toggles corner ↔ smooth (handle shape signals state: square = corner, round = smooth); editor buttons *Smooth all* / *Sharpen all*. New features draw angular and are smoothed afterwards.

### Shared machinery

- `flattenLoop(face)` / `flattenPts(nb)` / `flattenRoute(r)` — one canonical flattening routine (≈16 samples per curve) used everywhere geometry is *interrogated* rather than drawn: simplicity validation, tessellation area check, planet/fleet containment, label centroids, route label midpoints. Both faces of a shared edge flatten through the same function and data, so sampled boundaries stay identical.
- Validation: `validateTess` edge-count topology is untouched (curves don't change the graph); `isSimple`/`isSimplePts` run on flattened polylines; a bend drag that makes a boundary self-intersect reverts on release exactly like vertex drags do today.
- Hit-testing: wash hit paths, route hit paths, and per-edge insertion hit elements all reuse the curved `d`, so clicking works on the drawn geometry, not the old chords.
- Undo/export: `edge_curves` lives inside `tessellation` and `pt_smooth` inside each feature, so existing snapshot/undo and export/import cover them with no changes. Schema bumps to 0.3.0 with per-phase migrations (all additive; absent fields mean fully angular, so old files load unchanged).

### Phasing

1. **0.3.0-a Routes** — lowest risk, no shared geometry: CR path, editor toggle, flattened label/hit. 
2. **0.3.0-b Features** — `pt_smooth`, mixed-path rendering, handle toggles, flattened validation.
3. **0.3.0-c Regions** — `edge_curves`, bend handles, subdivision on insert, flattened validation + containment, key remap in compaction. The heavy one; lands last with the most tests.

### Test plan (jsdom, per phase)

Route `d` gains `C` segments when toggled and reverts cleanly; the two faces sharing a bowed edge emit byte-identical curve segments; bend reset; a bow dragged across a neighboring edge is rejected; vertex insert on a curved edge preserves the curve shape (endpoints + midpoint within tolerance); containment of a planet/fleet sitting between a chord and its bowed boundary flips correctly; feature smooth flags round-trip through export; all existing suites as regression.

### Out of scope (noted for later)

Cubic handles with tangent symmetry (illustration-tool style), per-waypoint route corners, curved zone-boundary arcs (v0.3 zones work), and curve-aware PNG export.

## System tool & the sector→system link (v0.1.0 system tool shipped 2026-06-12; link is future work)

A companion tool at `art/web/system_tool/` charts and edits individual star systems produced by the RT14 generator (`rules/star_system_generation.py`), backed by `data/systems/library.json` and the `gen_system.py` bridge. Same architecture as this tool: vanilla JS + SVG, `file://`-safe `data.js`/`options.js` wrappers, editor enums extracted from the ingested world-generator tables.

**Link contract (planned, next iteration):**

1. The system tool already boots from and tracks `system_tool/index.html#<system_id>`.
2. Sector planets gain an optional `system_ref: "<system_id>"` field in `patavian_reach.json` (absent = no system charted).
3. The sector tool's planet editor gains a "System" row: a dropdown of library system ids (read from `../system_tool/data.js`) plus an **Open system chart** link that targets `../system_tool/index.html#<system_ref>`.
4. Generating a system for a planet from inside the sector tool stays manual for now (copy the composed `gen_system.py` command, run, reload) until a local server mode exists to invoke Python from the browser.

## Known limitations

- Seed region boundaries are convex Voronoi placeholders awaiting editorial reshaping.
- `warp_stability` defaults were assigned from region names and are speculative.
- Merge requires a single contiguous shared boundary; donut/enclave regions unsupported.
- Nebula traces are seed geometry; not yet editable in-tool (v0.3).
- Route review from v0.1 still open (Kairon–Castor tangle); Circador agri-vs-feral unresolved.
