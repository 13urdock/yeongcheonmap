import { createHash, randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload } from '../../common/guards/jwt-auth.guard';
import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS } from './auth.constants';
import { SessionRepository } from './session.repository';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// refresh 토큰 payload: 어느 세션(session 행)의 토큰인지
export interface RefreshTokenPayload {
  sub: string; // userId
  sid: string; // sessionId
}

// 토큰 발급·검증 + 세션 행 관리. access 는 JWT_ACCESS_SECRET(가드와 같은 키), refresh 는 JWT_REFRESH_SECRET.
@Injectable()
export class TokenIssuer {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly sessionRepository: SessionRepository,
  ) {}

  // 새 세션을 만들고 access·refresh 한 쌍을 발급한다
  async issue(userId: string): Promise<TokenPair> {
    const sessionId = randomUUID();
    const refreshPayload: RefreshTokenPayload = { sub: userId, sid: sessionId };
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.refreshSecret(),
      expiresIn: REFRESH_TOKEN_TTL_SECONDS,
    });
    await this.sessionRepository.create({
      sessionId,
      userId,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
    });

    const accessPayload: AccessTokenPayload = { sub: userId };
    const accessToken = await this.jwtService.signAsync(accessPayload, { expiresIn: ACCESS_TOKEN_TTL_SECONDS });
    return { accessToken, refreshToken };
  }

  // 서명·만료·세션 존재·토큰 일치까지 확인. 하나라도 어긋나면 null
  async verifyRefresh(refreshToken: string): Promise<RefreshTokenPayload | null> {
    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, { secret: this.refreshSecret() });
    } catch {
      return null;
    }

    const session = await this.sessionRepository.findById(payload.sid);
    const isValid =
      session !== null &&
      session.userId === payload.sub &&
      session.refreshTokenHash === hashToken(refreshToken) &&
      session.expiresAt.getTime() > Date.now();
    return isValid ? payload : null;
  }

  // 쓴 refresh 토큰은 버린다(회전). 같은 토큰으로 두 번 갱신할 수 없다.
  revoke(sessionId: string): Promise<void> {
    return this.sessionRepository.delete(sessionId);
  }

  private refreshSecret(): string {
    return this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
  }
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
