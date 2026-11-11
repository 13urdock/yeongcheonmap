import { Injectable } from '@nestjs/common';
import { Contributor } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

// contributor 테이블 조회·생성 쿼리만
@Injectable()
export class ContributorRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string): Promise<Contributor | null> {
    return this.prisma.contributor.findUnique({ where: { userId } });
  }

  findById(contributorId: string): Promise<Contributor | null> {
    return this.prisma.contributor.findUnique({ where: { contributorId } });
  }

  // 같은 계정으로 동시에 만들려 해도 하나만 남게 upsert (user_id 유일)
  upsertForUser(userId: string, nickname: string): Promise<Contributor> {
    return this.prisma.contributor.upsert({ where: { userId }, update: {}, create: { userId, nickname } });
  }
}
