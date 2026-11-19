"use client";

import {
  ArrowRight,
  Compass,
  ExternalLink,
  Loader2,
  LocateFixed,
  MapPin,
  Minus,
  Plus,
  Train,
} from "lucide-react";
import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  COURT_BY_ID,
  COURT_LEVEL_LABELS,
  MAJOR_COURTS,
  getGoogleMapsUrl,
} from "@/lib/courts";
import {
  type GeoPoint,
  formatDistanceZh,
  haversineDistanceKm,
  sortCourtsByDistance,
} from "@/lib/geo";
import { JUDICIAL_MAP_STYLE } from "@/lib/map-style";
import type { CourtInfo, HearingsMeta } from "@/lib/types";

interface CourtMapExplorerProps {
  meta: HearingsMeta;
}

type MapRegionId =
  | "all"
  | "taipei"
  | "taoyuan_hsinchu"
  | "central"
  | "south_west"
  | "kaohsiung_pingtung"
  | "east_islands";

const REGION_PRESETS: Array<{
  id: MapRegionId;
  label: string;
  center: [number, number];
  zoom: number;
  crtids?: string[];
}> = [
  { id: "all", label: "全臺", center: [120.85, 23.62], zoom: 6.45 },
  {
    id: "taipei",
    label: "北北基",
    center: [121.53, 25.05],
    zoom: 10.6,
    crtids: ["TPD", "TPH", "TPS", "TPA", "TPP", "TPB", "TPT", "SLD", "PCD", "IPC", "KLD"],
  },
  {
    id: "taoyuan_hsinchu",
    label: "桃竹苗",
    center: [121.1, 24.82],
    zoom: 9.4,
    crtids: ["TYD", "SCD", "MLD"],
  },
  {
    id: "central",
    label: "中彰投",
    center: [120.66, 24.05],
    zoom: 9.6,
    crtids: ["TCD", "TCH", "TCB", "TCT", "NTD", "CHD"],
  },
  {
    id: "south_west",
    label: "雲嘉南",
    center: [120.32, 23.3],
    zoom: 9.2,
    crtids: ["ULD", "CYD", "TND", "TNH"],
  },
  {
    id: "kaohsiung_pingtung",
    label: "高屏",
    center: [120.36, 22.68],
    zoom: 9.8,
    crtids: ["KSD", "KSH", "KSB", "KST", "CTD", "PTD"],
  },
  {
    id: "east_islands",
    label: "花東離島",
    center: [121.35, 23.8],
    zoom: 7.2,
    crtids: ["ILD", "HLD", "HLH", "TTD", "PHD", "KMD", "KMH", "LCD"],
  },
];

function buildCourtsGeoJson(
  courts: CourtInfo[],
  selectedId: string,
  nearestId: string | null,
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  // Subtle horizontal nudge (~38m) only when multiple courts share identical coordinates
  const seenCoords = new Map<string, number>();

  return {
    type: "FeatureCollection",
    features: courts.map((court) => {
      const coordKey = `${court.lat.toFixed(5)},${court.lng.toFixed(5)}`;
      const dupIdx = seenCoords.get(coordKey) ?? 0;
      seenCoords.set(coordKey, dupIdx + 1);
      const lngOffset = dupIdx === 0 ? 0 : (dupIdx % 2 === 1 ? 1 : -1) * Math.ceil(dupIdx / 2) * 0.00042;

      const isSelected = court.crtid === selectedId;
      const isNearest = court.crtid === nearestId;
      const sortKey = isSelected ? 0 : isNearest ? 1 : court.popular ? 2 : 3;

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [court.lng + lngOffset, court.lat],
        },
        properties: {
          crtid: court.crtid,
          shortName: court.shortName,
          isSelected,
          isNearest,
          sortKey,
        },
      };
    }),
  };
}

function buildUserGeoJson(
  userLocation: GeoPoint | null,
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  if (!userLocation) {
    return { type: "FeatureCollection", features: [] };
  }
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [userLocation.lng, userLocation.lat],
        },
        properties: { label: "你的位置" },
      },
    ],
  };
}

