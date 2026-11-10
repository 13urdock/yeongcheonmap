import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppErrorCode } from '../../common/errors/app-error-code';
import { VisitorCodeGuard } from './visitor-code.guard';
import { VisitorRateLimiter } from './visitor-rate-limiter';
import { VISITOR_STORY_USER_ID } from './visitor.constants';

describe('VisitorCodeGuard', () => {
  const contextFor = (code: string | undefined, ip = '1.2.3.4') => {
    const req = { ip, user: undefined as unknown, header: (name: string) => (name === 'x-visitor-code' ? code : undefined) };
    const ctx = { switchToHttp: () => ({ getRequest: () => req }) } as unknown as ExecutionContext;
    return { req, ctx };
  };
  const guardWith = (writeCode: string | undefined, limiter = new VisitorRateLimiter(100, 60_000)) =>
    new VisitorCodeGuard({ get: () => writeCode } as unknown as ConfigService, limiter);
  const code = (c: string) => expect.objectContaining({ code: c });

  it('코드가 서버에 없으면 관람객 쓰기는 꺼짐(FORBIDDEN)', () => {
    expect(() => guardWith(undefined).canActivate(contextFor('anything').ctx)).toThrow(
      expect.objectContaining({ code: AppErrorCode.FORBIDDEN }),
    );
  });

  it('코드가 없거나 틀리면 UNAUTHORIZED', () => {
    const guard = guardWith('secret-code');
    expect(() => guard.canActivate(contextFor(undefined).ctx)).toThrow(code(AppErrorCode.UNAUTHORIZED));
    expect(() => guard.canActivate(contextFor('secret-cod').ctx)).toThrow(code(AppErrorCode.UNAUTHORIZED));
  });

  it('서버 값 앞뒤의 줄바꿈·공백은 무시한다 (.env 를 윈도우에서 편집한 경우)', () => {
    expect(guardWith('secret-code\r\n').canActivate(contextFor(' secret-code').ctx)).toBe(true);
  });

  it('맞으면 작성자를 수집가로 채운다', () => {
    const { req, ctx } = contextFor('secret-code');
    expect(guardWith('secret-code').canActivate(ctx)).toBe(true);
    expect(req.user).toEqual({ userId: VISITOR_STORY_USER_ID });
  });

  it('같은 IP 가 한도를 넘으면 TOO_MANY_REQUESTS', () => {
    const guard = guardWith('secret-code', new VisitorRateLimiter(2, 60_000));
    guard.canActivate(contextFor('secret-code').ctx);
    guard.canActivate(contextFor('secret-code').ctx);
    expect(() => guard.canActivate(contextFor('secret-code').ctx)).toThrow(code(AppErrorCode.TOO_MANY_REQUESTS));
    expect(guard.canActivate(contextFor('secret-code', '5.6.7.8').ctx)).toBe(true);
  });
});

describe('VisitorRateLimiter', () => {
  it('창이 지나면 다시 센다', () => {
    const limiter = new VisitorRateLimiter(1, 1000);
    expect(limiter.tryConsume('a', 0)).toBe(true);
    expect(limiter.tryConsume('a', 500)).toBe(false);
    expect(limiter.tryConsume('a', 1000)).toBe(true);
  });
});
