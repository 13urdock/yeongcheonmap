import { randomUUID } from 'node:crypto';
import { seoulToday } from '../../common/memory-date/seoul-today';

// 객체 키 규칙(API 명세 §8): stories/{YYYY-MM}/{uuid}.{jpg|png|webp} — 서버가 정한다.
export const STORY_PHOTO_PREFIX = 'stories/';

export const ALLOWED_CONTENT_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

export type AllowedContentType = keyof typeof ALLOWED_CONTENT_TYPES;

export function buildStoryPhotoKey(
  contentType: AllowedContentType,
  now: Date = new Date(),
  uuid: string = randomUUID(),
): string {
  const { year, month } = seoulToday(now); // 폴더 월은 한국 시간 기준
  const yyyyMm = `${year}-${String(month).padStart(2, '0')}`;
  return `${STORY_PHOTO_PREFIX}${yyyyMm}/${uuid}.${ALLOWED_CONTENT_TYPES[contentType]}`;
}
