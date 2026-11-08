import { ExternalPlace } from './place-search/naver-local.parser';

// GET /places/candidates 항목 (API 명세 v4.4 §4)
export interface PlaceCandidateResponse {
  name: string;
  category: string | null;
  address: string | null; // 도로명 우선, 없으면 지번
  latitude: number;
  longitude: number;
  placeId: string | null; // 이미 우리 DB 에 있는 같은 장소
}

export interface PlaceCandidatesResponse {
  items: PlaceCandidateResponse[];
}

export function toPlaceCandidate(place: ExternalPlace): Omit<PlaceCandidateResponse, 'placeId'> {
  return {
    name: place.name,
    category: place.category,
    address: place.roadAddress ?? place.address,
    latitude: place.latitude,
    longitude: place.longitude,
  };
}
