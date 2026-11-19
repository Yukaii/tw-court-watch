import type { ExpressionSpecification, StyleSpecification } from "maplibre-gl";
import type { ResolvedTheme } from "./theme";

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

interface MapPalette {
  background: string;
  wood: string;
  park: string;
  residential: string;
  water: string;
  waterway: string;
  building: string;
  buildingOutline: string;
  roadMinor: string;
  roadMajorCasing: string;
  roadMajorInner: string;
  motorwayCasing: string;
  motorwayInner: string;
  rail: string;
  boundary: string;
  roadLabel: string;
  townLabel: string;
  cityLabel: string;
  labelHalo: string;
}

const LIGHT_MAP_PALETTE: MapPalette = {
  background: "#f3efe6",
  wood: "#e6ebe3",
  park: "#e2e8df",
  residential: "#ece7dc",
  water: "#d9e0dc",
  waterway: "#c9d3ce",
  building: "#e5dfd3",
  buildingOutline: "#cfc7b9",
  roadMinor: "#fbf9f4",
  roadMajorCasing: "#cdc5b7",
  roadMajorInner: "#fcfbf8",
  motorwayCasing: "#b7ae9e",
  motorwayInner: "#ede6d8",
  rail: "#9c9487",
  boundary: "#aba396",
  roadLabel: "#645e54",
  townLabel: "#645e54",
  cityLabel: "#3d3a34",
  labelHalo: "#f7f5f0",
};

const DARK_MAP_PALETTE: MapPalette = {
  background: "#161614",
  wood: "#1b221e",
  park: "#1d2621",
  residential: "#1c1b18",
  water: "#101718",
  waterway: "#1d2a2b",
  building: "#22201d",
  buildingOutline: "#2f2c27",
  roadMinor: "#24221f",
  roadMajorCasing: "#2d2a25",
  roadMajorInner: "#37332d",
  motorwayCasing: "#3e3830",
  motorwayInner: "#4a4339",
  rail: "#544f47",
  boundary: "#4f4b43",
  roadLabel: "#9e988e",
  townLabel: "#a8a298",
  cityLabel: "#d4cec3",
  labelHalo: "#141412",
};

function buildJudicialMapStyle(
  mode: ResolvedTheme,
  p: MapPalette,
): StyleSpecification {
  return {
    version: 8,
    name:
      mode === "dark"
        ? "Taiwan Judicial Gazette (Dark)"
        : "Taiwan Judicial Gazette",
    sources: {
      openmaptiles: {
        type: "vector",
        url: "https://tiles.openfreemap.org/planet",
      },
    },
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    layers: [
      // Archival paper / evening obsidian base canvas
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": p.background,
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
          "fill-color": p.wood,
          "fill-opacity": 0.65,
        },
      },
      {
        id: "park",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "park",
        paint: {
          "fill-color": p.park,
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
          "fill-color": p.residential,
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
          "fill-color": p.water,
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
          "line-color": p.waterway,
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
          "fill-color": p.building,
          "fill-outline-color": p.buildingOutline,
          "fill-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            13.5,
            0,
            15,
            0.85,
          ],
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
          "line-color": p.roadMinor,
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
          "line-color": p.roadMajorCasing,
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
          "line-color": p.roadMajorInner,
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
          "line-color": p.motorwayCasing,
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
          "line-color": p.motorwayInner,
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
          "line-color": p.rail,
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
          "line-color": p.boundary,
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
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            13.5,
            11,
            16,
            12.5,
          ],
        },
        paint: {
          "text-color": p.roadLabel,
          "text-halo-color": p.labelHalo,
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
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            9,
            10.5,
            13,
            12.5,
          ],
          "text-max-width": 8,
        },
        paint: {
          "text-color": p.townLabel,
          "text-halo-color": p.labelHalo,
          "text-halo-width": 1.5,
        },
      },
      // City labels (revealed when zoomed into regions so island-wide view stays uncluttered)
      {
        id: "place-city",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        minzoom: 9.5,
        filter: ["==", ["get", "class"], "city"],
        layout: {
          "text-field": ZH_LABEL,
          "text-font": ["Noto Sans Bold"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 6, 11.5, 12, 15],
          "text-max-width": 8,
        },
        paint: {
          "text-color": p.cityLabel,
          "text-halo-color": p.labelHalo,
          "text-halo-width": 1.8,
        },
      },
    ],
  };
}

/**
 * Bespoke Judicial Gazette vector map styles for MapLibre GL JS (Light & Dark).
 * Uses OpenFreeMap's OpenMapTiles planet vector source (keyless, free).
 */
export const JUDICIAL_MAP_STYLE_LIGHT: StyleSpecification =
  buildJudicialMapStyle("light", LIGHT_MAP_PALETTE);

export const JUDICIAL_MAP_STYLE_DARK: StyleSpecification =
  buildJudicialMapStyle("dark", DARK_MAP_PALETTE);

export const JUDICIAL_MAP_STYLE: StyleSpecification = JUDICIAL_MAP_STYLE_LIGHT;

export function getJudicialMapStyle(theme: ResolvedTheme): StyleSpecification {
  return theme === "dark" ? JUDICIAL_MAP_STYLE_DARK : JUDICIAL_MAP_STYLE_LIGHT;
}

export interface CourtOverlayPalette {
  line: string;
  userHalo: string;
  userDot: string;
  userStroke: string;
  userLabel: string;
  selectedHalo: string;
  courtDot: string;
  courtSelectedDot: string;
  courtStroke: string;
  labelText: string;
  labelSelectedText: string;
  labelHalo: string;
}

export function getCourtOverlayPalette(
  theme: ResolvedTheme,
): CourtOverlayPalette {
  if (theme === "dark") {
    return {
      line: "#e07b66",
      userHalo: "#e07b66",
      userDot: "#e07b66",
      userStroke: "#141412",
      userLabel: "#f09986",
      selectedHalo: "#e07b66",
      courtDot: "#4c967f",
      courtSelectedDot: "#e07b66",
      courtStroke: "#141412",
      labelText: "#ebe7df",
      labelSelectedText: "#f09986",
      labelHalo: "#141412",
    };
  }
  return {
    line: "#8f2d1c",
    userHalo: "#8f2d1c",
    userDot: "#8f2d1c",
    userStroke: "#fcfbf8",
    userLabel: "#8f2d1c",
    selectedHalo: "#8f2d1c",
    courtDot: "#1b382f",
    courtSelectedDot: "#8f2d1c",
    courtStroke: "#fcfbf8",
    labelText: "#191816",
    labelSelectedText: "#8f2d1c",
    labelHalo: "#fcfbf8",
  };
}
