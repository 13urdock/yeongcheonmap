// 시드 (ERD v6): 운영 계정 2개(수집가·운영진, 권한 같음)와 그 기록자 + 실제 영천 축제 2개(real-events.ts). SEED_SAMPLE_DATA=true 일 때만 가상 샘플(장소 3·축제 2·기록 10)도.
// 실행: npm run prisma:seed  (고정 ID + upsert 라 여러 번 실행해도 안전)
// 샘플의 이름·좌표는 모두 가상이다. 실제 장소는 앱에서 지도 상표를 누르거나 '영천의 장소' 검색으로 기록하면 생긴다.
// 이미 들어간 샘플 지우기: npm run prisma:clear-samples
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { createPrismaPgAdapter } from '../src/prisma/prisma-adapter.factory';
import { resolveMemoryDate } from '../src/common/memory-date/memory-date.resolver';
import { hashPassword } from '../src/modules/auth/password-hasher';
import { COLLECTOR_CONTRIBUTOR_ID, COLLECTOR_USER_ID, OPERATOR_CONTRIBUTOR_ID, OPERATOR_USER_ID } from './account-ids';
import { REAL_EVENTS } from './real-events';
import { SAMPLE_EVENT_IDS, SAMPLE_PLACE_IDS } from './sample-ids';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL 이 필요합니다 (.env)');
const prisma = new PrismaClient({ adapter: createPrismaPgAdapter(databaseUrl) });

const SEED_USER_ID = COLLECTOR_USER_ID;
const PLACE = { cafe: SAMPLE_PLACE_IDS[0], station: SAMPLE_PLACE_IDS[1], market: SAMPLE_PLACE_IDS[2] };
const EVENT = { festival: SAMPLE_EVENT_IDS[0], starlight: SAMPLE_EVENT_IDS[1] };
const WITH_SAMPLES = process.env.SEED_SAMPLE_DATA === 'true';

// 운영 계정 로그인 비밀번호. .env 의 값이 있으면 그걸로 로그인할 수 있다.
// 비어 있으면 로그인 불가 값으로 둔다(운영 DB 에 아는 비밀번호가 남지 않게).
async function passwordHashFrom(password: string | undefined): Promise<string> {
  return password ? hashPassword(password) : 'login-disabled';
}

// 수집가·운영진: 이름만 다르고 권한(admin)은 같다. 각 계정의 기록자(닉네임 = 계정 이름)도 같이 만든다.
const ACCOUNTS = [
  {
    userId: COLLECTOR_USER_ID,
    contributorId: COLLECTOR_CONTRIBUTOR_ID,
    email: 'seed@yeongcheonmap.local',
    name: '수집가',
    bio: '초기 데이터 등록·관람객 기록 보관용 계정',
    passwordEnv: 'SEED_USER_PASSWORD',
  },
  {
    userId: OPERATOR_USER_ID,
    contributorId: OPERATOR_CONTRIBUTOR_ID,
    email: 'staff@yeongcheonmap.local',
    name: '운영진',
    bio: '운영진 관리용 계정',
    passwordEnv: 'OPERATOR_USER_PASSWORD',
  },
];

async function seedAccounts(): Promise<void> {
  for (const a of ACCOUNTS) {
    const passwordHash = await passwordHashFrom(process.env[a.passwordEnv]);
    await prisma.user.upsert({
      where: { userId: a.userId },
      update: { name: a.name, passwordHash, role: 'admin' },
      create: {
        userId: a.userId,
        email: a.email,
        passwordHash,
        name: a.name,
        role: 'admin',
        profile: { create: { bio: a.bio } },
      },
    });
    // migration 이 계정마다 기록자를 이미 만들었을 수 있어 userId 로 찾는다
    await prisma.contributor.upsert({
      where: { userId: a.userId },
      update: { nickname: a.name },
      create: { contributorId: a.contributorId, nickname: a.name, userId: a.userId },
    });
  }
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

// 실제 축제: 축제·주최·회차를 고정 ID 로 upsert (내용을 고쳐 다시 돌리면 그대로 반영)
async function seedRealEvents(): Promise<void> {
  for (const { hosts, occurrences, ...event } of REAL_EVENTS) {
    await prisma.event.upsert({ where: { eventId: event.eventId }, update: event, create: event });
    for (const h of hosts) {
      const data = { eventId: event.eventId, hostType: h.hostType, hostName: h.hostName };
      await prisma.eventHost.upsert({ where: { eventHostId: h.eventHostId }, update: data, create: { ...data, eventHostId: h.eventHostId } });
    }
    for (const o of occurrences) {
      const data = { eventId: event.eventId, year: o.year, startDate: new Date(o.startDate), endDate: new Date(o.endDate) };
      await prisma.eventOccurrence.upsert({
        where: { occurrenceId: o.occurrenceId },
        update: data,
        create: { ...data, occurrenceId: o.occurrenceId },
      });
    }
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
      contributorId: COLLECTOR_CONTRIBUTOR_ID,
    };
    await prisma.story.upsert({ where: { storyId }, update: data, create: { storyId, ...data } });
  }
}

async function main(): Promise<void> {
  await seedAccounts();
  await seedRealEvents();
  if (WITH_SAMPLES) {
    await seedPlaces();
    await seedEvents();
    await seedStories();
  }
  console.log(WITH_SAMPLES ? 'seed done (운영 계정 2개·실제 축제 + 가상 샘플)' : 'seed done (운영 계정 2개 + 실제 축제 2개)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
