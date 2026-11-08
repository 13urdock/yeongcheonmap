import { ConfigService } from '@nestjs/config';
import { AppErrorCode } from '../../../common/errors/app-error-code';
import { NaverLocalClient } from './naver-local.client';

// NAVER API HUB 호출 형태: 주소·헤더 이름 (개발자센터에서 이관하며 바뀐 부분)
describe('NaverLocalClient', () => {
  const keys: Record<string, string> = { NAVER_SEARCH_CLIENT_ID: 'id', NAVER_SEARCH_CLIENT_SECRET: 'secret' };
  const config = { get: jest.fn((k: string) => keys[k]) } as unknown as ConfigService;
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('API HUB 주소와 X-NCP-APIGW 헤더로 부른다', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [{ title: '<b>영천</b>시장', address: '경상북도 영천시 완산동', roadAddress: '', mapx: '1289386000', mapy: '359733000' }],
      }),
    });
    const res = await new NaverLocalClient(config).search('영천 시장');

    const [url, init] = fetchMock.mock.calls[0] as [string, { headers: Record<string, string> }];
    expect(url.startsWith('https://naverapihub.apigw.ntruss.com/search/v1/local?')).toBe(true);
    expect(new URL(url).searchParams.get('query')).toBe('영천 시장');
    expect(new URL(url).searchParams.get('display')).toBe('5');
    expect(init.headers).toEqual({ 'X-NCP-APIGW-API-KEY-ID': 'id', 'X-NCP-APIGW-API-KEY': 'secret' });
    expect(res[0]).toMatchObject({ name: '영천시장', latitude: 35.9733, longitude: 128.9386 });
  });

  it('실패 상태코드는 PLACE_SEARCH_UNAVAILABLE 로 (메시지에 상태코드)', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401, text: async () => '{"error":"unauthorized"}' });
    await expect(new NaverLocalClient(config).search('카페')).rejects.toMatchObject({
      code: AppErrorCode.PLACE_SEARCH_UNAVAILABLE,
      message: expect.stringContaining('401'),
    });
  });
});
