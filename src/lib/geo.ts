import type { CourtInfo } from "./types";

export interface GeoPoint {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Great-circle distance between two WGS84 points in kilometers.
 */
export function haversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const h =
    sinLat * sinLat +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * sinLng * sinLng;

  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Format kilometer distance cleanly in Traditional Chinese.
 */
export function formatDistanceZh(km: number): string {
  if (!Number.isFinite(km) || km < 0) return "";
  if (km < 1) {
    const meters = Math.max(50, Math.round((km * 1000) / 10) * 10);
    return `${meters} 公尺`;
  }
  if (km < 100) {
    return `${km.toFixed(1)} 公里`;
  }
  return `${Math.round(km)} 公里`;
}

export interface CourtWithDistance {
  court: CourtInfo;
  distanceKm: number;
}

/**
 * Return courts sorted ascending by distance from `origin`.
 */
export function sortCourtsByDistance(
  courts: CourtInfo[],
  origin: GeoPoint,
): CourtWithDistance[] {
  return courts
    .map((court) => ({
      court,
      distanceKm: haversineDistanceKm(origin, {
        lat: court.lat,
        lng: court.lng,
      }),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
