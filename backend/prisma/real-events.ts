// 실제 영천 축제 (항상 seed). 고정 ID + upsert 라 여러 번 실행해도 안전하다.
// 위치 = 축제가 열리는 곳 (좌표·주소는 2026-11-10 네이버 지역 검색 결과, 우리 GET /places/candidates 로 확인)
// 개최 정보 출처:
//  - 2026 영천공동축제 10.2~10.4 영천강변공원 (영천시 발표, 경북매일 2026-09-28)
//  - 영천보현산별빛축제 제22회 2025.10.17~19, 제23회 2026.10.9~11, 주최 영천보현산별빛축제위원회·영천시 (한국관광공사 축제 정보)

export interface RealEventSeed {
  eventId: string;
  name: string;
  content: string;
  latitude: number;
  longitude: number;
  address: string;
  hosts: { eventHostId: string; hostType: string; hostName: string }[];
  occurrences: { occurrenceId: string; year: number; startDate: string; endDate: string }[];
}

export const REAL_EVENTS: RealEventSeed[] = [
  {
    eventId: 'e1000000-0000-4000-8000-000000000001',
    name: '영천공동축제',
    content: '영천문화예술제·영천한방축제·영천와인페스타·별빛한우구이축제를 한데 모아 영천강변공원에서 여는 가을 축제',
    latitude: 35.9698234,
    longitude: 128.9374172,
    address: '경상북도 영천시 최무선로 364 (영천강변공원)',
    hosts: [{ eventHostId: 'e1100000-0000-4000-8000-000000000001', hostType: '지자체', hostName: '영천시' }],
    occurrences: [
      { occurrenceId: 'e1200000-0000-4000-8000-000000000001', year: 2026, startDate: '2026-10-02', endDate: '2026-10-04' },
    ],
  },
  {
    eventId: 'e1000000-0000-4000-8000-000000000002',
    name: '영천보현산별빛축제',
    content: '보현산천문과학관 일원에서 별 관측·천문 강연·체험으로 꾸미는 천문·우주 과학 축제',
    latitude: 36.1402493,
    longitude: 128.996701,
    address: '경상북도 영천시 화북면 별빛로 681-32 (보현산천문과학관)',
    hosts: [
      { eventHostId: 'e1100000-0000-4000-8000-000000000002', hostType: '위원회', hostName: '영천보현산별빛축제위원회' },
      { eventHostId: 'e1100000-0000-4000-8000-000000000003', hostType: '지자체', hostName: '영천시' },
    ],
    occurrences: [
      { occurrenceId: 'e1200000-0000-4000-8000-000000000002', year: 2025, startDate: '2025-10-17', endDate: '2025-10-19' },
      { occurrenceId: 'e1200000-0000-4000-8000-000000000003', year: 2026, startDate: '2026-10-09', endDate: '2026-10-11' },
    ],
  },
];
