import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { AppErrorCode } from '../../common/errors/app-error-code';
import { AppException } from '../../common/errors/app.exception';
import { AuthenticatedRequest } from '../../common/guards/jwt-auth.guard';
import { VisitorRateLimiter } from './visitor-rate-limiter';
import { VISITOR_CODE_HEADER, VISITOR_STORY_USER_ID } from './visitor.constants';

// 관람객 쓰기(/visitor/*) 입구: 로그인 대신 전시장 QR 의 쓰기 코드를 확인한다.
// 통과하면 request.user 를 시드 수집가로 채워, 이후 서비스는 앱 쓰기와 똑같이 동작한다.
@Injectable()
export class VisitorCodeGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly rateLimiter: VisitorRateLimiter,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    // .env 를 윈도우에서 편집하면 \r 이, 복사하다 보면 공백이 붙을 수 있어 앞뒤 공백·줄바꿈은 무시한다
    const expected = this.config.get<string>('VISITOR_WRITE_CODE')?.trim();
    if (!expected) {
      throw new AppException(AppErrorCode.FORBIDDEN, '지금은 관람객 기록을 받지 않아요');
    }
    if (!this.matches(req.header(VISITOR_CODE_HEADER), expected)) {
      throw new AppException(AppErrorCode.UNAUTHORIZED, '전시장 QR 코드로 다시 들어와 주세요');
    }
    if (!this.rateLimiter.tryConsume(req.ip ?? 'unknown')) {
      throw new AppException(AppErrorCode.TOO_MANY_REQUESTS, '잠시 후 다시 시도해 주세요');
    }
    req.user = { userId: VISITOR_STORY_USER_ID };
    return true;
  }

  private matches(given: string | undefined, expected: string): boolean {
    if (!given) return false;
    const a = Buffer.from(given.trim());
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  }
}
