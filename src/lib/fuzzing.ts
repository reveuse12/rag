/**
 * PRD Requirement: Server-side location fuzzing to 300-500m.
 * Exact coordinates are never stored or exposed.
 */

export interface FuzzedCoordinate {
  latitude: number;
  longitude: number;
  accuracyRadiusMeters: number; // e.g. 400m
  expiresAt: string;
}

/**
 * Fuzz coordinates by adding random offset within 300-500m radius
 * and grid-snapping to prevent reverse-triangulation.
 */
export function fuzzCoordinates(
  lat: number,
  lng: number,
  expiryHours: number = 3
): FuzzedCoordinate {
  // Approximate conversion: 1 degree latitude ~= 111,000 meters
  // 1 degree longitude ~= 111,000 * cos(lat) meters
  const minFuzzMeters = 300;
  const maxFuzzMeters = 500;
  const randomDistance = minFuzzMeters + Math.random() * (maxFuzzMeters - minFuzzMeters);
  const randomAngle = Math.random() * 2 * Math.PI;

  const latOffset = (randomDistance * Math.cos(randomAngle)) / 111000;
  const lngOffset =
    (randomDistance * Math.sin(randomAngle)) /
    (111000 * Math.cos((lat * Math.PI) / 180));

  // Snap to 3 decimal places (~110m grid) for extra differential privacy
  const fuzzedLat = Number((lat + latOffset).toFixed(3));
  const fuzzedLng = Number((lng + lngOffset).toFixed(3));

  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();

  return {
    latitude: fuzzedLat,
    longitude: fuzzedLng,
    accuracyRadiusMeters: Math.round(randomDistance),
    expiresAt,
  };
}
