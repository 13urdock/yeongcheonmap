import { AdminPlaceRow } from './admin-place.repository';

export interface AdminPlaceResponse {
  placeId: string;
  name: string;
  usageType: string | null;
  intro: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  sinceYear: number | null;
  thumbnailUrl: string | null;
  storyCount: number; // 휴지통 제외(숨김 포함)
  createdAt: string;
}

export function toAdminPlaceResponse(row: AdminPlaceRow): AdminPlaceResponse {
  return {
    placeId: row.placeId,
    name: row.name,
    usageType: row.usageType,
    intro: row.intro,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    sinceYear: row.sinceYear,
    thumbnailUrl: row.thumbnailUrl,
    storyCount: row._count.stories,
    createdAt: row.createdAt.toISOString(),
  };
}
