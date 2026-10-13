import { PrismaPg } from '@prisma/adapter-pg';

// Prisma 7 은 드라이버 어댑터로 DB에 붙는다. 어댑터 생성 규칙을 한 곳에 둔다(서비스·시드 공용).
export function createPrismaPgAdapter(databaseUrl: string): PrismaPg {
  return new PrismaPg({ connectionString: databaseUrl });
}
