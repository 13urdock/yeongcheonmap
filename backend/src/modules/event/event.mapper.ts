import { toIsoDate } from '../../common/memory-date/seoul-today';
import { EventDetailRow, EventPinRow } from './event.repository';

// GET /events 항목 (API 명세 v4 §5). findPins 가 좌표 있는 행만 주므로 좌표는 number.
export interface EventPinResponse {
  eventId: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  storyCount: number;
}

// GET /events/{eventId}
export interface EventDetailResponse {
  eventId: string;
  name: string;
  content: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  storyCount: number;
  hosts: { hostType: string; hostName: string }[];
  occurrences: { occurrenceId: string; year: number; startDate: string | null; endDate: string | null }[];
}

export function toEventPinResponse(row: EventPinRow): EventPinResponse {
  return {
    eventId: row.eventId,
    name: row.name,
    latitude: row.latitude as number,
    longitude: row.longitude as number,
    address: row.address,
    storyCount: row._count.stories,
  };
}

export function toEventDetailResponse(row: EventDetailRow): EventDetailResponse {
  return {
    eventId: row.eventId,
    name: row.name,
    content: row.content,
    latitude: row.latitude,
    longitude: row.longitude,
    address: row.address,
    storyCount: row._count.stories,
    hosts: row.hosts.map((h) => ({ hostType: h.hostType, hostName: h.hostName })),
    occurrences: row.occurrences.map((o) => ({
      occurrenceId: o.occurrenceId,
      year: o.year,
      startDate: o.startDate ? toIsoDate(o.startDate) : null,
      endDate: o.endDate ? toIsoDate(o.endDate) : null,
    })),
  };
}
