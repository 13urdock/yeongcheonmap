import { AdminStoryResponse } from './admin-story.mapper';

// 관리 화면 기록 내보내기 CSV (엑셀에서 한글이 깨지지 않게 BOM + CRLF).
// 나중에 이벤트용 연락처 열을 붙일 때도 이 파일의 COLUMNS 에만 추가한다.

const SOURCE_LABEL: Record<string, string> = { app: '앱', visitor_web: '관람객 웹', admin: '관리 웹' };

function statusLabel(s: AdminStoryResponse): string {
  if (s.deletedAt) return '휴지통';
  return s.hidden ? '숨김' : '공개';
}

/** ISO 시각 → 서울 'YYYY-MM-DD HH:mm' */
export function toSeoulDateTime(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 9 * 3600 * 1000).toISOString();
  return `${d.slice(0, 10)} ${d.slice(11, 16)}`;
}

const COLUMNS: { header: string; value: (s: AdminStoryResponse) => string | number }[] = [
  { header: '기록ID', value: (s) => s.storyId },
  { header: '등록일시', value: (s) => toSeoulDateTime(s.createdAt) },
  { header: '경로', value: (s) => SOURCE_LABEL[s.source] ?? s.source },
  { header: '상태', value: statusLabel },
  { header: '기록자', value: (s) => s.contributor.nickname },
  { header: '장소', value: (s) => s.place?.name ?? '' },
  { header: '축제', value: (s) => s.event?.name ?? '' },
  { header: '기억 날짜', value: (s) => s.memoryDate.pattern },
  { header: '그때 이름', value: (s) => s.placeNameThen ?? '' },
  { header: '글', value: (s) => s.content ?? '' },
  { header: '사진 수', value: (s) => s.photos.length },
  { header: '사진 주소', value: (s) => s.photos.map((p) => p.imageUrl).join(' ') },
];

// 따옴표·쉼표·줄바꿈은 따옴표로 감싸고, =,+,-,@ 로 시작하면 엑셀 수식으로 실행되지 않게 ' 를 붙인다
export function csvCell(value: string | number): string {
  let s = String(value);
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toStoriesCsv(stories: AdminStoryResponse[]): string {
  const lines = [COLUMNS.map((c) => csvCell(c.header)).join(',')];
  for (const s of stories) lines.push(COLUMNS.map((c) => csvCell(c.value(s))).join(','));
  return '﻿' + lines.join('\r\n') + '\r\n';
}
