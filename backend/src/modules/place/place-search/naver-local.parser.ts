// 네이버 지역 검색 응답 한 건 → 우리가 쓰는 모양. 순수 함수(HTTP 없음).
// - title 에는 검색어 강조 태그(<b>…</b>)와 HTML 엔티티(&amp; 등)가 섞여 온다 → 걷어낸다.
// - mapx/mapy 는 WGS84 경위도. 개발자센터 시절엔 10^7 을 곱한 정수 문자열("1289386000")이었고,
//   API HUB 문서는 자릿수를 밝히지 않는다 → 정수(×10^7)·소수(128.9386) 둘 다 받는다.
//   (카텍 좌표 등 경위도로 볼 수 없는 값이면 null → 그 결과는 버린다)

export interface NaverLocalItem {
  title: string;
  category?: string;
  address?: string; // 지번
  roadAddress?: string; // 도로명
  mapx: string; // 경도 × 10^7
  mapy: string; // 위도 × 10^7
}

export interface ExternalPlace {
  name: string;
  category: string | null;
  address: string | null; // 지번
  roadAddress: string | null; // 도로명
  latitude: number;
  longitude: number;
}

const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'" };

export function cleanTitle(title: string): string {
  return title
    .replace(/<[^>]*>/g, '')
    .replace(/&(amp|lt|gt|quot|#39|apos);/g, (m) => ENTITIES[m])
    .trim();
}

// "1289386000" → 128.9386. 한국 근처 경위도가 아니면 null
export function toDegrees(raw: string, kind: 'lat' | 'lng'): number | null {
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  const deg = Math.abs(n) > 1000 ? n / 1e7 : n;
  const [min, max] = kind === 'lat' ? [32, 39.5] : [124, 132];
  return deg >= min && deg <= max ? deg : null;
}

export function parseNaverLocalItem(item: NaverLocalItem): ExternalPlace | null {
  const latitude = toDegrees(item.mapy, 'lat');
  const longitude = toDegrees(item.mapx, 'lng');
  const name = cleanTitle(item.title ?? '');
  if (latitude === null || longitude === null || !name) return null;
  return {
    name,
    category: item.category || null,
    address: item.address || null,
    roadAddress: item.roadAddress || null,
    latitude,
    longitude,
  };
}