function buildConnectionGeoJson(
  userLocation: GeoPoint | null,
  selectedCourt: CourtInfo | undefined,
): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  if (!userLocation || !selectedCourt) {
    return { type: "FeatureCollection", features: [] };
  }
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [userLocation.lng, userLocation.lat],
            [selectedCourt.lng, selectedCourt.lat],
          ],
        },
        properties: {},
      },
    ],
  };
}

export function CourtMapExplorer({ meta }: CourtMapExplorerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const mapReadyRef = useRef(false);

  const [selectedId, setSelectedId] = useState<string>("TPD");
  const [regionFilter, setRegionFilter] = useState<MapRegionId>("all");
  const [userLocation, setUserLocation] = useState<GeoPoint | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoMessage, setGeoMessage] = useState<string>("");
  const [mapLoaded, setMapLoaded] = useState(false);

  const courtStatsMap = useMemo(
    () => Object.fromEntries(meta.courts.map((c) => [c.crtid, c])),
    [meta.courts],
  );

  const rankedByDistance = useMemo(() => {
    if (!userLocation) return null;
    return sortCourtsByDistance(MAJOR_COURTS, userLocation);
  }, [userLocation]);

  const nearestId = rankedByDistance?.[0]?.court.crtid ?? null;
  const selectedCourt = COURT_BY_ID[selectedId] ?? MAJOR_COURTS[0];
  const selectedMainCampus =
    selectedCourt.campuses[selectedCourt.campuses.length - 1];
  const selectedStats = courtStatsMap[selectedCourt.crtid];
  const selectedDistanceKm = useMemo(() => {
    if (!userLocation) return null;
    return haversineDistanceKm(userLocation, {
      lat: selectedCourt.lat,
      lng: selectedCourt.lng,
    });
  }, [userLocation, selectedCourt]);

  // Courts sharing the exact same main address (e.g., TPB & TPT, TCH & TCB & TCT)
  const colocatedCourts = useMemo(() => {
    return MAJOR_COURTS.filter((c) => {
      if (c.crtid === selectedCourt.crtid) return false;
      const main = c.campuses[c.campuses.length - 1];
      return main.address === selectedMainCampus.address;
    });
  }, [selectedCourt.crtid, selectedMainCampus.address]);

  const listItems = useMemo(() => {
    const preset = REGION_PRESETS.find((r) => r.id === regionFilter);
    const allowedSet = preset?.crtids ? new Set(preset.crtids) : null;

    if (rankedByDistance) {
      const filtered = allowedSet
        ? rankedByDistance.filter((item) => allowedSet.has(item.court.crtid))
        : rankedByDistance;
      return filtered.map((item) => ({
        court: item.court,
        distanceKm: item.distanceKm,
      }));
    }

    const base = allowedSet
      ? MAJOR_COURTS.filter((c) => allowedSet.has(c.crtid))
      : MAJOR_COURTS;

    // Default order: popular courts first, then by 14-day hearing count desc
    return [...base]
      .sort((a, b) => {
        const popDiff = Number(Boolean(b.popular)) - Number(Boolean(a.popular));
        if (popDiff !== 0) return popDiff;
        const countA = courtStatsMap[a.crtid]?.total ?? 0;
        const countB = courtStatsMap[b.crtid]?.total ?? 0;
        return countB - countA;
      })
      .map((court) => ({ court, distanceKm: null as number | null }));
  }, [regionFilter, rankedByDistance, courtStatsMap]);

  // Keep GeoJSON sources synced whenever selection or user location changes
  const syncSources = useCallback(
    (map: MapLibreMap) => {
      const courtsSrc = map.getSource("courts") as GeoJSONSource | undefined;
      if (courtsSrc) {
        courtsSrc.setData(
          buildCourtsGeoJson(MAJOR_COURTS, selectedId, nearestId),
        );
      }
      const userSrc = map.getSource("user-location") as GeoJSONSource | undefined;
      if (userSrc) {
        userSrc.setData(buildUserGeoJson(userLocation));
      }
      const connSrc = map.getSource("nearest-line") as GeoJSONSource | undefined;
      if (connSrc) {
        connSrc.setData(buildConnectionGeoJson(userLocation, selectedCourt));
      }
    },
    [selectedId, nearestId, userLocation, selectedCourt],
  );

  useEffect(() => {
    let destroyed = false;
    let mapInstance: MapLibreMap | null = null;

    async function init() {
      if (!mapContainerRef.current) return;
      const maplibregl = await import("maplibre-gl");
      if (destroyed || !mapContainerRef.current) return;

      mapInstance = new maplibregl.Map({
        container: mapContainerRef.current,
        style: JUDICIAL_MAP_STYLE,
        center: [120.85, 23.62],
        zoom: 6.45,
        minZoom: 5.5,
        maxZoom: 17,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
        localIdeographFontFamily:
          '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif',
      });

      mapRef.current = mapInstance;

      mapInstance.on("load", () => {
        if (destroyed || !mapInstance) return;

        mapInstance.addSource("nearest-line", {
          type: "geojson",
          data: buildConnectionGeoJson(null, undefined),
        });

        mapInstance.addLayer({
          id: "nearest-line-layer",
          type: "line",
          source: "nearest-line",
          paint: {
            "line-color": "#8f2d1c",
            "line-width": 1.6,
            "line-opacity": 0.65,
            "line-dasharray": [3, 3],
          },
        });

        mapInstance.addSource("user-location", {
          type: "geojson",
          data: buildUserGeoJson(null),
        });

        mapInstance.addLayer({
          id: "user-location-halo",
          type: "circle",
          source: "user-location",
          paint: {
            "circle-radius": 15,
            "circle-color": "#8f2d1c",
            "circle-opacity": 0.16,
          },
        });

        mapInstance.addLayer({
          id: "user-location-dot",
          type: "circle",
          source: "user-location",
          paint: {
            "circle-radius": 5.5,
            "circle-color": "#8f2d1c",
            "circle-stroke-color": "#fcfbf8",
            "circle-stroke-width": 2.5,
          },
        });

        mapInstance.addLayer({
          id: "user-location-label",
          type: "symbol",
          source: "user-location",
          layout: {
            "text-field": ["get", "label"],
            "text-font": ["Noto Sans Bold"],
            "text-size": 11.5,
            "text-offset": [0, -1.5],
            "text-allow-overlap": true,
          },
          paint: {
            "text-color": "#8f2d1c",
            "text-halo-color": "#fcfbf8",
            "text-halo-width": 1.8,
          },
        });

        mapInstance.addSource("courts", {
          type: "geojson",
          data: buildCourtsGeoJson(MAJOR_COURTS, "TPD", null),
        });

        // Subtle vermilion seal halo behind selected courthouse
        mapInstance.addLayer({
          id: "courts-selected-halo",
          type: "circle",
          source: "courts",
          filter: ["==", ["get", "isSelected"], true],
          paint: {
            "circle-radius": 17,
            "circle-color": "#8f2d1c",
            "circle-opacity": 0.18,
          },
        });

        // Courthouse dots
        mapInstance.addLayer({
          id: "courts-points",
          type: "circle",
          source: "courts",
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              6,
              ["case", ["get", "isSelected"], 7.5, 5],
              12,
              ["case", ["get", "isSelected"], 9.5, 7],
            ],
            "circle-color": [
              "case",
              ["get", "isSelected"],
              "#8f2d1c",
              "#1b382f",
            ],
            "circle-stroke-color": "#fcfbf8",
            "circle-stroke-width": [
              "case",
              ["get", "isSelected"],
              2.5,
              1.8,
            ],
          },
        });

        // Courthouse Traditional Chinese labels (smart collision avoidance)
        mapInstance.addLayer({
          id: "courts-labels",
          type: "symbol",
          source: "courts",
          layout: {
            "text-field": ["get", "shortName"],
            "text-font": ["Noto Sans Bold"],
            "text-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              6,
              11,
              12,
              13,
            ],
            "text-offset": [0, 1.25],
            "text-anchor": "top",
            "symbol-sort-key": ["get", "sortKey"],
            "text-padding": 3,
          },
          paint: {
            "text-color": [
              "case",
              ["get", "isSelected"],
              "#8f2d1c",
              "#191816",
            ],
            "text-halo-color": "#fcfbf8",
            "text-halo-width": 2,
          },
        });

        const handlePick = (e: { features?: Array<{ properties?: Record<string, unknown> }> }) => {
          const crtid = e.features?.[0]?.properties?.crtid;
          if (typeof crtid === "string" && COURT_BY_ID[crtid]) {
            setSelectedId(crtid);
            const target = COURT_BY_ID[crtid];
            mapInstance?.easeTo({
              center: [target.lng, target.lat],
              zoom: Math.max(mapInstance.getZoom(), 11.8),
              duration: 550,
            });
          }
        };

        mapInstance.on("click", "courts-points", handlePick);
        mapInstance.on("click", "courts-labels", handlePick);

        const setPointer = () => {
          if (mapInstance) mapInstance.getCanvas().style.cursor = "pointer";
        };
        const clearPointer = () => {
          if (mapInstance) mapInstance.getCanvas().style.cursor = "";
        };
        mapInstance.on("mouseenter", "courts-points", setPointer);
        mapInstance.on("mouseleave", "courts-points", clearPointer);
        mapInstance.on("mouseenter", "courts-labels", setPointer);
        mapInstance.on("mouseleave", "courts-labels", clearPointer);

        mapReadyRef.current = true;
        setMapLoaded(true);
      });
    }

    init();

    return () => {
      destroyed = true;
      mapReadyRef.current = false;
      mapInstance?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapReadyRef.current && mapRef.current) {
      syncSources(mapRef.current);
    }
  }, [syncSources, mapLoaded]);

  const focusCourt = (court: CourtInfo) => {
    setSelectedId(court.crtid);
    const map = mapRef.current;
    if (!map) return;

    if (userLocation) {
      const minLng = Math.min(userLocation.lng, court.lng);
      const maxLng = Math.max(userLocation.lng, court.lng);
      const minLat = Math.min(userLocation.lat, court.lat);
      const maxLat = Math.max(userLocation.lat, court.lat);
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 72, maxZoom: 14, duration: 650 },
      );
      return;
    }

    map.flyTo({
      center: [court.lng, court.lat],
      zoom: Math.max(map.getZoom(), 13),
      duration: 650,
    });
  };

  const handleRegionChange = (regionId: MapRegionId) => {
    setRegionFilter(regionId);
    const preset = REGION_PRESETS.find((r) => r.id === regionId);
    if (!preset) return;
    if (preset.crtids && !preset.crtids.includes(selectedId)) {
      setSelectedId(preset.crtids[0]);
    }
    mapRef.current?.flyTo({
      center: preset.center,
      zoom: preset.zoom,
      duration: 650,
    });
  };

  const handleLocateMe = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoMessage("此瀏覽器不支援定位功能，請直接點選上方區域瀏覽法院。");
      return;
    }

    setLocating(true);
    setGeoMessage("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const origin: GeoPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(origin);
        setRegionFilter("all");
        setLocating(false);

        const sorted = sortCourtsByDistance(MAJOR_COURTS, origin);
        const nearest = sorted[0];
        if (nearest) {
          setSelectedId(nearest.court.crtid);
          const map = mapRef.current;
          if (map) {
            const minLng = Math.min(origin.lng, nearest.court.lng);
            const maxLng = Math.max(origin.lng, nearest.court.lng);
            const minLat = Math.min(origin.lat, nearest.court.lat);
            const maxLat = Math.max(origin.lat, nearest.court.lat);
            map.fitBounds(
              [
                [minLng, minLat],
                [maxLng, maxLat],
              ],
              { padding: 76, maxZoom: 14, duration: 750 },
            );
          }
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoMessage(
            "未授權定位權限，你可以直接點選區域或地圖上的法院位置查看。",
          );
        } else {
          setGeoMessage(
            "暫時無法取得定位訊號，請稍後再試或直接點選區域查看。",
          );
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300_000 },
    );
  };

  const handleZoomIn = () => {
    mapRef.current?.zoomIn({ duration: 250 });
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut({ duration: 250 });
  };

  const handleResetView = () => {
    setRegionFilter("all");
    mapRef.current?.flyTo({
      center: [120.85, 23.62],
      zoom: 6.45,
      duration: 600,
    });
  };

  const mapsNavUrl = getGoogleMapsUrl(
    selectedMainCampus.name,
    selectedMainCampus.address,
  );
  const searchCourtUrl = `/search?court=${selectedCourt.crtid}&start=${meta.todayDate}&end=${meta.todayDate}`;

  return (
    <section id="court-map" className="space-y-5">
      {/* Header matching HomeCalendarExplorer */}
      <div className="legal-rule-bottom flex flex-wrap items-end justify-between gap-4 pb-3.5">
        <div>
          <h2 className="font-editorial text-2xl font-semibold text-[#191816] sm:text-[28px]">
            找離你最近的法院
          </h2>
          <p className="mt-1 text-[15px] text-[#5c574f]">
            開啟定位自動計算距離，或直接點選地圖上的全台 38 所主要法院。
          </p>
        </div>

        <button
          type="button"
          onClick={handleLocateMe}
          disabled={locating}
          className="btn-formal-primary shrink-0 disabled:opacity-65"
        >
          {locating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <LocateFixed className="h-4 w-4" aria-hidden="true" />
          )}
          <span>
            {locating
              ? "正在取得位置…"
              : userLocation
                ? "重新定位"
                : "定位找最近法院"}
          </span>
        </button>
      </div>

      {geoMessage && (
        <p className="border-l-2 border-[#8f2d1c] bg-[#f9f3f1] px-4 py-2.5 text-sm text-[#5c574f]">
          {geoMessage}
        </p>
      )}

      {/* Region quick-jump bar */}
      <div className="flex flex-wrap items-center border-b border-[#d6d0c4]">
        {REGION_PRESETS.map((r) => {
          const active = regionFilter === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => handleRegionChange(r.id)}
              className={`-mb-px border-b-2 px-3.5 py-2 text-sm transition-colors ${
                active
                  ? "border-[#191816] font-semibold text-[#191816]"
                  : "border-transparent font-normal text-[#5c574f] hover:border-[#d6d0c4] hover:text-[#191816]"
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {/* Architectural Split Frame: Vector Map + Selected Court & Nearest List */}
      <div className="grid overflow-hidden rounded-[2px] border border-[#191816]/25 bg-[#fcfbf8] lg:grid-cols-12">
        {/* Map Canvas */}
        <div className="relative h-[360px] border-b border-[#d6d0c4] bg-[#f3efe6] sm:h-[440px] lg:col-span-7 lg:h-[520px] lg:border-b-0 lg:border-r">
          <div
            ref={mapContainerRef}
            className="h-full w-full"
            aria-label="臺灣主要法院互動地圖"
          />

          {!mapLoaded && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#f3efe6]/80 text-sm text-[#5c574f]">
              <span className="inline-flex items-center gap-2 border border-[#191816]/20 bg-[#fcfbf8] px-3.5 py-2">
                <Loader2
                  className="h-4 w-4 animate-spin text-[#1b382f]"
                  aria-hidden="true"
                />
                <span>載入法院地圖中…</span>
              </span>
            </div>
          )}

          {/* Custom flat architectural zoom/reset controls */}
          <div className="absolute right-3 top-3 z-10 flex flex-col divide-y divide-[#d6d0c4] border border-[#191816]/25 bg-[#fcfbf8]">
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="放大地圖"
              className="flex h-8 w-8 items-center justify-center text-[#191816] transition-colors hover:bg-[#efece4]"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="縮小地圖"
              className="flex h-8 w-8 items-center justify-center text-[#191816] transition-colors hover:bg-[#efece4]"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleResetView}
              aria-label="回到全臺視野"
              title="回到全臺視野"
              className="flex h-8 w-8 items-center justify-center text-[#191816] transition-colors hover:bg-[#efece4]"
            >
              <Compass className="h-4 w-4" />
            </button>
          </div>

          {/* Quiet legend + attribution */}
          <div className="pointer-events-none absolute bottom-2.5 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#5c574f]">
            <div className="flex items-center gap-3 border border-[#191816]/15 bg-[#fcfbf8]/92 px-2.5 py-1">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full border border-[#fcfbf8] bg-[#1b382f]" />
                <span>法院</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full border border-[#fcfbf8] bg-[#8f2d1c]" />
                <span>已選取{userLocation ? "／你的位置" : ""}</span>
              </span>
            </div>
            <span className="border border-[#191816]/12 bg-[#fcfbf8]/85 px-2 py-0.5 font-tabular text-[10px] text-[#706b62]">
              © OpenFreeMap · OpenStreetMap
            </span>
          </div>
        </div>

        {/* Right Panel: Selected Court Details + Nearest List */}
        <div className="flex flex-col lg:col-span-5 lg:h-[520px]">
          {/* Selected Court Detail Card */}
          <div className="border-b border-[#d6d0c4] bg-[#efece4]/55 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {nearestId === selectedCourt.crtid && (
                <span className="border border-[#8f2d1c] bg-[#8f2d1c] px-1.5 py-0.5 font-medium text-[#fcfbf8]">
                  離你最近
                </span>
              )}
              {selectedDistanceKm !== null && (
                <span className="border border-[#191816]/30 bg-[#fcfbf8] px-1.5 py-0.5 font-tabular font-medium text-[#191816]">
                  直線約 {formatDistanceZh(selectedDistanceKm)}
                </span>
              )}
              <span className="text-[#5c574f]">
                {COURT_LEVEL_LABELS[selectedCourt.level]}
              </span>
            </div>

            <h3 className="mt-2 font-editorial text-xl font-semibold text-[#191816]">
              {selectedCourt.name}
            </h3>

            {selectedStats && (
              <p className="mt-1 font-tabular text-xs text-[#5c574f]">
                今日{" "}
                <strong className="font-semibold text-[#191816]">
                  {selectedStats.today}
                </strong>{" "}
                場公開開庭 · 未來 14 天共{" "}
                <strong className="font-semibold text-[#191816]">
                  {selectedStats.total}
                </strong>{" "}
                場
              </p>
            )}

            <div className="mt-3 space-y-1 text-sm text-[#191816]">
              <p className="flex items-start gap-1.5">
                <MapPin
                  className="mt-1 h-3.5 w-3.5 shrink-0 text-[#5c574f]"
                  aria-hidden="true"
                />
                <span>{selectedMainCampus.address}</span>
              </p>
              {selectedMainCampus.transit && (
                <p className="flex items-start gap-1.5 text-xs leading-relaxed text-[#5c574f]">
                  <Train
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{selectedMainCampus.transit}</span>
                </p>
              )}
            </div>

            {colocatedCourts.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-[#5c574f]">
                <span>同院區法院：</span>
                {colocatedCourts.map((c) => (
                  <button
                    key={c.crtid}
                    type="button"
                    onClick={() => focusCourt(c)}
                    className="border border-[#191816]/25 bg-[#fcfbf8] px-2 py-0.5 font-medium text-[#191816] transition-colors hover:border-[#1b382f] hover:text-[#1b382f]"
                  >
                    {c.shortName}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={searchCourtUrl} className="btn-formal-primary">
                <span>查看開庭場次</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <a
                href={mapsNavUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-formal-secondary"
              >
                <span>Google 地圖導航</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Scrollable Court Directory / Nearest List */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-[#d6d0c4] bg-[#fcfbf8] px-5 py-2.5 text-xs text-[#5c574f]">
              <span className="font-medium text-[#191816]">
                {userLocation ? "依距離排序" : "法院索引"}
              </span>
              <span className="font-tabular">{listItems.length} 所法院</span>
            </div>

            <div className="max-h-[250px] flex-1 divide-y divide-[#e6e0d4] overflow-y-auto lg:max-h-none">
              {listItems.map(({ court, distanceKm }) => {
                const active = court.crtid === selectedCourt.crtid;
                const stats = courtStatsMap[court.crtid];
                return (
                  <button
                    key={court.crtid}
                    type="button"
                    onClick={() => focusCourt(court)}
                    className={`flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors ${
                      active
                        ? "border-l-2 border-l-[#8f2d1c] bg-[#efece4]/70"
                        : "hover:bg-[#f7f5f0]"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#191816]">
                        {court.shortName}
                        {nearestId === court.crtid && (
                          <span className="ml-2 text-xs font-medium text-[#8f2d1c]">
                            最近
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-[#5c574f]">
                        {court.campuses[court.campuses.length - 1].address}
                      </p>
                    </div>

                    <div className="shrink-0 text-right font-tabular text-xs">
                      {distanceKm !== null ? (
                        <p className="font-semibold text-[#191816]">
                          {formatDistanceZh(distanceKm)}
                        </p>
                      ) : null}
                      <p className="text-[#5c574f]">
                        {stats ? `${stats.total} 場` : "—"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
