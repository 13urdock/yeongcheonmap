// 가상 샘플(sample-ids.ts) 지우기: 샘플 장소·축제와 거기 붙은 기록(사진 포함)·회차·주최 정보.
// 실행: npm run prisma:clear-samples          → 지울 개수만 보여준다 (아무것도 안 지움)
//       npm run prisma:clear-samples -- --yes → 실제로 지운다 (한 트랜잭션)
// 주의: 샘플 장소·축제에 남긴 기록은 누가 썼든 함께 지워진다.
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { createPrismaPgAdapter } from '../src/prisma/prisma-adapter.factory';
import { SAMPLE_EVENT_IDS, SAMPLE_PLACE_IDS } from './sample-ids';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL 이 필요합니다 (.env)');
const prisma = new PrismaClient({ adapter: createPrismaPgAdapter(databaseUrl) });
const confirmed = process.argv.includes('--yes');

const storyWhere = { OR: [{ placeId: { in: SAMPLE_PLACE_IDS } }, { eventId: { in: SAMPLE_EVENT_IDS } }] };
const eventPlaceWhere = {
  OR: [{ placeId: { in: SAMPLE_PLACE_IDS } }, { occurrence: { eventId: { in: SAMPLE_EVENT_IDS } } }],
};

async function countTargets() {
  const [places, events, stories] = await Promise.all([
    prisma.place.count({ where: { placeId: { in: SAMPLE_PLACE_IDS } } }),
    prisma.event.count({ where: { eventId: { in: SAMPLE_EVENT_IDS } } }),
    prisma.story.count({ where: storyWhere }),
  ]);
  return { places, events, stories };
}

async function deleteTargets(): Promise<void> {
  await prisma.$transaction([
    prisma.story.deleteMany({ where: storyWhere }), // story_photo 는 cascade
    prisma.eventPlace.deleteMany({ where: eventPlaceWhere }),
    prisma.eventOccurrence.deleteMany({ where: { eventId: { in: SAMPLE_EVENT_IDS } } }),
    prisma.eventHost.deleteMany({ where: { eventId: { in: SAMPLE_EVENT_IDS } } }),
    prisma.eventPhoto.deleteMany({ where: { eventId: { in: SAMPLE_EVENT_IDS } } }),
    prisma.place.deleteMany({ where: { placeId: { in: SAMPLE_PLACE_IDS } } }),
    prisma.event.deleteMany({ where: { eventId: { in: SAMPLE_EVENT_IDS } } }),
  ]);
}

async function main(): Promise<void> {
  const counts = await countTargets();
  console.log(`가상 샘플: 장소 ${counts.places} · 축제 ${counts.events} · 기록 ${counts.stories}`);
  if (!confirmed) {
    console.log('지우려면: npm run prisma:clear-samples -- --yes');
    return;
  }
  await deleteTargets();
  console.log('지웠습니다.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
