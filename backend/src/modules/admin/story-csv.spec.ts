import { AdminStoryResponse } from './admin-story.mapper';
import { csvCell, toSeoulDateTime, toStoriesCsv } from './story-csv';

describe('story-csv', () => {
  it('셀: 쉼표·따옴표·줄바꿈은 감싸고, 수식 시작 글자는 무력화', () => {
    expect(csvCell('평범')).toBe('평범');
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('그는 "안녕" 했다')).toBe('"그는 ""안녕"" 했다"');
    expect(csvCell('첫 줄\n둘째 줄')).toBe('"첫 줄\n둘째 줄"');
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvCell(3)).toBe('3');
  });

  it('등록일시는 서울 시간', () => {
    expect(toSeoulDateTime('2026-11-11T05:35:00.000Z')).toBe('2026-11-11 14:35');
  });

  it('BOM + 머리줄 + 기록 한 줄', () => {
    const story = {
      storyId: 's1',
      createdAt: '2026-11-10T16:00:00.000Z',
      source: 'visitor_web',
      hidden: true,
      deletedAt: null,
      contributor: { contributorId: 'c1', nickname: '수집가' },
      place: { placeId: 'p1', name: '영천시장' },
      event: null,
      memoryDate: { pattern: '1995.XX.XX' },
      placeNameThen: null,
      content: '장날, 국밥',
      photos: [{ storyPhotoId: 'x', imageUrl: 'https://s/1.jpg' }, { storyPhotoId: 'y', imageUrl: 'https://s/2.jpg' }],
    } as unknown as AdminStoryResponse;
    const csv = toStoriesCsv([story]);
    expect(csv.startsWith('﻿기록ID,등록일시,경로,상태,기록자,장소,축제,기억 날짜,그때 이름,글,사진 수,사진 주소\r\n')).toBe(true);
    expect(csv).toContain('s1,2026-11-11 01:00,관람객 웹,숨김,수집가,영천시장,,1995.XX.XX,,"장날, 국밥",2,https://s/1.jpg https://s/2.jpg\r\n');
  });
});
