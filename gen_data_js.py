#!/usr/bin/env python3
"""Regenerate data.js and designations.js for the reach map tool.

Self-contained: reads its source JSON from this tool's own ``source/`` folder
(a snapshot of the codified rogue_trader corpus), so the tool runs anywhere
without a path back into codified-systems/.

    source/patavian_reach.json      -> data.js         (window.REACH_MAP_DATA)
    source/planet_designations.json -> designations.js (window.PLANET_DESIGNATIONS)

To pull fresh data from the corpus, re-copy those two files into source/ and
rerun this script. See README.md ("Updating the snapshot").
"""
import json
import pathlib

here = pathlib.Path(__file__).resolve().parent
src = here / "source"

mapdata = json.load(open(src / "patavian_reach.json", encoding="utf-8"))
(here / "data.js").write_text(
    "window.REACH_MAP_DATA = " + json.dumps(mapdata, ensure_ascii=False, indent=1) + ";\n",
    encoding="utf-8")

full = json.load(open(src / "planet_designations.json", encoding="utf-8"))
slim = [{"id": d["id"], "name": d["name"], "category": d.get("category"),
         "greek_class": d.get("greek_class"), "description": (d.get("description") or "")[:220]}
        for d in full["designations"]]
(here / "designations.js").write_text(
    "window.PLANET_DESIGNATIONS = " + json.dumps(slim, ensure_ascii=False, indent=1) + ";\n",
    encoding="utf-8")

print("wrote data.js (%d planets, %d routes) and designations.js (%d entries)"
      % (len(mapdata["planets"]), len(mapdata["routes"]), len(slim)))
