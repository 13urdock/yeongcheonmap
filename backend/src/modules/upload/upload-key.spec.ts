import { buildStoryPhotoKey } from './upload-key';

describe('buildStoryPhotoKey', () => {
  const uuid = '9f1c0000-0000-4000-8000-0000000000e2';

  it('stories/{YYYY-MM}/{uuid}.{ext}', () => {
    expect(buildStoryPhotoKey('image/jpeg', new Date('2026-11-10T03:00:00Z'), uuid)).toBe(`stories/2026-11/${uuid}.jpg`);
    expect(buildStoryPhotoKey('image/png', new Date('2026-11-10T03:00:00Z'), uuid)).toBe(`stories/2026-11/${uuid}.png`);
    expect(buildStoryPhotoKey('image/webp', new Date('2026-11-10T03:00:00Z'), uuid)).toBe(`stories/2026-11/${uuid}.webp`);
  });

  it('월은 한국 시간 기준 (UTC 10/31 16시 = KST 11/1 01시)', () => {
    expect(buildStoryPhotoKey('image/jpeg', new Date('2026-10-31T16:00:00Z'), uuid)).toBe(`stories/2026-11/${uuid}.jpg`);
  });

  it('uuid 를 안 주면 매번 다른 키', () => {
    expect(buildStoryPhotoKey('image/jpeg')).not.toBe(buildStoryPhotoKey('image/jpeg'));
  });
});
