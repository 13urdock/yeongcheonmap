import { hashPassword, verifyPassword } from './password-hasher';

describe('password-hasher', () => {
  it('같은 비밀번호는 통과, 다른 비밀번호는 거절', async () => {
    const stored = await hashPassword('yeongcheon-1995');
    expect(stored.startsWith('scrypt$')).toBe(true);
    await expect(verifyPassword('yeongcheon-1995', stored)).resolves.toBe(true);
    await expect(verifyPassword('yeongcheon-1996', stored)).resolves.toBe(false);
  });

  it('같은 비밀번호도 매번 다른 해시(솔트)', async () => {
    expect(await hashPassword('same-password')).not.toBe(await hashPassword('same-password'));
  });

  it('형식이 다른 저장값(시드의 로그인 불가 값 등)은 항상 거절', async () => {
    await expect(verifyPassword('anything', 'login-disabled')).resolves.toBe(false);
    await expect(verifyPassword('anything', 'not-a-real-hash')).resolves.toBe(false);
    await expect(verifyPassword('anything', 'scrypt$abc$short')).resolves.toBe(false);
  });
});
