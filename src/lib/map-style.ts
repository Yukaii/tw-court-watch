import type { ExpressionSpecification, StyleSpecification } from "maplibre-gl";

/**
 * Pure Traditional Chinese place/road label expression for OpenMapTiles schema.
 */
const ZH_LABEL: ExpressionSpecification = [
  "coalesce",
  ["get", "name:zh-Hant"],
  ["get", "name:zh"],
  ["get", "name:nonlatin"],
  ["get", "name"],
];

/**
 * Bespoke Judicial Gazette vector map style for MapLibre GL JS.
 * Uses OpenFreeMap's OpenMapTiles planet vector source (keyless, free)
 * and renders every layer in our warm archival paper / robe-green / ink palette.
 */
export const JUDICIAL_MAP_STYLE: StyleSpecification = {
  version: 8,
  name: "Taiwan Judicial Gazette",
  sources: {
    openmaptiles: {
      type: "vector",
      url: "https://tiles.openfreemap.org/planet",
    },
  },
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  layers: [
    // Archival paper base canvas
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#f3efe6",
      },
    },
    // Subtle natural wood / mountain relief in muted robe-sage
    {
      id: "landcover-wood",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "landcover",
      filter: ["==", ["get", "class"], "wood"],
      paint: {
        "fill-color": "#e6ebe3",
        "fill-opacity": 0.65,
      },
    },
    {
      id: "park",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "park",
      paint: {
        "fill-color": "#e2e8df",
        "fill-opacity": 0.75,
      },
    },
    {
      id: "landuse-residential",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "landuse",
      maxzoom: 15,
      filter: ["==", ["get", "class"], "residential"],
      paint: {
        "fill-color": "#ece7dc",
        "fill-opacity": 0.6,
      },
    },
    // Calm sage-slate water (Taiwan Strait, rivers, harbors)
    {
      id: "water",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "water",
      filter: ["!=", ["get", "brunnel"], "tunnel"],
      paint: {
        "fill-color": "#d9e0dc",
        "fill-antialias": true,
      },
    },
    {
      id: "waterway",
      type: "line",
      source: "openmaptiles",
      "source-layer": "waterway",
      filter: ["!=", ["get", "brunnel"], "tunnel"],
      paint: {
        "line-color": "#c9d3ce",
        "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.5, 14, 2.2],
      },
    },
    // Architectural building footprints at street zoom
    {
      id: "building",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "building",
      minzoom: 13.5,
      paint: {
        "fill-color": "#e5dfd3",
        "fill-outline-color": "#cfc7b9",
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 13.5, 0, 15, 0.85],
      },
    },
    // Minor roads
    {
      id: "highway-minor",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 11,
      filter: [
        "match",
        ["get", "class"],
        ["minor", "service", "track"],
        true,
        false,
      ],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#fbf9f4",
        "line-width": ["interpolate", ["linear"], ["zoom"], 11, 0.5, 16, 4.5],
      },
    },
    // Major roads casing + fill
    {
      id: "highway-major-casing",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 8,
      filter: [
        "match",
        ["get", "class"],
        ["primary", "secondary", "tertiary", "trunk"],
        true,
        false,
      ],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#cdc5b7",
        "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.8, 16, 8.5],
      },
    },
    {
      id: "highway-major-inner",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 8,
      filter: [
        "match",
        ["get", "class"],
        ["primary", "secondary", "tertiary", "trunk"],
        true,
        false,
      ],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#fcfbf8",
        "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.4, 16, 6.5],
      },
    },
    // Motorways & expressways in restrained parchment-brass (no bright orange)
    {
      id: "highway-motorway-casing",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 6,
      filter: ["==", ["get", "class"], "motorway"],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#b7ae9e",
        "line-width": ["interpolate", ["linear"], ["zoom"], 6, 1, 15, 9],
      },
    },
    {
      id: "highway-motorway-inner",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 6,
      filter: ["==", ["get", "class"], "motorway"],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#ede6d8",
        "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.5, 15, 6.5],
      },
    },
    // Rail / MRT / HSR hairline
    {
      id: "railway",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 11,
      filter: ["match", ["get", "class"], ["rail", "transit"], true, false],
      paint: {
        "line-color": "#9c9487",
        "line-width": 1.1,
        "line-dasharray": [3, 3],
      },
    },
    // County / City administrative borders
    {
      id: "boundary-admin",
      type: "line",
      source: "openmaptiles",
      "source-layer": "boundary",
      minzoom: 6,
      filter: [
        "all",
        [">=", ["get", "admin_level"], 3],
        ["<=", ["get", "admin_level"], 6],
        ["!=", ["get", "maritime"], 1],
      ],
      paint: {
        "line-color": "#aba396",
        "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.7, 12, 1.3],
        "line-dasharray": [3, 2],
      },
    },
    // Street names at detail zoom
    {
      id: "road-label",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "transportation_name",
      minzoom: 13.5,
      layout: {
        "symbol-placement": "line",
        "text-field": ZH_LABEL,
        "text-font": ["Noto Sans Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 13.5, 11, 16, 12.5],
      },
      paint: {
        "text-color": "#645e54",
        "text-halo-color": "#f7f5f0",
        "text-halo-width": 1.4,
      },
    },
    // District / Town labels
    {
      id: "place-town",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "place",
      minzoom: 9,
      filter: ["match", ["get", "class"], ["town", "suburb"], true, false],
      layout: {
        "text-field": ZH_LABEL,
        "text-font": ["Noto Sans Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 9, 10.5, 13, 12.5],
        "text-max-width": 8,
      },
      paint: {
        "text-color": "#645e54",
        "text-halo-color": "#f7f5f0",
        "text-halo-width": 1.5,
      },
    },
    // City labels
    {
      id: "place-city",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "place",
      minzoom: 5,
      filter: ["==", ["get", "class"], "city"],
      layout: {
        "text-field": ZH_LABEL,
        "text-font": ["Noto Sans Bold"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 6, 11.5, 12, 15],
        "text-max-width": 8,
      },
      paint: {
        "text-color": "#3d3a34",
        "text-halo-color": "#f7f5f0",
        "text-halo-width": 1.8,
      },
    },
  ],
};
