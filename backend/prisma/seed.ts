// 개발용 시드 (ERD v5): 시드 사용자 + 샘플 장소 3곳 + 샘플 축제 2개 + 다양한 기억 날짜의 기록.
// 실행: npm run prisma:seed  (고정 ID + upsert 라 여러 번 실행해도 안전)
// 이름·좌표는 모두 가상 샘플이다. 운영 데이터는 Sys_01 절차로 등록한다.
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { createPrismaPgAdapter } from '../src/prisma/prisma-adapter.factory';
import { resolveMemoryDate } from '../src/common/memory-date/memory-date.resolver';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL 이 필요합니다 (.env)');
const prisma = new PrismaClient({ adapter: createPrismaPgAdapter(databaseUrl) });

const SEED_USER_ID = 'b0000000-0000-4000-8000-000000000001';
const PLACE = {
  cafe: 'c0000000-0000-4000-8000-000000000001',
  station: 'c0000000-0000-4000-8000-000000000002',
  market: 'c0000000-0000-4000-8000-000000000003',
};
const EVENT = {
  festival: 'e0000000-0000-4000-8000-000000000001',
  starlight: 'e0000000-0000-4000-8000-000000000002',
};

async function seedUser(): Promise<void> {
  await prisma.user.upsert({
    where: { userId: SEED_USER_ID },
    update: {},
    create: {
      userId: SEED_USER_ID,
      email: 'seed@yeongcheonmap.local',
      passwordHash: 'not-a-real-hash', // auth 모듈 구현 시 bcrypt 등으로 교체
      name: '운영자',
      profile: { create: { bio: '초기 데이터 등록용 계정' } },
    },
  });
}

async function seedPlaces(): Promise<void> {
  const places = [
    { placeId: PLACE.cafe, name: '○○카페', usageType: '카페', intro: '옛 분식집 자리에 들어선 카페', latitude: 35.9733, longitude: 128.9386, address: '경북 영천시 (샘플) 중앙로', sinceYear: 2019 },
    { placeId: PLACE.station, name: '역전 사진관', usageType: '사진관', intro: '증명사진 찍던 곳', latitude: 35.9701, longitude: 128.9352, address: '경북 영천시 (샘플) 역전길', sinceYear: 1978 },
    { placeId: PLACE.market, name: '영천 오일장 (샘플)', usageType: '시장', intro: '오래된 장터', latitude: 35.9758, longitude: 128.9411, address: '경북 영천시 (샘플) 시장길', sinceYear: 1955 },
  ];
  for (const p of places) {
    await prisma.place.upsert({ where: { placeId: p.placeId }, update: p, create: { ...p, createdBy: SEED_USER_ID } });
  }
}

async function seedEvents(): Promise<void> {
  const events = [
    { eventId: EVENT.festival, name: '영천 축제 (샘플)', content: '해마다 가을에 열리는 축제', latitude: 35.9672, longitude: 128.9443, address: '경북 영천시 (샘플) 강변' },
    { eventId: EVENT.starlight, name: '별빛 축제 (샘플)', content: '산 위에서 별을 보는 축제', latitude: 36.0, longitude: 128.98, address: '경북 영천시 (샘플) 산' },
  ];
  for (const e of events) {
    await prisma.event.upsert({ where: { eventId: e.eventId }, update: e, create: e });
  }
  const occurrenceCount = await prisma.eventOccurrence.count({ where: { eventId: EVENT.festival } });
  if (occurrenceCount === 0) {
    await prisma.eventOccurrence.createMany({
      data: [
        { eventId: EVENT.festival, year: 2015, startDate: new Date('2015-10-02'), endDate: new Date('2015-10-05') },
        { eventId: EVENT.festival, year: 2024, startDate: new Date('2024-10-04'), endDate: new Date('2024-10-06') },
      ],
    });
    await prisma.eventHost.create({ data: { eventId: EVENT.festival, hostType: '지자체', hostName: '영천시 (샘플)' } });
  }
}

// 정렬 확인용으로 일부러 다양한 기억 날짜를 섞는다 (id 끝 2자리 = 작성 순서)
const STORIES: { id: string; placeId?: string; eventId?: string; memoryDate: string; placeNameThen?: string; content: string }[] = [
  { id: '01', placeId: PLACE.cafe, memoryDate: '1995.07.15', placeNameThen: '중앙분식', content: '방학식 날 친구들이랑 떡볶이' },
  { id: '02', placeId: PLACE.cafe, memoryDate: '199X.XX.XX', placeNameThen: '중앙분식', content: '언제였는지는 모르지만 90년대, 500원 떡볶이' },
  { id: '03', placeId: PLACE.cafe, memoryDate: '1990.05.XX', placeNameThen: '중앙분식', content: '처음 문 열었을 때 개업 떡' },
  { id: '04', placeId: PLACE.cafe, memoryDate: '2021.03.XX', content: '카페로 바뀐 걸 보고 놀람' },
  { id: '05', placeId: PLACE.cafe, memoryDate: 'XXXX.XX.XX', content: '언제인지 전혀 기억 안 나는 사진' },
  { id: '06', placeId: PLACE.cafe, memoryDate: '1995.XX.XX', placeNameThen: '중앙분식', content: '1995년 어느 날' },
  { id: '07', placeId: PLACE.cafe, memoryDate: '20X5.XX.XX', placeNameThen: '분식집 문 닫은 자리', content: '2005년인가 2015년인가 비어 있던 가게' },
  { id: '11', eventId: EVENT.festival, memoryDate: '2015.10.0X', content: '축제 첫날 불꽃놀이' },
  { id: '12', eventId: EVENT.festival, memoryDate: '2024.10.05', content: '올해도 왔다' },
  { id: '13', eventId: EVENT.festival, memoryDate: '19XX.XX.XX', content: '부모님이 데려가 주셨던 축제' },
];

async function seedStories(): Promise<void> {
  for (const s of STORIES) {
    const storyId = `d0000000-0000-4000-8000-0000000000${s.id}`;
    const data = {
      ...resolveMemoryDate(s.memoryDate),
      placeId: s.placeId,
      eventId: s.eventId,
      placeNameThen: s.placeNameThen,
      content: s.content,
      userId: SEED_USER_ID,
    };
    await prisma.story.upsert({ where: { storyId }, update: data, create: { storyId, ...data } });
  }
}

async function main(): Promise<void> {
  await seedUser();
  await seedPlaces();
  await seedEvents();
  await seedStories();
  console.log('seed done');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
