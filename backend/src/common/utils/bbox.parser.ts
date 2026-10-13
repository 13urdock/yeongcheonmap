// 뷰포트 필터 문자열 "minLng,minLat,maxLng,maxLat" (API 명세 v3 §4) → 숫자 객체. 순수 함수.

export interface BoundingBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

// 형식이 틀리면 null (검증 실패 판단은 호출자 몫)
export function parseBbox(raw: string): BoundingBox | null {
  const parts = raw.split(',').map((p) => Number(p.trim()));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return null;

  const [minLng, minLat, maxLng, maxLat] = parts;
  if (minLat < -90 || maxLat > 90 || minLng < -180 || maxLng > 180) return null;
  if (minLng > maxLng || minLat > maxLat) return null;

  return { minLng, minLat, maxLng, maxLat };
}
