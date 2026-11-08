import { distanceMeters, LatLng } from '../../common/utils/geo-distance';

// "같은 장소" 판정 규칙 (API 명세 v4.4 §4 POST /places/resolve):
// 이름이 같고(공백·대소문자 무시) 50m 안이면 같은 장소. 같은 자리라도 이름이 다르면 다른 장소(합치지 않음).

export const SAME_PLACE_RADIUS_M = 50;

export interface NamedPoint extends LatLng {
  name: string;
}

export function normalizePlaceName(name: string): string {
  return name.replace(/\s+/g, '').toLowerCase();
}

export function isSamePlace(a: NamedPoint, b: NamedPoint): boolean {
  return normalizePlaceName(a.name) === normalizePlaceName(b.name) && distanceMeters(a, b) <= SAME_PLACE_RADIUS_M;
}

// [rows] 중 [target] 과 같은 장소. 여럿이면 가장 가까운 것.
export function findSamePlace<T extends NamedPoint>(rows: T[], target: NamedPoint): T | undefined {
  return rows
    .filter((row) => isSamePlace(row, target))
    .sort((x, y) => distanceMeters(x, target) - distanceMeters(y, target))[0];
}
