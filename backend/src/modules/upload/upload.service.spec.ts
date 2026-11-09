import { AppErrorCode } from '../../common/errors/app-error-code';
import { StoragePresigner } from './storage-presigner';
import { FULL_STORAGE_ENV, providerFor } from './storage-settings.fixture';
import { PRESIGN_EXPIRES_SEC, UploadService } from './upload.service';

describe('UploadService.presign', () => {
  const now = new Date('2026-11-10T01:20:00.000Z');
  const base = 'https://yeongcheonmap.kr.ncloudstorage.com';

  it('요청 순서대로 items, 공개 주소·헤더·만료시각을 명세대로', async () => {
    const presigner = { presignPut: jest.fn(async (_s, key: string) => `https://signed/${key}?sig=1`) };
    const service = new UploadService(providerFor(FULL_STORAGE_ENV), presigner as unknown as StoragePresigner);

    const { items } = await service.presign(
      [
        { contentType: 'image/jpeg', size: 100 },
        { contentType: 'image/webp', size: 200 },
      ],
      now,
    );

    expect(items).toHaveLength(2);
    expect(items[0].publicUrl).toMatch(new RegExp(`^${base}/stories/2026-11/[0-9a-f-]{36}\\.jpg$`));
    expect(items[1].publicUrl).toMatch(/\.webp$/);
    expect(items[0]).toEqual(
      expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        expiresAt: '2026-11-10T01:30:00.000Z',
      }),
    );
    // 업로드 주소와 공개 주소는 같은 키
    const key0 = items[0].publicUrl.slice(base.length + 1);
    expect(items[0].uploadUrl).toBe(`https://signed/${key0}?sig=1`);
    expect(presigner.presignPut).toHaveBeenCalledWith(
      expect.objectContaining({ bucket: 'yeongcheonmap', region: 'kr' }),
      key0,
      'image/jpeg',
      PRESIGN_EXPIRES_SEC,
    );
  });

  it('저장소 설정이 없으면 STORAGE_UNAVAILABLE, 서명하지 않는다', async () => {
    const presigner = { presignPut: jest.fn() };
    const service = new UploadService(providerFor({}), presigner as unknown as StoragePresigner);
    await expect(service.presign([{ contentType: 'image/jpeg', size: 1 }], now)).rejects.toEqual(
      expect.objectContaining({ code: AppErrorCode.STORAGE_UNAVAILABLE }),
    );
    expect(presigner.presignPut).not.toHaveBeenCalled();
  });
});
