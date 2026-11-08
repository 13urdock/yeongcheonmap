import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

// 비밀번호 해시·검증 (Node 내장 scrypt, 외부 의존 없음).
// 저장 형식: "scrypt$<saltBase64>$<hashBase64>" — user.password_hash(≤255) 에 들어간다.
const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;
const PREFIX = 'scrypt';
const SALT_BYTES = 16;
const KEY_BYTES = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const hash = await scryptAsync(password, salt, KEY_BYTES);
  return [PREFIX, salt.toString('base64'), hash.toString('base64')].join('$');
}

// 형식이 다른 값(예: 시드의 'not-a-real-hash')은 항상 false
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [prefix, saltB64, hashB64] = stored.split('$');
  if (prefix !== PREFIX || !saltB64 || !hashB64) return false;

  const expected = Buffer.from(hashB64, 'base64');
  if (expected.length !== KEY_BYTES) return false;
  const actual = await scryptAsync(password, Buffer.from(saltB64, 'base64'), KEY_BYTES);
  return timingSafeEqual(actual, expected);
}
