// 두 좌표 사이 거리(미터). 하버사인 공식, 순수 함수.

const EARTH_RADIUS_M = 6_371_000;

export interface LatLng {
  latitude: number;
  longitude: number;
}

export function distanceMeters(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

// 점 주변 [meters] 반경을 덮는 사각형 (DB 1차 거르기용 — 정확한 판정은 distanceMeters)
export function boxAround(point: LatLng, meters: number) {
  const dLat = meters / 111_320;
  const dLng = meters / (111_320 * Math.cos((point.latitude * Math.PI) / 180));
  return {
    minLat: point.latitude - dLat,
    maxLat: point.latitude + dLat,
    minLng: point.longitude - dLng,
    maxLng: point.longitude + dLng,
  };
}
