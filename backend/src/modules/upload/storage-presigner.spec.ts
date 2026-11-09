import { StoragePresigner } from './storage-presigner';

// 네트워크 없이 SDK 로 실제 서명 주소를 만들어 형태만 확인 (실제 업로드는 PC 에서 별도 확인)
describe('StoragePresigner.presignPut', () => {
  it('버킷 가상호스트 주소 + 서명 파라미터, Content-Type 이 서명 헤더에 포함', async () => {
    const url = new URL(
      await new StoragePresigner().presignPut(
        {
          endpoint: 'https://kr.ncloudstorage.com',
          region: 'kr',
          bucket: 'yeongcheonmap',
          publicBaseUrl: 'https://yeongcheonmap.kr.ncloudstorage.com',
          accessKey: 'ak',
          secretKey: 'sk',
        },
        'stories/2026-11/a.jpg',
        'image/jpeg',
        600,
      ),
    );
    expect(url.host).toBe('yeongcheonmap.kr.ncloudstorage.com');
    expect(url.pathname).toBe('/stories/2026-11/a.jpg');
    expect(url.searchParams.get('X-Amz-Expires')).toBe('600');
    expect(url.searchParams.get('X-Amz-Credential')).toContain('/kr/s3/aws4_request');
    expect(url.searchParams.get('X-Amz-SignedHeaders')).toContain('content-type');
  });
});
