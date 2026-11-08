import { Injectable } from '@nestjs/common';
import { Session } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateSessionData {
  sessionId: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
}

// session 테이블(refresh 토큰 보관) 쿼리만
@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateSessionData): Promise<Session> {
    return this.prisma.session.create({ data });
  }

  findById(sessionId: string): Promise<Session | null> {
    return this.prisma.session.findUnique({ where: { sessionId } });
  }

  // 이미 지워졌어도 오류 없이 넘어간다 (동시 갱신 대비)
  async delete(sessionId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { sessionId } });
  }
}
