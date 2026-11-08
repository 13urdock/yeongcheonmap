import { ConfigService } from '@nestjs/config';
import { AppErrorCode } from '../../common/errors/app-error-code';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { hashPassword } from './password-hasher';
import { TokenIssuer } from './token-issuer.service';

// 핵심 규칙: 로그인 실패 메시지는 하나, refresh 는 세션을 버리고(회전) 새로 발급
describe('AuthService', () => {
  const user = {
    userId: '33333333-3333-4333-8333-333333333333',
    email: 'collector@yeongcheon.kr',
    name: '수집가',
    passwordHash: '',
  };
  const tokens = { accessToken: 'a.b.c', refreshToken: 'r.r.r' };

  const userService = { findByEmail: jest.fn(), findById: jest.fn(), create: jest.fn() };
  const tokenIssuer = { issue: jest.fn(), verifyRefresh: jest.fn(), revoke: jest.fn() };
  let signupEnabled = true;
  const config = { get: jest.fn(() => signupEnabled) };
  const service = new AuthService(
    userService as unknown as UserService,
    tokenIssuer as unknown as TokenIssuer,
    config as unknown as ConfigService,
  );
  const unauthorized = expect.objectContaining({ code: AppErrorCode.UNAUTHORIZED });

  beforeAll(async () => {
    user.passwordHash = await hashPassword('correct-password');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    signupEnabled = true;
    tokenIssuer.issue.mockResolvedValue(tokens);
  });

  it('로그인 성공 시 토큰과 사용자 요약', async () => {
    userService.findByEmail.mockResolvedValue(user);
    const res = await service.login({ email: user.email, password: 'correct-password' });
    expect(res).toEqual({ ...tokens, user: { userId: user.userId, email: user.email, name: '수집가' } });
  });

  it('없는 이메일·틀린 비밀번호는 둘 다 UNAUTHORIZED', async () => {
    userService.findByEmail.mockResolvedValue(null);
    await expect(service.login({ email: 'none@x.kr', password: 'x' })).rejects.toEqual(unauthorized);
    userService.findByEmail.mockResolvedValue(user);
    await expect(service.login({ email: user.email, password: 'wrong' })).rejects.toEqual(unauthorized);
    expect(tokenIssuer.issue).not.toHaveBeenCalled();
  });

  it('가입은 비밀번호를 해시로 저장한다', async () => {
    userService.create.mockImplementation(async (data: { passwordHash: string }) => ({ ...user, ...data }));
    await service.signup({ email: user.email, password: 'new-password', name: '수집가' });
    const saved = userService.create.mock.calls[0][0] as { passwordHash: string };
    expect(saved.passwordHash).not.toContain('new-password');
    expect(saved.passwordHash.startsWith('scrypt$')).toBe(true);
  });

  it('전시 모드(SIGNUP_ENABLED=false)에서는 가입을 막는다', async () => {
    signupEnabled = false;
    await expect(service.signup({ email: 'new@x.kr', password: 'new-password', name: '관람객' })).rejects.toEqual(
      expect.objectContaining({ code: AppErrorCode.FORBIDDEN }),
    );
    expect(userService.create).not.toHaveBeenCalled();
  });

  it('refresh: 유효하면 옛 세션을 버리고 새로 발급', async () => {
    tokenIssuer.verifyRefresh.mockResolvedValue({ sub: user.userId, sid: 'old-session' });
    userService.findById.mockResolvedValue(user);
    await service.refresh('r.r.r');
    expect(tokenIssuer.revoke).toHaveBeenCalledWith('old-session');
    expect(tokenIssuer.issue).toHaveBeenCalledWith(user.userId);
  });

  it('refresh: 무효한 토큰은 UNAUTHORIZED', async () => {
    tokenIssuer.verifyRefresh.mockResolvedValue(null);
    await expect(service.refresh('bad')).rejects.toEqual(unauthorized);
    expect(tokenIssuer.revoke).not.toHaveBeenCalled();
  });
});
