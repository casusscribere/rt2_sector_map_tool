window.REACH_MAP_DATA = {
 "id": "patavian_reach_map",
 "name": "The Patavian Reach — Sector Map",
 "version": "0.4.1",
 "compiled": "2026-06-11",
 "_provenance": "user_homebrew_transcribed",
 "_provenance_note": "Planet names, positions, and designations transcribed from art/external/user_supplied/sector/ReachMap/reach_map_2.png (3960x2160). Positions cross-checked against OpenCV Hough-circle detection of the raster; PR0B-1 position taken from NewMap.psd layer bbox. Warp routes are a best-effort transcription of the dashed yellow lines and SHOULD BE REVIEWED in the map tool; waypoints are approximate. Designation assignments read from marker glyph/colour against the map's own legend; entries flagged with _note are uncertain. v0.2: raster background replaced by vector lithograph rendering; region tessellation seeded from Voronoi of v0.1 label points; nebula shapes machine-traced from the raster (two faintest wisps omitted); warp_stability defaults are speculative homebrew. v0.2.2: nebulae carry per-feature style (color/fill pattern/density/border) and label positions for the Extrasolar editing mode. v0.2.5: features carry a subtype (nebula | warp_storm). v0.2.6: political_entities list + per-planet owner field (user-built; no canonical assignments seeded). v0.2.9: region chart tints behind a default-off toggle; routes carry an owner (political entity id). v0.2.10: global region-tints toggle replaced by per-region tint_enabled (default off). v0.2.11: optional extended border-gridlines layer. v0.2.13: canvas.grid (148px = 6 days warp travel) derived from Map.png. v0.2.14: per-overlay global opacity (stability/political/regions). v0.2.16: opacity sliders extended to planets/routes/features/gridlines. v0.2.18: fleets layer (pins with owner/commander/ships; ship classes per RT hull categories). v0.3.0: optional curves — edge_curves (regions), style.path (routes), pt_smooth (features); absent/zeroed fields mean fully angular. v0.3.4: political_territories — user-drawn polygons of political control, rendered with the Political overlay. v0.4.0: timeline — multiple dated map states (Imperial-format date strings are user-entered free text); top-level mutable sections mirror the current timeline entry. v0.4.1: events layer (categorised markers; initial category space_battle with crossed-swords glyph); events are part of each timeline state.",
 "_authority": "tier_3_homebrew",
 "canvas": {
  "width": 3960,
  "height": 2160,
  "orientation_labels": {
   "top": "Coreward",
   "bottom": "Rimward",
   "left": "Trailing",
   "right": "Spinward"
  },
  "grid": {
   "step": 148,
   "days_per_square": 6,
   "conditions": "under optimum conditions",
   "_source": "Scale note and grid from user's Map.png (ReachMap folder): grid spacing measured at 141.5px there, converted to this canvas via planet-pair correspondence (x1.043; Krugmar–Relicath and Fal'an–Relicath pairs agree)."
  }
 },
 "designation_source": "data/tables/planet_designations.json",
 "legend_designation_map": {
  "_doc": "Maps this map's legend classes to planet_designations.json ids. 'special', 'forbidden_world', 'unclassified', and 'abaoth_discovery' are map-local classes with no 1:1 corpus designation.",
  "Hive World": "hive_world",
  "Shrine World": "shrine_world",
  "Agri-World": "agri_world",
  "Feudal World": "feudal_world",
  "Feral World": "feral_world",
  "Pleasure World": "paradise_world",
  "Penal World": "penal_world",
  "Mining World": "mining_world",
  "Forge World": "forge_world",
  "Cemetary World": "cemetery_world",
  "Frontier World": "frontier_world",
  "Special": "special",
  "Forbidden World": "forbidden_world",
  "Dead World": "dead_world",
  "Gas Giant": "gas_giant",
  "Death World": "death_world",
  "War World": "war_world",
  "Unclassified": "unclassified",
  "Abaoth Discovery": "abaoth_discovery"
 },
 "local_designations": [
  {
   "id": "special",
   "name": "Special",
   "_note": "Map-local: stations, graveyards, anomalies (cyan hexagon glyph)."
  },
  {
   "id": "forbidden_world",
   "name": "Forbidden World",
   "_note": "Map-local; closest corpus id: quarantined_world."
  },
  {
   "id": "unclassified",
   "name": "Unclassified",
   "_note": "Map-local: unsurveyed/unclaimed (plain white circle)."
  },
  {
   "id": "abaoth_discovery",
   "name": "Abaoth Discovery",
   "_note": "Campaign-specific class from the map legend addendum."
  }
 ],
 "zones": [
  {
   "name": "Imperial Exclusion Zone",
   "style": "green-dashed-arc",
   "_note": "Arc north of Grizdek/Arguin; not yet vectorised."
  },
  {
   "name": "Marian-Tau Contested Zone",
   "style": "green-dashed-curve",
   "_note": "Curve through Gallowdark region; not yet vectorised."
  },
  {
   "name": "Ork Battleline",
   "style": "green-dashed-curve",
   "_note": "Left edge near Krugmar; not yet vectorised."
  }
 ],
 "planets": [
  {
   "id": "basilicana_novum",
   "name": "Basilicana Novum",
   "x": 873,
   "y": 262,
   "designation": "shrine_world"
  },
  {
   "id": "tertholen",
   "name": "Tertholen",
   "x": 983,
   "y": 356,
   "designation": "frontier_world"
  },
  {
   "id": "neu_askania",
   "name": "Neu Askania",
   "x": 979,
   "y": 454,
   "designation": "frontier_world"
  },
  {
   "id": "roanoke",
   "name": "Roanoke",
   "x": 1114,
   "y": 444,
   "designation": "frontier_world"
  },
  {
   "id": "arguin",
   "name": "Arguin",
   "x": 1302,
   "y": 478,
   "designation": "frontier_world"
  },
  {
   "id": "grizdek",
   "name": "Grizdek",
   "x": 828,
   "y": 632,
   "designation": "feudal_world"
  },
  {
   "id": "vulci",
   "name": "Vulci",
   "x": 453,
   "y": 718,
   "designation": "mining_world"
  },
  {
   "id": "krugmar",
   "name": "Krugmar",
   "x": 89,
   "y": 815,
   "designation": "unclassified"
  },
  {
   "id": "tyrus",
   "name": "Tyrus",
   "x": 412,
   "y": 833,
   "designation": "forge_world"
  },
  {
   "id": "osca",
   "name": "Osca",
   "x": 373,
   "y": 965,
   "designation": "forbidden_world"
  },
  {
   "id": "soranus",
   "name": "Soranus",
   "x": 447,
   "y": 994,
   "designation": "frontier_world"
  },
  {
   "id": "hadria",
   "name": "Hadria",
   "x": 396,
   "y": 1105,
   "designation": "death_world"
  },
  {
   "id": "gallowdark",
   "name": "Gallowdark",
   "x": 766,
   "y": 1006,
   "designation": "special"
  },
  {
   "id": "erisi",
   "name": "Erisi",
   "x": 897,
   "y": 840,
   "designation": "hive_world"
  },
  {
   "id": "pella",
   "name": "Pella",
   "x": 1262,
   "y": 1042,
   "designation": "hive_world"
  },
  {
   "id": "kairon",
   "name": "Kairon",
   "x": 1520,
   "y": 1127,
   "designation": "hive_world"
  },
  {
   "id": "demetar",
   "name": "Demetar",
   "x": 1102,
   "y": 1226,
   "designation": "agri_world"
  },
  {
   "id": "pollux",
   "name": "Pollux",
   "x": 1715,
   "y": 1177,
   "designation": "dead_world"
  },
  {
   "id": "castor",
   "name": "Castor",
   "x": 1625,
   "y": 1268,
   "designation": "frontier_world"
  },
  {
   "id": "hesperida",
   "name": "Hesperida",
   "x": 2147,
   "y": 339,
   "designation": "forbidden_world"
  },
  {
   "id": "takedakure",
   "name": "Takedakure",
   "x": 1917,
   "y": 434,
   "designation": "war_world"
  },
  {
   "id": "kalova",
   "name": "Kalova",
   "x": 2281,
   "y": 527,
   "designation": "special"
  },
  {
   "id": "junkrat_station",
   "name": "Junkrat Station",
   "x": 2277,
   "y": 970,
   "designation": "special"
  },
  {
   "id": "pahror",
   "name": "Pahror",
   "x": 2668,
   "y": 350,
   "designation": "unclassified"
  },
  {
   "id": "relicath",
   "name": "Relicath",
   "x": 3243,
   "y": 542,
   "designation": "unclassified"
  },
  {
   "id": "hyrol",
   "name": "Hyrol",
   "x": 2803,
   "y": 811,
   "designation": "cemetery_world"
  },
  {
   "id": "pox",
   "name": "Pox",
   "x": 678,
   "y": 1345,
   "designation": "forbidden_world"
  },
  {
   "id": "apatos",
   "name": "Apatos",
   "x": 968,
   "y": 1403,
   "designation": "hive_world"
  },
  {
   "id": "aun_avre",
   "name": "Aun'avre",
   "x": 330,
   "y": 1687,
   "designation": "hive_world"
  },
  {
   "id": "vail",
   "name": "Vail",
   "x": 1058,
   "y": 1650,
   "designation": "feudal_world"
  },
  {
   "id": "saicea",
   "name": "Saicea",
   "x": 457,
   "y": 1907,
   "designation": "mining_world"
  },
  {
   "id": "fal_an",
   "name": "Fal'an",
   "x": 219,
   "y": 1962,
   "designation": "agri_world"
  },
  {
   "id": "scyl",
   "name": "Scyl",
   "x": 985,
   "y": 1905,
   "designation": "frontier_world"
  },
  {
   "id": "ravndal",
   "name": "Ravndal",
   "x": 1051,
   "y": 1990,
   "designation": "death_world"
  },
  {
   "id": "port_meiron",
   "name": "Port Meiron",
   "x": 1354,
   "y": 1700,
   "designation": "penal_world"
  },
  {
   "id": "kraken_graveyard",
   "name": "Kraken Graveyard",
   "x": 1516,
   "y": 1800,
   "designation": "special"
  },
  {
   "id": "pr0b_1",
   "name": "PR0B-1",
   "x": 1740,
   "y": 1676,
   "designation": "abaoth_discovery",
   "_note": "Position from PSD layer 'PR0B-1' bbox center (canonical)."
  },
  {
   "id": "circador",
   "name": "Circador",
   "x": 1854,
   "y": 1734,
   "designation": "feral_world",
   "_note": "Marker green; agri vs feral ambiguous at this resolution."
  },
  {
   "id": "garmr",
   "name": "Garmr",
   "x": 1922,
   "y": 1537,
   "designation": "mining_world"
  },
  {
   "id": "station_128",
   "name": "Station 128",
   "x": 2170,
   "y": 1576,
   "designation": "special"
  },
  {
   "id": "budir",
   "name": "Buðir",
   "x": 1561,
   "y": 2049,
   "designation": "agri_world"
  },
  {
   "id": "djupidalur",
   "name": "Djúpidalur",
   "x": 1625,
   "y": 2010,
   "designation": "mining_world"
  },
  {
   "id": "laugarbrekka",
   "name": "Laugarbrekka",
   "x": 1735,
   "y": 2049,
   "designation": "agri_world"
  },
  {
   "id": "haraldssun",
   "name": "Haraldssun",
   "x": 1973,
   "y": 2049,
   "designation": "gas_giant"
  },
  {
   "id": "aegis",
   "name": "Aegis",
   "x": 2651,
   "y": 1406,
   "designation": "unclassified"
  },
  {
   "id": "bulwark",
   "name": "Bulwark",
   "x": 2761,
   "y": 1383,
   "designation": "unclassified"
  },
  {
   "id": "bastion",
   "name": "Bastion",
   "x": 2687,
   "y": 1486,
   "designation": "unclassified"
  },
  {
   "id": "rampart",
   "name": "Rampart",
   "x": 2641,
   "y": 1508,
   "designation": "unclassified"
  },
  {
   "id": "lr_2784b_35",
   "name": "LR-2784b-35",
   "x": 2962,
   "y": 1990,
   "designation": "unclassified"
  }
 ],
 "routes": [
  {
   "id": "rt_tyrus_erisi",
   "from": "tyrus",
   "to": "erisi",
   "waypoints": [],
   "label": null,
   "style": {
    "stroke": "#7a5c2e",
    "width": 2.5,
    "dash": "10 8",
    "labelColor": "#6b5134",
    "path": "angular"
   },
   "owner": null
  },
  {
   "id": "rt_erisi_grizdek",
   "from": "erisi",
   "to": "grizdek",
   "waypoints": [],
   "label": null,
   "style": {
    "stroke": "#7a5c2e",
    "width": 2.5,
    "dash": "10 8",
    "labelColor": "#6b5134",
    "path": "angular"
   },
   "owner": null
  },
  {
   "id": "rt_grizdek_arguin",
   "from": "grizdek",
   "to": "arguin",
   "waypoints": [
    [
     1160,
     520
    ]
   ],
   "label": null,
   "style": {
    "stroke": "#7a5c2e",
    "width": 2.5,
    "dash": "10 8",
    "labelColor": "#6b5134",
    "path": "angular"
   },
   "owner": null
  },
  {
   "id": "rt_erisi_pella",
   "from": "erisi",
   "to": "pella",
   "waypoints": [],
   "label": null,
   "style": {
    "stroke": "#7a5c2e",
    "width": 2.5,
    "dash": "10 8",
    "labelColor": "#6b5134",
    "path": "angular"
   },
   "owner": null
  },
  {
   "id": "rt_pella_kairon",
   "from": "pella",
   "to": "kairon",
   "waypoints": [],
   "label": null,
   "style": {
    "stroke": "#7a5c2e",
    "width": 2.5,
    "dash": "10 8",
    "labelColor": "#6b5134",
    "path": "angular"
   },
   "owner": null
  },
  {
   "id": "rt_kairon_junkrat",
   "from": "kairon",
   "to": "junkrat_station",
   "waypoints": [
    [
     1750,
     1085
    ],
    [
     2100,
     1070
    ]
   ],
   "label": null,
   "style": {
    "stroke": "#7a5c2e",
    "width": 2.5,
    "dash": "10 8",
    "labelColor": "#6b5134",
    "path": "angular"
   },
   "owner": null
  },
  {
   "id": "rt_pella_demetar",
   "from": "pella",
   "to": "demetar",
   "waypoints": [],
   "label": null,
   "style": {
    "stroke": "#7a5c2e",
    "width": 2.5,
    "dash": "10 8",
    "labelColor": "#6b5134",
    "path": "angular"
   },
   "owner": null
  },
  {
   "id": "rt_demetar_apatos",
   "from": "demetar",
   "to": "apatos",
   "waypoints": [],
   "label": null,
   "style": {
    "stroke": "#7a5c2e",
    "width": 2.5,
    "dash": "10 8",
    "labelColor": "#6b5134",
    "path": "angular"
   },
   "owner": null
  },
  {
   "id": "rt_apatos_pox",
   "from": "apatos",
   "to": "pox",
   "waypoints": [],
   "label": null,
   "style": {
    "stroke": "#7a5c2e",
    "width": 2.5,
    "dash": "10 8",
    "labelColor": "#6b5134",
    "path": "angular"
   },
   "owner": null
  },
  {
   "id": "rt_apatos_vail",
   "from": "apatos",
   "to": "vail",
   "waypoints": [],
   "label": null,
   "style": {
    "stroke": "#7a5c2e",
    "width": 2.5,
    "dash": "10 8",
    "labelColor": "#6b5134",
    "path": "angular"
   },
   "owner": null
  },
  {
   "id": "rt_vail_scyl",
   "from": "vail",
   "to": "scyl",
   "waypoints": [],
   "label": null,
   "style": {
    "stroke": "#7a5c2e",
    "width": 2.5,
    "dash": "10 8",
    "labelColor": "#6b5134",
    "path": "angular"
   },
   "owner": null
  },
  {
   "id": "rt_scyl_ravndal",
   "from": "scyl",
   "to": "ravndal",
   "waypoints": [],
   "label": null,
   "style": {
    "stroke": "#7a5c2e",
    "width": 2.5,
    "dash": "10 8",
    "labelColor": "#6b5134",
    "path": "angular"
   },
   "owner": null
  },
  {
   "id": "rt_aun_avre_apatos",
   "from": "aun_avre",
   "to": "apatos",
   "waypoints": [
    [
     790,
     1490
    ]
   ],
   "label": null,
   "style": {
    "stroke": "#7a5c2e",
    "width": 2.5,
    "dash": "10 8",
    "labelColor": "#6b5134",
    "path": "angular"
   },
   "owner": null
  },
  {
   "id": "rt_kairon_castor",
   "from": "kairon",
   "to": "castor",
   "waypoints": [
    [
     1530,
     1430
    ]
   ],
   "label": null,
   "style": {
    "stroke": "#7a5c2e",
    "width": 2.5,
    "dash": "10 8",
    "labelColor": "#6b5134",
    "path": "angular"
   },
   "owner": null
  },
  {
   "id": "rt_castor_garmr",
   "from": "castor",
   "to": "garmr",
   "waypoints": [
    [
     1647,
     1428
    ],
    [
     1800,
     1480
    ]
   ],
   "label": null,
   "style": {
    "stroke": "#7a5c2e",
    "width": 2.5,
    "dash": "10 8",
    "labelColor": "#6b5134",
    "path": "angular"
   },
   "owner": null
  },
  {
   "id": "rt_vail_kraken",
   "from": "vail",
   "to": "kraken_graveyard",
   "waypoints": [
    [
     1300,
     1760
    ]
   ],
   "label": null,
   "style": {
    "stroke": "#7a5c2e",
    "width": 2.5,
    "dash": "10 8",
    "labelColor": "#6b5134",
    "path": "angular"
   },
   "owner": null
  },
  {
   "id": "rt_kraken_port_meiron",
   "from": "kraken_graveyard",
   "to": "port_meiron",
   "waypoints": [],
   "label": null,
   "style": {
    "stroke": "#7a5c2e",
    "width": 2.5,
    "dash": "10 8",
    "labelColor": "#6b5134",
    "path": "angular"
   },
   "owner": null
  }
 ],
 "tessellation": {
  "_doc": "Planar partition of the full canvas. vertices = [[x,y],...]; each region face lists vertex indices forming its boundary loop. Invariant: every edge is shared by exactly two faces or lies on the canvas frame — editing operations in the tool preserve this; validate_tessellation() in the tool and scripts/ recheck it. edge_curves maps a sorted vertex-pair key \"u-v\" to {cp:[x,y]} — a quadratic Bézier control point shared by both adjacent faces, so curved boundaries stay identical on both sides.",
  "vertices": [
   [
    0,
    0
   ],
   [
    560.7,
    0.0
   ],
   [
    907.7,
    704.9
   ],
   [
    789.1,
    1251.7
   ],
   [
    0.0,
    1393.5
   ],
   [
    2081.8,
    0.0
   ],
   [
    2091.2,
    730.5
   ],
   [
    3672.0,
    0.0
   ],
   [
    2475.1,
    854.9
   ],
   [
    2148.5,
    803.1
   ],
   [
    3960,
    0
   ],
   [
    3960,
    2160
   ],
   [
    3740.0,
    2160.0
   ],
   [
    892.6,
    1443.5
   ],
   [
    1873.4,
    1654.2
   ],
   [
    2060.4,
    2160.0
   ],
   [
    792.9,
    2160.0
   ],
   [
    0,
    2160
   ]
  ],
  "faces": [
   {
    "id": "the_green_line",
    "name": "The Green Line",
    "description": "",
    "warp_stability": "treacherous",
    "tint": "#b5c4a1",
    "label": {
     "x": 190,
     "y": 900
    },
    "vertices": [
     0,
     1,
     2,
     3,
     4
    ],
    "_note": "Boundary = seed Voronoi cell of the original label position; stability default is speculative — review in tool.",
    "tint_enabled": false
   },
   {
    "id": "cumaean_recess",
    "name": "Cumaean Recess",
    "description": "",
    "warp_stability": "variable",
    "tint": "#e3bfae",
    "label": {
     "x": 1500,
     "y": 255
    },
    "vertices": [
     1,
     5,
     6,
     2
    ],
    "_note": "Boundary = seed Voronoi cell of the original label position; stability default is speculative — review in tool.",
    "tint_enabled": false
   },
   {
    "id": "the_pocket",
    "name": "The Pocket",
    "description": "",
    "warp_stability": "stable",
    "tint": "#aebfc9",
    "label": {
     "x": 2670,
     "y": 240
    },
    "vertices": [
     5,
     7,
     8,
     9,
     6
    ],
    "_note": "Boundary = seed Voronoi cell of the original label position; stability default is speculative — review in tool.",
    "tint_enabled": false
   },
   {
    "id": "accursed_cacophony",
    "name": "Accursed Cacophony",
    "description": "",
    "warp_stability": "impassable",
    "tint": "#c9a3ab",
    "label": {
     "x": 3120,
     "y": 870
    },
    "vertices": [
     7,
     10,
     11,
     12,
     8
    ],
    "_note": "Boundary = seed Voronoi cell of the original label position; stability default is speculative — review in tool.",
    "tint_enabled": false
   },
   {
    "id": "the_core",
    "name": "The Core",
    "description": "",
    "warp_stability": "stable",
    "tint": "#ded3a9",
    "label": {
     "x": 1480,
     "y": 1180
    },
    "vertices": [
     13,
     3,
     2,
     6,
     9,
     14
    ],
    "_note": "Boundary = seed Voronoi cell of the original label position; stability default is speculative — review in tool.",
    "tint_enabled": false
   },
   {
    "id": "abyssal_strand",
    "name": "Abyssal Strand",
    "description": "",
    "warp_stability": "variable",
    "tint": "#b3aec9",
    "label": {
     "x": 2470,
     "y": 1500
    },
    "vertices": [
     12,
     15,
     14,
     9,
     8
    ],
    "_note": "Boundary = seed Voronoi cell of the original label position; stability default is speculative — review in tool.",
    "tint_enabled": false
   },
   {
    "id": "tymors_grasp",
    "name": "Tymor's Grasp",
    "description": "",
    "warp_stability": "variable",
    "tint": "#c4cdb4",
    "label": {
     "x": 350,
     "y": 1790
    },
    "vertices": [
     16,
     17,
     4,
     3,
     13
    ],
    "_note": "Boundary = seed Voronoi cell of the original label position; stability default is speculative — review in tool.",
    "tint_enabled": false
   },
   {
    "id": "oblivions_edge",
    "name": "Oblivion's Edge",
    "description": "",
    "warp_stability": "treacherous",
    "tint": "#d6c3a6",
    "label": {
     "x": 1320,
     "y": 1925
    },
    "vertices": [
     15,
     16,
     13,
     14
    ],
    "_note": "Boundary = seed Voronoi cell of the original label position; stability default is speculative — review in tool.",
    "tint_enabled": false
   }
  ],
  "edge_curves": {}
 },
 "nebulae": [
  {
   "id": "neb_crimson_01",
   "name": null,
   "cls": "crimson",
   "pts": [
    [
     3169,
     90
    ],
    [
     2941,
     90
    ],
    [
     2936,
     102
    ],
    [
     2789,
     94
    ],
    [
     2795,
     124
    ],
    [
     2837,
     126
    ],
    [
     2837,
     175
    ],
    [
     2900,
     176
    ],
    [
     2900,
     221
    ],
    [
     2881,
     227
    ],
    [
     2881,
     252
    ],
    [
     2905,
     254
    ],
    [
     2905,
     311
    ],
    [
     2921,
     330
    ],
    [
     2921,
     378
    ],
    [
     2902,
     379
    ],
    [
     2891,
     422
    ],
    [
     2857,
     441
    ],
    [
     2847,
     488
    ],
    [
     2825,
     512
    ],
    [
     2802,
     513
    ],
    [
     2801,
     610
    ],
    [
     2824,
     611
    ],
    [
     2840,
     663
    ],
    [
     2939,
     654
    ],
    [
     2941,
     622
    ],
    [
     2957,
     621
    ],
    [
     2958,
     601
    ],
    [
     2979,
     599
    ],
    [
     2983,
     577
    ],
    [
     2999,
     577
    ],
    [
     3022,
     504
    ],
    [
     3038,
     503
    ],
    [
     3048,
     438
    ],
    [
     3128,
     436
    ],
    [
     3130,
     357
    ],
    [
     3169,
     333
    ]
   ],
   "_provenance": "traced_from_raster_opencv",
   "label": {
    "x": 2930,
    "y": 389
   },
   "style": {
    "color": "#9a4a3c",
    "fill": "stipple",
    "density": 13,
    "border": {
     "width": 1.6,
     "dash": "dashed",
     "opacity": 0.7
    }
   },
   "subtype": "nebula",
   "pt_smooth": [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
   ]
  },
  {
   "id": "neb_crimson_02",
   "name": null,
   "cls": "crimson",
   "pts": [
    [
     400,
     102
    ],
    [
     309,
     119
    ],
    [
     309,
     143
    ],
    [
     332,
     145
    ],
    [
     310,
     270
    ],
    [
     257,
     270
    ],
    [
     242,
     298
    ],
    [
     193,
     298
    ],
    [
     161,
     276
    ],
    [
     169,
     197
    ],
    [
     145,
     197
    ],
    [
     144,
     232
    ],
    [
     98,
     237
    ],
    [
     97,
     252
    ],
    [
     82,
     252
    ],
    [
     81,
     595
    ],
    [
     219,
     588
    ],
    [
     255,
     614
    ],
    [
     289,
     614
    ],
    [
     295,
     592
    ],
    [
     321,
     592
    ],
    [
     322,
     568
    ],
    [
     355,
     568
    ],
    [
     375,
     507
    ],
    [
     410,
     488
    ],
    [
     415,
     408
    ],
    [
     481,
     327
    ],
    [
     481,
     271
    ],
    [
     502,
     260
    ],
    [
     491,
     189
    ],
    [
     471,
     189
    ],
    [
     455,
     166
    ],
    [
     409,
     165
    ]
   ],
   "_provenance": "traced_from_raster_opencv",
   "label": {
    "x": 299,
    "y": 333
   },
   "style": {
    "color": "#9a4a3c",
    "fill": "stipple",
    "density": 13,
    "border": {
     "width": 1.6,
     "dash": "dashed",
     "opacity": 0.7
    }
   },
   "subtype": "nebula",
   "pt_smooth": [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
   ]
  },
  {
   "id": "neb_crimson_03",
   "name": null,
   "cls": "crimson",
   "pts": [
    [
     2058,
     90
    ],
    [
     2062,
     125
    ],
    [
     2144,
     214
    ],
    [
     2144,
     242
    ],
    [
     2166,
     277
    ],
    [
     2231,
     278
    ],
    [
     2259,
     399
    ],
    [
     2337,
     413
    ],
    [
     2357,
     516
    ],
    [
     2411,
     516
    ],
    [
     2448,
     563
    ],
    [
     2503,
     567
    ],
    [
     2544,
     554
    ],
    [
     2549,
     512
    ],
    [
     2533,
     498
    ],
    [
     2529,
     453
    ],
    [
     2507,
     447
    ],
    [
     2507,
     396
    ],
    [
     2450,
     378
    ],
    [
     2449,
     402
    ],
    [
     2361,
     406
    ],
    [
     2357,
     335
    ],
    [
     2389,
     334
    ],
    [
     2386,
     246
    ],
    [
     2457,
     243
    ],
    [
     2468,
     191
    ],
    [
     2496,
     189
    ],
    [
     2497,
     161
    ],
    [
     2608,
     155
    ],
    [
     2615,
     118
    ],
    [
     2640,
     117
    ],
    [
     2640,
     90
    ]
   ],
   "_provenance": "traced_from_raster_opencv",
   "label": {
    "x": 2409,
    "y": 326
   },
   "style": {
    "color": "#9a4a3c",
    "fill": "stipple",
    "density": 13,
    "border": {
     "width": 1.6,
     "dash": "dashed",
     "opacity": 0.7
    }
   },
   "subtype": "nebula",
   "pt_smooth": [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
   ]
  },
  {
   "id": "neb_crimson_04",
   "name": null,
   "cls": "crimson",
   "pts": [
    [
     931,
     128
    ],
    [
     941,
     224
    ],
    [
     1028,
     285
    ],
    [
     1033,
     309
    ],
    [
     1059,
     313
    ],
    [
     1088,
     350
    ],
    [
     1174,
     350
    ],
    [
     1186,
     368
    ],
    [
     1284,
     365
    ],
    [
     1430,
     260
    ],
    [
     1430,
     236
    ],
    [
     1414,
     223
    ],
    [
     1285,
     212
    ],
    [
     1276,
     184
    ],
    [
     1207,
     184
    ],
    [
     1209,
     90
    ],
    [
     1148,
     90
    ],
    [
     1147,
     108
    ],
    [
     1036,
     108
    ],
    [
     1023,
     119
    ],
    [
     953,
     108
    ],
    [
     947,
     128
    ]
   ],
   "_provenance": "traced_from_raster_opencv",
   "label": {
    "x": 1147,
    "y": 216
   },
   "style": {
    "color": "#9a4a3c",
    "fill": "stipple",
    "density": 13,
    "border": {
     "width": 1.6,
     "dash": "dashed",
     "opacity": 0.7
    }
   },
   "subtype": "nebula",
   "pt_smooth": [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
   ]
  },
  {
   "id": "neb_crimson_05",
   "name": null,
   "cls": "crimson",
   "pts": [
    [
     838,
     90
    ],
    [
     643,
     90
    ],
    [
     642,
     156
    ],
    [
     615,
     173
    ],
    [
     615,
     209
    ],
    [
     628,
     212
    ],
    [
     633,
     255
    ],
    [
     662,
     258
    ],
    [
     663,
     320
    ],
    [
     721,
     332
    ],
    [
     750,
     300
    ],
    [
     762,
     254
    ],
    [
     838,
     125
    ]
   ],
   "_provenance": "traced_from_raster_opencv",
   "label": {
    "x": 693,
    "y": 213
   },
   "style": {
    "color": "#9a4a3c",
    "fill": "stipple",
    "density": 13,
    "border": {
     "width": 1.6,
     "dash": "dashed",
     "opacity": 0.7
    }
   },
   "subtype": "nebula",
   "pt_smooth": [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
   ]
  },
  {
   "id": "neb_jade_06",
   "name": null,
   "cls": "jade",
   "pts": [
    [
     296,
     1241
    ],
    [
     229,
     1250
    ],
    [
     224,
     1269
    ],
    [
     192,
     1274
    ],
    [
     191,
     1303
    ],
    [
     154,
     1303
    ],
    [
     149,
     1320
    ],
    [
     116,
     1324
    ],
    [
     116,
     1358
    ],
    [
     82,
     1359
    ],
    [
     82,
     1448
    ],
    [
     177,
     1442
    ],
    [
     178,
     1503
    ],
    [
     212,
     1503
    ],
    [
     212,
     1478
    ],
    [
     184,
     1477
    ],
    [
     194,
     1386
    ],
    [
     226,
     1385
    ],
    [
     227,
     1365
    ],
    [
     265,
     1365
    ],
    [
     274,
     1341
    ],
    [
     326,
     1330
    ],
    [
     322,
     1279
    ],
    [
     296,
     1277
    ]
   ],
   "_provenance": "traced_from_raster_opencv",
   "label": {
    "x": 205,
    "y": 1358
   },
   "style": {
    "color": "#5d7a55",
    "fill": "stipple",
    "density": 13,
    "border": {
     "width": 1.6,
     "dash": "dashed",
     "opacity": 0.7
    }
   },
   "subtype": "nebula",
   "pt_smooth": [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
   ]
  },
  {
   "id": "neb_azure_07",
   "name": null,
   "cls": "azure",
   "pts": [
    [
     2803,
     1584
    ],
    [
     2748,
     1588
    ],
    [
     2747,
     1620
    ],
    [
     2681,
     1630
    ],
    [
     2680,
     1674
    ],
    [
     2632,
     1674
    ],
    [
     2630,
     1694
    ],
    [
     2596,
     1711
    ],
    [
     2593,
     1751
    ],
    [
     2656,
     1843
    ],
    [
     2703,
     1838
    ],
    [
     2705,
     1729
    ],
    [
     2757,
     1726
    ],
    [
     2748,
     1654
    ],
    [
     2810,
     1643
    ]
   ],
   "_provenance": "traced_from_raster_opencv",
   "label": {
    "x": 2699,
    "y": 1691
   },
   "style": {
    "color": "#46618e",
    "fill": "stipple",
    "density": 13,
    "border": {
     "width": 1.6,
     "dash": "dashed",
     "opacity": 0.7
    }
   },
   "subtype": "nebula",
   "pt_smooth": [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
   ]
  },
  {
   "id": "neb_violet_08",
   "name": null,
   "cls": "violet",
   "pts": [
    [
     1800,
     1636
    ],
    [
     1765,
     1695
    ],
    [
     1768,
     1751
    ],
    [
     1817,
     1801
    ],
    [
     1872,
     1801
    ],
    [
     1938,
     1750
    ],
    [
     1927,
     1674
    ],
    [
     1877,
     1636
    ]
   ],
   "_provenance": "traced_from_raster_opencv",
   "label": {
    "x": 1846,
    "y": 1718
   },
   "style": {
    "color": "#7a4a7e",
    "fill": "stipple",
    "density": 13,
    "border": {
     "width": 1.6,
     "dash": "dashed",
     "opacity": 0.7
    }
   },
   "subtype": "nebula",
   "pt_smooth": [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
   ]
  },
  {
   "id": "neb_violet_09",
   "name": null,
   "cls": "violet",
   "pts": [
    [
     2498,
     1751
    ],
    [
     2512,
     1854
    ],
    [
     2542,
     1867
    ],
    [
     2542,
     1908
    ],
    [
     2636,
     1899
    ],
    [
     2644,
     1947
    ],
    [
     2680,
     1945
    ],
    [
     2680,
     1894
    ],
    [
     2717,
     1867
    ],
    [
     2717,
     1828
    ],
    [
     2699,
     1844
    ],
    [
     2639,
     1833
    ],
    [
     2592,
     1730
    ],
    [
     2556,
     1751
    ]
   ],
   "_provenance": "traced_from_raster_opencv",
   "label": {
    "x": 2618,
    "y": 1851
   },
   "style": {
    "color": "#7a4a7e",
    "fill": "stipple",
    "density": 13,
    "border": {
     "width": 1.6,
     "dash": "dashed",
     "opacity": 0.7
    }
   },
   "subtype": "nebula",
   "pt_smooth": [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
   ]
  },
  {
   "id": "neb_violet_10",
   "name": null,
   "cls": "violet",
   "pts": [
    [
     2366,
     1924
    ],
    [
     2366,
     1947
    ],
    [
     2391,
     1948
    ],
    [
     2401,
     2026
    ],
    [
     2425,
     2026
    ],
    [
     2426,
     2006
    ],
    [
     2458,
     1995
    ],
    [
     2544,
     1991
    ],
    [
     2554,
     1953
    ],
    [
     2581,
     1936
    ],
    [
     2580,
     1918
    ],
    [
     2429,
     1902
    ],
    [
     2428,
     1863
    ],
    [
     2401,
     1865
    ],
    [
     2387,
     1907
    ]
   ],
   "_provenance": "traced_from_raster_opencv",
   "label": {
    "x": 2449,
    "y": 1947
   },
   "style": {
    "color": "#7a4a7e",
    "fill": "stipple",
    "density": 13,
    "border": {
     "width": 1.6,
     "dash": "dashed",
     "opacity": 0.7
    }
   },
   "subtype": "nebula",
   "pt_smooth": [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
   ]
  },
  {
   "id": "neb_crimson_11",
   "name": null,
   "cls": "crimson",
   "pts": [
    [
     1507,
     150
    ],
    [
     1560,
     162
    ],
    [
     1566,
     146
    ],
    [
     1666,
     139
    ],
    [
     1803,
     146
    ],
    [
     1852,
     126
    ],
    [
     1852,
     93
    ],
    [
     1589,
     90
    ],
    [
     1517,
     110
    ]
   ],
   "_provenance": "traced_from_raster_opencv",
   "label": {
    "x": 1657,
    "y": 129
   },
   "style": {
    "color": "#9a4a3c",
    "fill": "stipple",
    "density": 13,
    "border": {
     "width": 1.6,
     "dash": "dashed",
     "opacity": 0.7
    }
   },
   "subtype": "nebula",
   "pt_smooth": [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
   ]
  },
  {
   "id": "neb_violet_12",
   "name": null,
   "cls": "violet",
   "pts": [
    [
     1964,
     737
    ],
    [
     1904,
     749
    ],
    [
     1904,
     779
    ],
    [
     1870,
     780
    ],
    [
     1841,
     846
    ],
    [
     1813,
     848
    ],
    [
     1808,
     892
    ],
    [
     1825,
     893
    ],
    [
     1829,
     916
    ],
    [
     1856,
     918
    ],
    [
     1863,
     892
    ],
    [
     1895,
     889
    ],
    [
     1917,
     875
    ],
    [
     1928,
     845
    ],
    [
     1964,
     834
    ],
    [
     1981,
     807
    ]
   ],
   "_provenance": "traced_from_raster_opencv",
   "label": {
    "x": 1885,
    "y": 844
   },
   "style": {
    "color": "#7a4a7e",
    "fill": "stipple",
    "density": 13,
    "border": {
     "width": 1.6,
     "dash": "dashed",
     "opacity": 0.7
    }
   },
   "subtype": "nebula",
   "pt_smooth": [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
   ]
  },
  {
   "id": "neb_violet_13",
   "name": null,
   "cls": "violet",
   "pts": [
    [
     1780,
     1624
    ],
    [
     1756,
     1687
    ],
    [
     1736,
     1694
    ],
    [
     1746,
     1776
    ],
    [
     1804,
     1826
    ],
    [
     1886,
     1826
    ],
    [
     1928,
     1801
    ],
    [
     1962,
     1737
    ],
    [
     1952,
     1662
    ],
    [
     1877,
     1608
    ],
    [
     1829,
     1606
    ]
   ],
   "_provenance": "traced_from_raster_opencv",
   "label": {
    "x": 1841,
    "y": 1713
   },
   "style": {
    "color": "#7a4a7e",
    "fill": "stipple",
    "density": 13,
    "border": {
     "width": 1.6,
     "dash": "dashed",
     "opacity": 0.7
    }
   },
   "subtype": "nebula",
   "pt_smooth": [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
   ]
  },
  {
   "id": "neb_azure_14",
   "name": null,
   "cls": "azure",
   "pts": [
    [
     2399,
     2079
    ],
    [
     2500,
     2079
    ],
    [
     2501,
     2054
    ],
    [
     2589,
     2048
    ],
    [
     2589,
     2021
    ],
    [
     2529,
     2021
    ],
    [
     2528,
     1993
    ],
    [
     2458,
     1996
    ],
    [
     2450,
     2052
    ],
    [
     2399,
     2054
    ]
   ],
   "_provenance": "traced_from_raster_opencv",
   "label": {
    "x": 2494,
    "y": 2040
   },
   "style": {
    "color": "#46618e",
    "fill": "stipple",
    "density": 13,
    "border": {
     "width": 1.6,
     "dash": "dashed",
     "opacity": 0.7
    }
   },
   "subtype": "nebula",
   "pt_smooth": [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
   ]
  },
  {
   "id": "neb_crimson_15",
   "name": null,
   "cls": "crimson",
   "pts": [
    [
     3702,
     90
    ],
    [
     3702,
     130
    ],
    [
     3784,
     130
    ],
    [
     3785,
     150
    ],
    [
     3879,
     135
    ],
    [
     3879,
     90
    ]
   ],
   "_provenance": "traced_from_raster_opencv",
   "label": {
    "x": 3788,
    "y": 121
   },
   "style": {
    "color": "#9a4a3c",
    "fill": "stipple",
    "density": 13,
    "border": {
     "width": 1.6,
     "dash": "dashed",
     "opacity": 0.7
    }
   },
   "subtype": "nebula",
   "pt_smooth": [
    0,
    0,
    0,
    0,
    0,
    0
   ]
  }
 ],
 "render": {
  "theme": "lithograph",
  "stability_levels": [
   "stable",
   "variable",
   "treacherous",
   "impassable",
   "uncharted"
  ],
  "stability_palette": {
   "stable": "#adc4a0",
   "variable": "#dcc488",
   "treacherous": "#dd9d8a",
   "impassable": "#bb8298",
   "uncharted": "#d9cfb8"
  },
  "stability_tint_enabled": false,
  "_doc": "stability_tint_enabled=false → faces use their own tint (chart palette); true → fill keyed to warp_stability.",
  "political_overlay_enabled": false,
  "extended_grid_enabled": false,
  "layer_opacity": {
   "stability": 1,
   "political": 1,
   "regions": 1,
   "planets": 1,
   "routes": 1,
   "features": 1,
   "grid": 1,
   "fleets": 1,
   "events": 1
  }
 },
 "political_entities": [],
 "fleets": [],
 "ship_classes": [
  "Transport",
  "Raider",
  "Frigate",
  "Light Cruiser",
  "Cruiser",
  "Battlecruiser",
  "Grand Cruiser"
 ],
 "political_territories": [],
 "timeline": [
  {
   "id": "date_0",
   "date": "Undated",
   "state": {
    "planets": [
     {
      "id": "basilicana_novum",
      "name": "Basilicana Novum",
      "x": 873,
      "y": 262,
      "designation": "shrine_world"
     },
     {
      "id": "tertholen",
      "name": "Tertholen",
      "x": 983,
      "y": 356,
      "designation": "frontier_world"
     },
     {
      "id": "neu_askania",
      "name": "Neu Askania",
      "x": 979,
      "y": 454,
      "designation": "frontier_world"
     },
     {
      "id": "roanoke",
      "name": "Roanoke",
      "x": 1114,
      "y": 444,
      "designation": "frontier_world"
     },
     {
      "id": "arguin",
      "name": "Arguin",
      "x": 1302,
      "y": 478,
      "designation": "frontier_world"
     },
     {
      "id": "grizdek",
      "name": "Grizdek",
      "x": 828,
      "y": 632,
      "designation": "feudal_world"
     },
     {
      "id": "vulci",
      "name": "Vulci",
      "x": 453,
      "y": 718,
      "designation": "mining_world"
     },
     {
      "id": "krugmar",
      "name": "Krugmar",
      "x": 89,
      "y": 815,
      "designation": "unclassified"
     },
     {
      "id": "tyrus",
      "name": "Tyrus",
      "x": 412,
      "y": 833,
      "designation": "forge_world"
     },
     {
      "id": "osca",
      "name": "Osca",
      "x": 373,
      "y": 965,
      "designation": "forbidden_world"
     },
     {
      "id": "soranus",
      "name": "Soranus",
      "x": 447,
      "y": 994,
      "designation": "frontier_world"
     },
     {
      "id": "hadria",
      "name": "Hadria",
      "x": 396,
      "y": 1105,
      "designation": "death_world"
     },
     {
      "id": "gallowdark",
      "name": "Gallowdark",
      "x": 766,
      "y": 1006,
      "designation": "special"
     },
     {
      "id": "erisi",
      "name": "Erisi",
      "x": 897,
      "y": 840,
      "designation": "hive_world"
     },
     {
      "id": "pella",
      "name": "Pella",
      "x": 1262,
      "y": 1042,
      "designation": "hive_world"
     },
     {
      "id": "kairon",
      "name": "Kairon",
      "x": 1520,
      "y": 1127,
      "designation": "hive_world"
     },
     {
      "id": "demetar",
      "name": "Demetar",
      "x": 1102,
      "y": 1226,
      "designation": "agri_world"
     },
     {
      "id": "pollux",
      "name": "Pollux",
      "x": 1715,
      "y": 1177,
      "designation": "dead_world"
     },
     {
      "id": "castor",
      "name": "Castor",
      "x": 1625,
      "y": 1268,
      "designation": "frontier_world"
     },
     {
      "id": "hesperida",
      "name": "Hesperida",
      "x": 2147,
      "y": 339,
      "designation": "forbidden_world"
     },
     {
      "id": "takedakure",
      "name": "Takedakure",
      "x": 1917,
      "y": 434,
      "designation": "war_world"
     },
     {
      "id": "kalova",
      "name": "Kalova",
      "x": 2281,
      "y": 527,
      "designation": "special"
     },
     {
      "id": "junkrat_station",
      "name": "Junkrat Station",
      "x": 2277,
      "y": 970,
      "designation": "special"
     },
     {
      "id": "pahror",
      "name": "Pahror",
      "x": 2668,
      "y": 350,
      "designation": "unclassified"
     },
     {
      "id": "relicath",
      "name": "Relicath",
      "x": 3243,
      "y": 542,
      "designation": "unclassified"
     },
     {
      "id": "hyrol",
      "name": "Hyrol",
      "x": 2803,
      "y": 811,
      "designation": "cemetery_world"
     },
     {
      "id": "pox",
      "name": "Pox",
      "x": 678,
      "y": 1345,
      "designation": "forbidden_world"
     },
     {
      "id": "apatos",
      "name": "Apatos",
      "x": 968,
      "y": 1403,
      "designation": "hive_world"
     },
     {
      "id": "aun_avre",
      "name": "Aun'avre",
      "x": 330,
      "y": 1687,
      "designation": "hive_world"
     },
     {
      "id": "vail",
      "name": "Vail",
      "x": 1058,
      "y": 1650,
      "designation": "feudal_world"
     },
     {
      "id": "saicea",
      "name": "Saicea",
      "x": 457,
      "y": 1907,
      "designation": "mining_world"
     },
     {
      "id": "fal_an",
      "name": "Fal'an",
      "x": 219,
      "y": 1962,
      "designation": "agri_world"
     },
     {
      "id": "scyl",
      "name": "Scyl",
      "x": 985,
      "y": 1905,
      "designation": "frontier_world"
     },
     {
      "id": "ravndal",
      "name": "Ravndal",
      "x": 1051,
      "y": 1990,
      "designation": "death_world"
     },
     {
      "id": "port_meiron",
      "name": "Port Meiron",
      "x": 1354,
      "y": 1700,
      "designation": "penal_world"
     },
     {
      "id": "kraken_graveyard",
      "name": "Kraken Graveyard",
      "x": 1516,
      "y": 1800,
      "designation": "special"
     },
     {
      "id": "pr0b_1",
      "name": "PR0B-1",
      "x": 1740,
      "y": 1676,
      "designation": "abaoth_discovery",
      "_note": "Position from PSD layer 'PR0B-1' bbox center (canonical)."
     },
     {
      "id": "circador",
      "name": "Circador",
      "x": 1854,
      "y": 1734,
      "designation": "feral_world",
      "_note": "Marker green; agri vs feral ambiguous at this resolution."
     },
     {
      "id": "garmr",
      "name": "Garmr",
      "x": 1922,
      "y": 1537,
      "designation": "mining_world"
     },
     {
      "id": "station_128",
      "name": "Station 128",
      "x": 2170,
      "y": 1576,
      "designation": "special"
     },
     {
      "id": "budir",
      "name": "Buðir",
      "x": 1561,
      "y": 2049,
      "designation": "agri_world"
     },
     {
      "id": "djupidalur",
      "name": "Djúpidalur",
      "x": 1625,
      "y": 2010,
      "designation": "mining_world"
     },
     {
      "id": "laugarbrekka",
      "name": "Laugarbrekka",
      "x": 1735,
      "y": 2049,
      "designation": "agri_world"
     },
     {
      "id": "haraldssun",
      "name": "Haraldssun",
      "x": 1973,
      "y": 2049,
      "designation": "gas_giant"
     },
     {
      "id": "aegis",
      "name": "Aegis",
      "x": 2651,
      "y": 1406,
      "designation": "unclassified"
     },
     {
      "id": "bulwark",
      "name": "Bulwark",
      "x": 2761,
      "y": 1383,
      "designation": "unclassified"
     },
     {
      "id": "bastion",
      "name": "Bastion",
      "x": 2687,
      "y": 1486,
      "designation": "unclassified"
     },
     {
      "id": "rampart",
      "name": "Rampart",
      "x": 2641,
      "y": 1508,
      "designation": "unclassified"
     },
     {
      "id": "lr_2784b_35",
      "name": "LR-2784b-35",
      "x": 2962,
      "y": 1990,
      "designation": "unclassified"
     }
    ],
    "routes": [
     {
      "id": "rt_tyrus_erisi",
      "from": "tyrus",
      "to": "erisi",
      "waypoints": [],
      "label": null,
      "style": {
       "stroke": "#7a5c2e",
       "width": 2.5,
       "dash": "10 8",
       "labelColor": "#6b5134",
       "path": "angular"
      },
      "owner": null
     },
     {
      "id": "rt_erisi_grizdek",
      "from": "erisi",
      "to": "grizdek",
      "waypoints": [],
      "label": null,
      "style": {
       "stroke": "#7a5c2e",
       "width": 2.5,
       "dash": "10 8",
       "labelColor": "#6b5134",
       "path": "angular"
      },
      "owner": null
     },
     {
      "id": "rt_grizdek_arguin",
      "from": "grizdek",
      "to": "arguin",
      "waypoints": [
       [
        1160,
        520
       ]
      ],
      "label": null,
      "style": {
       "stroke": "#7a5c2e",
       "width": 2.5,
       "dash": "10 8",
       "labelColor": "#6b5134",
       "path": "angular"
      },
      "owner": null
     },
     {
      "id": "rt_erisi_pella",
      "from": "erisi",
      "to": "pella",
      "waypoints": [],
      "label": null,
      "style": {
       "stroke": "#7a5c2e",
       "width": 2.5,
       "dash": "10 8",
       "labelColor": "#6b5134",
       "path": "angular"
      },
      "owner": null
     },
     {
      "id": "rt_pella_kairon",
      "from": "pella",
      "to": "kairon",
      "waypoints": [],
      "label": null,
      "style": {
       "stroke": "#7a5c2e",
       "width": 2.5,
       "dash": "10 8",
       "labelColor": "#6b5134",
       "path": "angular"
      },
      "owner": null
     },
     {
      "id": "rt_kairon_junkrat",
      "from": "kairon",
      "to": "junkrat_station",
      "waypoints": [
       [
        1750,
        1085
       ],
       [
        2100,
        1070
       ]
      ],
      "label": null,
      "style": {
       "stroke": "#7a5c2e",
       "width": 2.5,
       "dash": "10 8",
       "labelColor": "#6b5134",
       "path": "angular"
      },
      "owner": null
     },
     {
      "id": "rt_pella_demetar",
      "from": "pella",
      "to": "demetar",
      "waypoints": [],
      "label": null,
      "style": {
       "stroke": "#7a5c2e",
       "width": 2.5,
       "dash": "10 8",
       "labelColor": "#6b5134",
       "path": "angular"
      },
      "owner": null
     },
     {
      "id": "rt_demetar_apatos",
      "from": "demetar",
      "to": "apatos",
      "waypoints": [],
      "label": null,
      "style": {
       "stroke": "#7a5c2e",
       "width": 2.5,
       "dash": "10 8",
       "labelColor": "#6b5134",
       "path": "angular"
      },
      "owner": null
     },
     {
      "id": "rt_apatos_pox",
      "from": "apatos",
      "to": "pox",
      "waypoints": [],
      "label": null,
      "style": {
       "stroke": "#7a5c2e",
       "width": 2.5,
       "dash": "10 8",
       "labelColor": "#6b5134",
       "path": "angular"
      },
      "owner": null
     },
     {
      "id": "rt_apatos_vail",
      "from": "apatos",
      "to": "vail",
      "waypoints": [],
      "label": null,
      "style": {
       "stroke": "#7a5c2e",
       "width": 2.5,
       "dash": "10 8",
       "labelColor": "#6b5134",
       "path": "angular"
      },
      "owner": null
     },
     {
      "id": "rt_vail_scyl",
      "from": "vail",
      "to": "scyl",
      "waypoints": [],
      "label": null,
      "style": {
       "stroke": "#7a5c2e",
       "width": 2.5,
       "dash": "10 8",
       "labelColor": "#6b5134",
       "path": "angular"
      },
      "owner": null
     },
     {
      "id": "rt_scyl_ravndal",
      "from": "scyl",
      "to": "ravndal",
      "waypoints": [],
      "label": null,
      "style": {
       "stroke": "#7a5c2e",
       "width": 2.5,
       "dash": "10 8",
       "labelColor": "#6b5134",
       "path": "angular"
      },
      "owner": null
     },
     {
      "id": "rt_aun_avre_apatos",
      "from": "aun_avre",
      "to": "apatos",
      "waypoints": [
       [
        790,
        1490
       ]
      ],
      "label": null,
      "style": {
       "stroke": "#7a5c2e",
       "width": 2.5,
       "dash": "10 8",
       "labelColor": "#6b5134",
       "path": "angular"
      },
      "owner": null
     },
     {
      "id": "rt_kairon_castor",
      "from": "kairon",
      "to": "castor",
      "waypoints": [
       [
        1530,
        1430
       ]
      ],
      "label": null,
      "style": {
       "stroke": "#7a5c2e",
       "width": 2.5,
       "dash": "10 8",
       "labelColor": "#6b5134",
       "path": "angular"
      },
      "owner": null
     },
     {
      "id": "rt_castor_garmr",
      "from": "castor",
      "to": "garmr",
      "waypoints": [
       [
        1647,
        1428
       ],
       [
        1800,
        1480
       ]
      ],
      "label": null,
      "style": {
       "stroke": "#7a5c2e",
       "width": 2.5,
       "dash": "10 8",
       "labelColor": "#6b5134",
       "path": "angular"
      },
      "owner": null
     },
     {
      "id": "rt_vail_kraken",
      "from": "vail",
      "to": "kraken_graveyard",
      "waypoints": [
       [
        1300,
        1760
       ]
      ],
      "label": null,
      "style": {
       "stroke": "#7a5c2e",
       "width": 2.5,
       "dash": "10 8",
       "labelColor": "#6b5134",
       "path": "angular"
      },
      "owner": null
     },
     {
      "id": "rt_kraken_port_meiron",
      "from": "kraken_graveyard",
      "to": "port_meiron",
      "waypoints": [],
      "label": null,
      "style": {
       "stroke": "#7a5c2e",
       "width": 2.5,
       "dash": "10 8",
       "labelColor": "#6b5134",
       "path": "angular"
      },
      "owner": null
     }
    ],
    "tessellation": {
     "_doc": "Planar partition of the full canvas. vertices = [[x,y],...]; each region face lists vertex indices forming its boundary loop. Invariant: every edge is shared by exactly two faces or lies on the canvas frame — editing operations in the tool preserve this; validate_tessellation() in the tool and scripts/ recheck it. edge_curves maps a sorted vertex-pair key \"u-v\" to {cp:[x,y]} — a quadratic Bézier control point shared by both adjacent faces, so curved boundaries stay identical on both sides.",
     "vertices": [
      [
       0,
       0
      ],
      [
       560.7,
       0.0
      ],
      [
       907.7,
       704.9
      ],
      [
       789.1,
       1251.7
      ],
      [
       0.0,
       1393.5
      ],
      [
       2081.8,
       0.0
      ],
      [
       2091.2,
       730.5
      ],
      [
       3672.0,
       0.0
      ],
      [
       2475.1,
       854.9
      ],
      [
       2148.5,
       803.1
      ],
      [
       3960,
       0
      ],
      [
       3960,
       2160
      ],
      [
       3740.0,
       2160.0
      ],
      [
       892.6,
       1443.5
      ],
      [
       1873.4,
       1654.2
      ],
      [
       2060.4,
       2160.0
      ],
      [
       792.9,
       2160.0
      ],
      [
       0,
       2160
      ]
     ],
     "faces": [
      {
       "id": "the_green_line",
       "name": "The Green Line",
       "description": "",
       "warp_stability": "treacherous",
       "tint": "#b5c4a1",
       "label": {
        "x": 190,
        "y": 900
       },
       "vertices": [
        0,
        1,
        2,
        3,
        4
       ],
       "_note": "Boundary = seed Voronoi cell of the original label position; stability default is speculative — review in tool.",
       "tint_enabled": false
      },
      {
       "id": "cumaean_recess",
       "name": "Cumaean Recess",
       "description": "",
       "warp_stability": "variable",
       "tint": "#e3bfae",
       "label": {
        "x": 1500,
        "y": 255
       },
       "vertices": [
        1,
        5,
        6,
        2
       ],
       "_note": "Boundary = seed Voronoi cell of the original label position; stability default is speculative — review in tool.",
       "tint_enabled": false
      },
      {
       "id": "the_pocket",
       "name": "The Pocket",
       "description": "",
       "warp_stability": "stable",
       "tint": "#aebfc9",
       "label": {
        "x": 2670,
        "y": 240
       },
       "vertices": [
        5,
        7,
        8,
        9,
        6
       ],
       "_note": "Boundary = seed Voronoi cell of the original label position; stability default is speculative — review in tool.",
       "tint_enabled": false
      },
      {
       "id": "accursed_cacophony",
       "name": "Accursed Cacophony",
       "description": "",
       "warp_stability": "impassable",
       "tint": "#c9a3ab",
       "label": {
        "x": 3120,
        "y": 870
       },
       "vertices": [
        7,
        10,
        11,
        12,
        8
       ],
       "_note": "Boundary = seed Voronoi cell of the original label position; stability default is speculative — review in tool.",
       "tint_enabled": false
      },
      {
       "id": "the_core",
       "name": "The Core",
       "description": "",
       "warp_stability": "stable",
       "tint": "#ded3a9",
       "label": {
        "x": 1480,
        "y": 1180
       },
       "vertices": [
        13,
        3,
        2,
        6,
        9,
        14
       ],
       "_note": "Boundary = seed Voronoi cell of the original label position; stability default is speculative — review in tool.",
       "tint_enabled": false
      },
      {
       "id": "abyssal_strand",
       "name": "Abyssal Strand",
       "description": "",
       "warp_stability": "variable",
       "tint": "#b3aec9",
       "label": {
        "x": 2470,
        "y": 1500
       },
       "vertices": [
        12,
        15,
        14,
        9,
        8
       ],
       "_note": "Boundary = seed Voronoi cell of the original label position; stability default is speculative — review in tool.",
       "tint_enabled": false
      },
      {
       "id": "tymors_grasp",
       "name": "Tymor's Grasp",
       "description": "",
       "warp_stability": "variable",
       "tint": "#c4cdb4",
       "label": {
        "x": 350,
        "y": 1790
       },
       "vertices": [
        16,
        17,
        4,
        3,
        13
       ],
       "_note": "Boundary = seed Voronoi cell of the original label position; stability default is speculative — review in tool.",
       "tint_enabled": false
      },
      {
       "id": "oblivions_edge",
       "name": "Oblivion's Edge",
       "description": "",
       "warp_stability": "treacherous",
       "tint": "#d6c3a6",
       "label": {
        "x": 1320,
        "y": 1925
       },
       "vertices": [
        15,
        16,
        13,
        14
       ],
       "_note": "Boundary = seed Voronoi cell of the original label position; stability default is speculative — review in tool.",
       "tint_enabled": false
      }
     ],
     "edge_curves": {}
    },
    "nebulae": [
     {
      "id": "neb_crimson_01",
      "name": null,
      "cls": "crimson",
      "pts": [
       [
        3169,
        90
       ],
       [
        2941,
        90
       ],
       [
        2936,
        102
       ],
       [
        2789,
        94
       ],
       [
        2795,
        124
       ],
       [
        2837,
        126
       ],
       [
        2837,
        175
       ],
       [
        2900,
        176
       ],
       [
        2900,
        221
       ],
       [
        2881,
        227
       ],
       [
        2881,
        252
       ],
       [
        2905,
        254
       ],
       [
        2905,
        311
       ],
       [
        2921,
        330
       ],
       [
        2921,
        378
       ],
       [
        2902,
        379
       ],
       [
        2891,
        422
       ],
       [
        2857,
        441
       ],
       [
        2847,
        488
       ],
       [
        2825,
        512
       ],
       [
        2802,
        513
       ],
       [
        2801,
        610
       ],
       [
        2824,
        611
       ],
       [
        2840,
        663
       ],
       [
        2939,
        654
       ],
       [
        2941,
        622
       ],
       [
        2957,
        621
       ],
       [
        2958,
        601
       ],
       [
        2979,
        599
       ],
       [
        2983,
        577
       ],
       [
        2999,
        577
       ],
       [
        3022,
        504
       ],
       [
        3038,
        503
       ],
       [
        3048,
        438
       ],
       [
        3128,
        436
       ],
       [
        3130,
        357
       ],
       [
        3169,
        333
       ]
      ],
      "_provenance": "traced_from_raster_opencv",
      "label": {
       "x": 2930,
       "y": 389
      },
      "style": {
       "color": "#9a4a3c",
       "fill": "stipple",
       "density": 13,
       "border": {
        "width": 1.6,
        "dash": "dashed",
        "opacity": 0.7
       }
      },
      "subtype": "nebula",
      "pt_smooth": [
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0
      ]
     },
     {
      "id": "neb_crimson_02",
      "name": null,
      "cls": "crimson",
      "pts": [
       [
        400,
        102
       ],
       [
        309,
        119
       ],
       [
        309,
        143
       ],
       [
        332,
        145
       ],
       [
        310,
        270
       ],
       [
        257,
        270
       ],
       [
        242,
        298
       ],
       [
        193,
        298
       ],
       [
        161,
        276
       ],
       [
        169,
        197
       ],
       [
        145,
        197
       ],
       [
        144,
        232
       ],
       [
        98,
        237
       ],
       [
        97,
        252
       ],
       [
        82,
        252
       ],
       [
        81,
        595
       ],
       [
        219,
        588
       ],
       [
        255,
        614
       ],
       [
        289,
        614
       ],
       [
        295,
        592
       ],
       [
        321,
        592
       ],
       [
        322,
        568
       ],
       [
        355,
        568
       ],
       [
        375,
        507
       ],
       [
        410,
        488
       ],
       [
        415,
        408
       ],
       [
        481,
        327
       ],
       [
        481,
        271
       ],
       [
        502,
        260
       ],
       [
        491,
        189
       ],
       [
        471,
        189
       ],
       [
        455,
        166
       ],
       [
        409,
        165
       ]
      ],
      "_provenance": "traced_from_raster_opencv",
      "label": {
       "x": 299,
       "y": 333
      },
      "style": {
       "color": "#9a4a3c",
       "fill": "stipple",
       "density": 13,
       "border": {
        "width": 1.6,
        "dash": "dashed",
        "opacity": 0.7
       }
      },
      "subtype": "nebula",
      "pt_smooth": [
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0
      ]
     },
     {
      "id": "neb_crimson_03",
      "name": null,
      "cls": "crimson",
      "pts": [
       [
        2058,
        90
       ],
       [
        2062,
        125
       ],
       [
        2144,
        214
       ],
       [
        2144,
        242
       ],
       [
        2166,
        277
       ],
       [
        2231,
        278
       ],
       [
        2259,
        399
       ],
       [
        2337,
        413
       ],
       [
        2357,
        516
       ],
       [
        2411,
        516
       ],
       [
        2448,
        563
       ],
       [
        2503,
        567
       ],
       [
        2544,
        554
       ],
       [
        2549,
        512
       ],
       [
        2533,
        498
       ],
       [
        2529,
        453
       ],
       [
        2507,
        447
       ],
       [
        2507,
        396
       ],
       [
        2450,
        378
       ],
       [
        2449,
        402
       ],
       [
        2361,
        406
       ],
       [
        2357,
        335
       ],
       [
        2389,
        334
       ],
       [
        2386,
        246
       ],
       [
        2457,
        243
       ],
       [
        2468,
        191
       ],
       [
        2496,
        189
       ],
       [
        2497,
        161
       ],
       [
        2608,
        155
       ],
       [
        2615,
        118
       ],
       [
        2640,
        117
       ],
       [
        2640,
        90
       ]
      ],
      "_provenance": "traced_from_raster_opencv",
      "label": {
       "x": 2409,
       "y": 326
      },
      "style": {
       "color": "#9a4a3c",
       "fill": "stipple",
       "density": 13,
       "border": {
        "width": 1.6,
        "dash": "dashed",
        "opacity": 0.7
       }
      },
      "subtype": "nebula",
      "pt_smooth": [
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0
      ]
     },
     {
      "id": "neb_crimson_04",
      "name": null,
      "cls": "crimson",
      "pts": [
       [
        931,
        128
       ],
       [
        941,
        224
       ],
       [
        1028,
        285
       ],
       [
        1033,
        309
       ],
       [
        1059,
        313
       ],
       [
        1088,
        350
       ],
       [
        1174,
        350
       ],
       [
        1186,
        368
       ],
       [
        1284,
        365
       ],
       [
        1430,
        260
       ],
       [
        1430,
        236
       ],
       [
        1414,
        223
       ],
       [
        1285,
        212
       ],
       [
        1276,
        184
       ],
       [
        1207,
        184
       ],
       [
        1209,
        90
       ],
       [
        1148,
        90
       ],
       [
        1147,
        108
       ],
       [
        1036,
        108
       ],
       [
        1023,
        119
       ],
       [
        953,
        108
       ],
       [
        947,
        128
       ]
      ],
      "_provenance": "traced_from_raster_opencv",
      "label": {
       "x": 1147,
       "y": 216
      },
      "style": {
       "color": "#9a4a3c",
       "fill": "stipple",
       "density": 13,
       "border": {
        "width": 1.6,
        "dash": "dashed",
        "opacity": 0.7
       }
      },
      "subtype": "nebula",
      "pt_smooth": [
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0
      ]
     },
     {
      "id": "neb_crimson_05",
      "name": null,
      "cls": "crimson",
      "pts": [
       [
        838,
        90
       ],
       [
        643,
        90
       ],
       [
        642,
        156
       ],
       [
        615,
        173
       ],
       [
        615,
        209
       ],
       [
        628,
        212
       ],
       [
        633,
        255
       ],
       [
        662,
        258
       ],
       [
        663,
        320
       ],
       [
        721,
        332
       ],
       [
        750,
        300
       ],
       [
        762,
        254
       ],
       [
        838,
        125
       ]
      ],
      "_provenance": "traced_from_raster_opencv",
      "label": {
       "x": 693,
       "y": 213
      },
      "style": {
       "color": "#9a4a3c",
       "fill": "stipple",
       "density": 13,
       "border": {
        "width": 1.6,
        "dash": "dashed",
        "opacity": 0.7
       }
      },
      "subtype": "nebula",
      "pt_smooth": [
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0
      ]
     },
     {
      "id": "neb_jade_06",
      "name": null,
      "cls": "jade",
      "pts": [
       [
        296,
        1241
       ],
       [
        229,
        1250
       ],
       [
        224,
        1269
       ],
       [
        192,
        1274
       ],
       [
        191,
        1303
       ],
       [
        154,
        1303
       ],
       [
        149,
        1320
       ],
       [
        116,
        1324
       ],
       [
        116,
        1358
       ],
       [
        82,
        1359
       ],
       [
        82,
        1448
       ],
       [
        177,
        1442
       ],
       [
        178,
        1503
       ],
       [
        212,
        1503
       ],
       [
        212,
        1478
       ],
       [
        184,
        1477
       ],
       [
        194,
        1386
       ],
       [
        226,
        1385
       ],
       [
        227,
        1365
       ],
       [
        265,
        1365
       ],
       [
        274,
        1341
       ],
       [
        326,
        1330
       ],
       [
        322,
        1279
       ],
       [
        296,
        1277
       ]
      ],
      "_provenance": "traced_from_raster_opencv",
      "label": {
       "x": 205,
       "y": 1358
      },
      "style": {
       "color": "#5d7a55",
       "fill": "stipple",
       "density": 13,
       "border": {
        "width": 1.6,
        "dash": "dashed",
        "opacity": 0.7
       }
      },
      "subtype": "nebula",
      "pt_smooth": [
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0
      ]
     },
     {
      "id": "neb_azure_07",
      "name": null,
      "cls": "azure",
      "pts": [
       [
        2803,
        1584
       ],
       [
        2748,
        1588
       ],
       [
        2747,
        1620
       ],
       [
        2681,
        1630
       ],
       [
        2680,
        1674
       ],
       [
        2632,
        1674
       ],
       [
        2630,
        1694
       ],
       [
        2596,
        1711
       ],
       [
        2593,
        1751
       ],
       [
        2656,
        1843
       ],
       [
        2703,
        1838
       ],
       [
        2705,
        1729
       ],
       [
        2757,
        1726
       ],
       [
        2748,
        1654
       ],
       [
        2810,
        1643
       ]
      ],
      "_provenance": "traced_from_raster_opencv",
      "label": {
       "x": 2699,
       "y": 1691
      },
      "style": {
       "color": "#46618e",
       "fill": "stipple",
       "density": 13,
       "border": {
        "width": 1.6,
        "dash": "dashed",
        "opacity": 0.7
       }
      },
      "subtype": "nebula",
      "pt_smooth": [
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0
      ]
     },
     {
      "id": "neb_violet_08",
      "name": null,
      "cls": "violet",
      "pts": [
       [
        1800,
        1636
       ],
       [
        1765,
        1695
       ],
       [
        1768,
        1751
       ],
       [
        1817,
        1801
       ],
       [
        1872,
        1801
       ],
       [
        1938,
        1750
       ],
       [
        1927,
        1674
       ],
       [
        1877,
        1636
       ]
      ],
      "_provenance": "traced_from_raster_opencv",
      "label": {
       "x": 1846,
       "y": 1718
      },
      "style": {
       "color": "#7a4a7e",
       "fill": "stipple",
       "density": 13,
       "border": {
        "width": 1.6,
        "dash": "dashed",
        "opacity": 0.7
       }
      },
      "subtype": "nebula",
      "pt_smooth": [
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0
      ]
     },
     {
      "id": "neb_violet_09",
      "name": null,
      "cls": "violet",
      "pts": [
       [
        2498,
        1751
       ],
       [
        2512,
        1854
       ],
       [
        2542,
        1867
       ],
       [
        2542,
        1908
       ],
       [
        2636,
        1899
       ],
       [
        2644,
        1947
       ],
       [
        2680,
        1945
       ],
       [
        2680,
        1894
       ],
       [
        2717,
        1867
       ],
       [
        2717,
        1828
       ],
       [
        2699,
        1844
       ],
       [
        2639,
        1833
       ],
       [
        2592,
        1730
       ],
       [
        2556,
        1751
       ]
      ],
      "_provenance": "traced_from_raster_opencv",
      "label": {
       "x": 2618,
       "y": 1851
      },
      "style": {
       "color": "#7a4a7e",
       "fill": "stipple",
       "density": 13,
       "border": {
        "width": 1.6,
        "dash": "dashed",
        "opacity": 0.7
       }
      },
      "subtype": "nebula",
      "pt_smooth": [
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0
      ]
     },
     {
      "id": "neb_violet_10",
      "name": null,
      "cls": "violet",
      "pts": [
       [
        2366,
        1924
       ],
       [
        2366,
        1947
       ],
       [
        2391,
        1948
       ],
       [
        2401,
        2026
       ],
       [
        2425,
        2026
       ],
       [
        2426,
        2006
       ],
       [
        2458,
        1995
       ],
       [
        2544,
        1991
       ],
       [
        2554,
        1953
       ],
       [
        2581,
        1936
       ],
       [
        2580,
        1918
       ],
       [
        2429,
        1902
       ],
       [
        2428,
        1863
       ],
       [
        2401,
        1865
       ],
       [
        2387,
        1907
       ]
      ],
      "_provenance": "traced_from_raster_opencv",
      "label": {
       "x": 2449,
       "y": 1947
      },
      "style": {
       "color": "#7a4a7e",
       "fill": "stipple",
       "density": 13,
       "border": {
        "width": 1.6,
        "dash": "dashed",
        "opacity": 0.7
       }
      },
      "subtype": "nebula",
      "pt_smooth": [
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0
      ]
     },
     {
      "id": "neb_crimson_11",
      "name": null,
      "cls": "crimson",
      "pts": [
       [
        1507,
        150
       ],
       [
        1560,
        162
       ],
       [
        1566,
        146
       ],
       [
        1666,
        139
       ],
       [
        1803,
        146
       ],
       [
        1852,
        126
       ],
       [
        1852,
        93
       ],
       [
        1589,
        90
       ],
       [
        1517,
        110
       ]
      ],
      "_provenance": "traced_from_raster_opencv",
      "label": {
       "x": 1657,
       "y": 129
      },
      "style": {
       "color": "#9a4a3c",
       "fill": "stipple",
       "density": 13,
       "border": {
        "width": 1.6,
        "dash": "dashed",
        "opacity": 0.7
       }
      },
      "subtype": "nebula",
      "pt_smooth": [
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0
      ]
     },
     {
      "id": "neb_violet_12",
      "name": null,
      "cls": "violet",
      "pts": [
       [
        1964,
        737
       ],
       [
        1904,
        749
       ],
       [
        1904,
        779
       ],
       [
        1870,
        780
       ],
       [
        1841,
        846
       ],
       [
        1813,
        848
       ],
       [
        1808,
        892
       ],
       [
        1825,
        893
       ],
       [
        1829,
        916
       ],
       [
        1856,
        918
       ],
       [
        1863,
        892
       ],
       [
        1895,
        889
       ],
       [
        1917,
        875
       ],
       [
        1928,
        845
       ],
       [
        1964,
        834
       ],
       [
        1981,
        807
       ]
      ],
      "_provenance": "traced_from_raster_opencv",
      "label": {
       "x": 1885,
       "y": 844
      },
      "style": {
       "color": "#7a4a7e",
       "fill": "stipple",
       "density": 13,
       "border": {
        "width": 1.6,
        "dash": "dashed",
        "opacity": 0.7
       }
      },
      "subtype": "nebula",
      "pt_smooth": [
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0
      ]
     },
     {
      "id": "neb_violet_13",
      "name": null,
      "cls": "violet",
      "pts": [
       [
        1780,
        1624
       ],
       [
        1756,
        1687
       ],
       [
        1736,
        1694
       ],
       [
        1746,
        1776
       ],
       [
        1804,
        1826
       ],
       [
        1886,
        1826
       ],
       [
        1928,
        1801
       ],
       [
        1962,
        1737
       ],
       [
        1952,
        1662
       ],
       [
        1877,
        1608
       ],
       [
        1829,
        1606
       ]
      ],
      "_provenance": "traced_from_raster_opencv",
      "label": {
       "x": 1841,
       "y": 1713
      },
      "style": {
       "color": "#7a4a7e",
       "fill": "stipple",
       "density": 13,
       "border": {
        "width": 1.6,
        "dash": "dashed",
        "opacity": 0.7
       }
      },
      "subtype": "nebula",
      "pt_smooth": [
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0
      ]
     },
     {
      "id": "neb_azure_14",
      "name": null,
      "cls": "azure",
      "pts": [
       [
        2399,
        2079
       ],
       [
        2500,
        2079
       ],
       [
        2501,
        2054
       ],
       [
        2589,
        2048
       ],
       [
        2589,
        2021
       ],
       [
        2529,
        2021
       ],
       [
        2528,
        1993
       ],
       [
        2458,
        1996
       ],
       [
        2450,
        2052
       ],
       [
        2399,
        2054
       ]
      ],
      "_provenance": "traced_from_raster_opencv",
      "label": {
       "x": 2494,
       "y": 2040
      },
      "style": {
       "color": "#46618e",
       "fill": "stipple",
       "density": 13,
       "border": {
        "width": 1.6,
        "dash": "dashed",
        "opacity": 0.7
       }
      },
      "subtype": "nebula",
      "pt_smooth": [
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0
      ]
     },
     {
      "id": "neb_crimson_15",
      "name": null,
      "cls": "crimson",
      "pts": [
       [
        3702,
        90
       ],
       [
        3702,
        130
       ],
       [
        3784,
        130
       ],
       [
        3785,
        150
       ],
       [
        3879,
        135
       ],
       [
        3879,
        90
       ]
      ],
      "_provenance": "traced_from_raster_opencv",
      "label": {
       "x": 3788,
       "y": 121
      },
      "style": {
       "color": "#9a4a3c",
       "fill": "stipple",
       "density": 13,
       "border": {
        "width": 1.6,
        "dash": "dashed",
        "opacity": 0.7
       }
      },
      "subtype": "nebula",
      "pt_smooth": [
       0,
       0,
       0,
       0,
       0,
       0
      ]
     }
    ],
    "political_entities": [],
    "fleets": [],
    "political_territories": [],
    "events": []
   }
  }
 ],
 "current_date_id": "date_0",
 "events": [],
 "event_categories": [
  {
   "id": "space_battle",
   "name": "Space Battle",
   "icon": "crossed_swords"
  }
 ]
};
