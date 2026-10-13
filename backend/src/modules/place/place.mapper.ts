import { PlaceWithCountRow } from './place.repository';

// GET /places 항목 (API 명세 v4 §4)
export interface PlacePinResponse {
  placeId: string;
  name: string;
  usageType: string | null;
  latitude: number;
  longitude: number;
  sinceYear: number | null;
  thumbnailUrl: string | null;
  storyCount: number;
}

// GET /places/{placeId}
export interface PlaceDetailResponse extends PlacePinResponse {
  intro: string | null;
  address: string | null;
}

export function toPlacePinResponse(row: PlaceWithCountRow): PlacePinResponse {
  return {
    placeId: row.placeId,
    name: row.name,
    usageType: row.usageType,
    latitude: row.latitude,
    longitude: row.longitude,
    sinceYear: row.sinceYear,
    thumbnailUrl: row.thumbnailUrl,
    storyCount: row._count.stories,
  };
}

export function toPlaceDetailResponse(row: PlaceWithCountRow): PlaceDetailResponse {
  return { ...toPlacePinResponse(row), intro: row.intro, address: row.address };
}
