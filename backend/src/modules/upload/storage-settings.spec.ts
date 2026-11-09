import { AppErrorCode } from '../../common/errors/app-error-code';
import { FULL_STORAGE_ENV, providerFor } from './storage-settings.fixture';

describe('StorageSettingsProvider', () => {
  it('다 있으면 설정을 돌려주고 공개 주소 끝 / 를 뗀다', () => {
    expect(providerFor(FULL_STORAGE_ENV).getOrThrow().publicBaseUrl).toBe('https://yeongcheonmap.kr.ncloudstorage.com');
  });

  it.each(Object.keys(FULL_STORAGE_ENV))('%s 가 비면 STORAGE_UNAVAILABLE', (key) => {
    const env = { ...FULL_STORAGE_ENV, [key]: '  ' };
    expect(() => providerFor(env).getOrThrow()).toThrow(expect.objectContaining({ code: AppErrorCode.STORAGE_UNAVAILABLE }));
  });
});
