# Reach Map Tool — The Patavian Reach Interactive Sector Chart

A single-page, browser-based **sector cartography editor** for the homebrew
*Patavian Reach* region of the Koronus Expanse. It renders an entirely vector
"hand-tinted engraved chart" of the sector — planets, warp routes, regions,
nebulae, political territories, fleets, and event markers — and lets the GM
pan, zoom, search, edit every element, and keep a dated timeline of sector
states. No build step, no server, no network: open the HTML file and go.

## Quick start

Open **`index.html`** directly in any modern browser (`file://` is fine).
The page loads three local scripts — `data.js`, `designations.js`, `app.js` —
and draws the whole chart from `window.REACH_MAP_DATA`.

## What it does

The sidebar is organised into collapsible sections; the **Mode** buttons (with
single-key shortcuts) switch what you edit on the canvas:

| Mode | Key | Purpose |
|------|-----|---------|
| Select   | `V` | Hover for info cards, click/drag elements, move labels |
| Planets  | `A` | Add and place planets, set designation/name |
| Routes   | `R` | Draw warp routes with bendable waypoints |
| Regions  | `G` | Edit the region tessellation — drag/insert/delete vertices, split, merge |
| Features | `X` | Draw and edit nebulae & stellar disturbances |
| Political| `P` | Draw territories of political control and place fleet pins |
| Events   | `E` | Place and edit event markers |

Other controls: **Chart** toggles each render layer and its opacity (warp-route
stability overlay, regions, events, political, planets, routes, extrasolar
features, gridlines); **Find** is a live search across planets, regions,
nebulae, fleets, and events that recenters the view on a hit; **Timeline** keeps
each Imperial-dated snapshot as a complete independent map state, with an
optional diff/compare overlay; **Data** offers Undo (`Ctrl+Z`), Export JSON, and
Import JSON. `Delete` removes the selected element; arrow keys nudge a selected
planet (hold `Shift` for larger steps); `Esc` backs out of a drawing sub-mode.

## Data model

Everything lives in one JSON document (`window.REACH_MAP_DATA`) in a single
3960×2160 coordinate space:

- `planets` — `{id, name, x, y, designation, …}`; designation glyphs/colors come
  from `window.PLANET_DESIGNATIONS`.
- `routes` — warp routes with waypoints and per-route styling.
- `tessellation` — `vertices` (flat `[x,y]` list) + `faces` (one per region:
  `{id, name, description, warp_stability, tint, label, vertices:[indices…]}`).
  **Invariant:** neighbouring faces share vertex objects, so every interior edge
  belongs to exactly two faces — coverage is total with no gaps or overlaps, and
  all region edits preserve this by construction. Planet→region membership is
  recomputed by point-in-polygon after any change.
- `nebulae`, territories, fleets, and events — extrasolar features and the
  political/event layers.

See **`PLAN.md`** for the full architecture, the lithograph render pipeline
(SVG layer stack), and the region-editing operation semantics.

## Files

| File | Role |
|------|------|
| `index.html`        | App shell, styling, sidebar UI |
| `app.js`            | All rendering and editing logic (`window.REACH_MAP_DATA`-driven) |
| `data.js`           | Generated: `window.REACH_MAP_DATA` (the sector document) |
| `designations.js`   | Generated: `window.PLANET_DESIGNATIONS` (planet-class lookup) |
| `gen_data_js.py`    | Regenerates `data.js` + `designations.js` from `source/` |
| `BUILD_INFO.json` / `_GENERATED_DO_NOT_EDIT.txt` | Build provenance (generated). Rebuild via `rogue_trader/build_apps.py` |
| `source/patavian_reach.json`      | Snapshot of the sector document (canonical input) |
| `source/planet_designations.json` | Snapshot of the Imperial planet-classification table |
| `reach_map_2.png`   | The original raster prototype (no longer rendered; kept for reference) |
| `PLAN.md`           | Design notes / architecture |

## Editing & persistence workflow

The browser app edits an in-memory copy. To persist your work:

1. In the **Data** section, click **Export JSON** — the browser downloads
   `patavian_reach.json`.
2. Save it over **`source/patavian_reach.json`**.
3. Run **`python gen_data_js.py`** to rebuild `data.js` (and `designations.js`).
4. Reload `index.html`.

`gen_data_js.py` is dependency-free (Python 3 standard library only).

## Built from the corpus

This is a **generated bundle** — do not hand-edit (see `_GENERATED_DO_NOT_EDIT.txt`). The
hand-edited source lives in `codified-systems/rogue_trader/apps/rt2_sector_map_tool/`; the `source/`
JSON bundled here is copied from the corpus (`data/maps/patavian_reach.json`,
`data/tables/planet_designations.json`) — the single source of truth.

Rebuild this bundle after editing the corpus data or the app source:

```
python codified-systems/rogue_trader/build_apps.py rt2_sector_map_tool
```

It re-copies the declared source, runs `gen_data_js.py`, and writes `BUILD_INFO.json`. You can
still edit + `gen_data_js.py` locally in this bundle (it's self-contained). See
`docs/TOOLS_PIPELINE_PLAN.md` for the architecture.

## Integration

Planet designations are shared with the corpus' `planet_designations.json`
taxonomy. The companion **system-tool** exposes a `#<system_id>` deep-link
contract so a planet on this sector chart can open its detailed star-system
view there.
