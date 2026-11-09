import { AppErrorCode } from '../../common/errors/app-error-code';
import { PhotoUrlPolicy } from './photo-url.policy';
import { FULL_STORAGE_ENV, providerFor } from './storage-settings.fixture';

describe('PhotoUrlPolicy.assertOwnPhotoUrls', () => {
  const policy = new PhotoUrlPolicy(providerFor(FULL_STORAGE_ENV));
  const base = 'https://yeongcheonmap.kr.ncloudstorage.com';
  const invalid = expect.objectContaining({ code: AppErrorCode.INVALID_PARAMETER });

  it('우리 저장소 stories/ 주소는 통과', () => {
    expect(() => policy.assertOwnPhotoUrls([`${base}/stories/2026-11/a.jpg`, `${base}/stories/2026-11/b.png`])).not.toThrow();
  });

  it.each([
    'https://evil.example/stories/2026-11/a.jpg',
    `${base}/test/a.jpg`,
    `${base}/stories/`,
    `${base}.evil.example/stories/a.jpg`,
    `http://yeongcheonmap.kr.ncloudstorage.com/stories/a.jpg`,
  ])('거절: %s', (url) => {
    expect(() => policy.assertOwnPhotoUrls([`${base}/stories/ok.jpg`, url])).toThrow(invalid);
  });

  it('사진이 없으면 저장소 설정이 없어도 통과', () => {
    expect(() => new PhotoUrlPolicy(providerFor({})).assertOwnPhotoUrls([])).not.toThrow();
  });

  it('사진이 있는데 저장소 설정이 없으면 STORAGE_UNAVAILABLE', () => {
    expect(() => new PhotoUrlPolicy(providerFor({})).assertOwnPhotoUrls([`${base}/stories/a.jpg`])).toThrow(
      expect.objectContaining({ code: AppErrorCode.STORAGE_UNAVAILABLE }),
    );
  });
});
