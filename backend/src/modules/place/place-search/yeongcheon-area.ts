// 영천 장소 검색 범위.
// 네이버 지역 검색은 위치 범위를 지정할 수 없어서 두 단계로 영천에 한정한다.
// 1) 검색어에 '영천'이 없으면 앞에 붙인다 ("카페" → "영천 카페")
// 2) 최종 판정: 주소(지번·도로명 중 하나)에 '영천시' 가 들어 있어야 한다.

const REGION_WORD = '영천';

export function withRegion(keyword: string): string {
  const trimmed = keyword.trim();
  return trimmed.includes(REGION_WORD) ? trimmed : `${REGION_WORD} ${trimmed}`;
}

export function isYeongcheonAddress(...addresses: (string | null | undefined)[]): boolean {
  return addresses.some((address) => !!address && address.includes('영천시'));
}
