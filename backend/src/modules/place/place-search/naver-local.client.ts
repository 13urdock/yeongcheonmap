import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppErrorCode } from '../../../common/errors/app-error-code';
import { AppException } from '../../../common/errors/app.exception';
import { ExternalPlace, NaverLocalItem, parseNaverLocalItem } from './naver-local.parser';

// 네이버 검색 "지역" 호출 (HTTP + 파싱만). 외부 장소 검색은 이 파일 한 곳에서만 부른다.
// NAVER API HUB(네이버 클라우드, 2026-11 개발자센터에서 이관):
//   GET https://naverapihub.apigw.ntruss.com/search/v1/local — 헤더 X-NCP-APIGW-API-KEY-ID / X-NCP-APIGW-API-KEY
//   키 = NCP 콘솔 > NAVER API HUB > Application Management > [인증 정보] 의 Client ID / Client Secret
//   (예전 개발자센터 키·주소 openapi.naver.com 은 쓸 수 없다)
// 한 번에 최대 5건, 위치(좌표·지역) 범위 지정 파라미터가 없다 → 지역 한정은 호출하는 쪽(검색어·주소)에서.

const LOCAL_URL = 'https://naverapihub.apigw.ntruss.com/search/v1/local';
const MAX_DISPLAY = 5;
const TIMEOUT_MS = 4000;

@Injectable()
export class NaverLocalClient {
  private readonly logger = new Logger(NaverLocalClient.name);

  constructor(private readonly config: ConfigService) {}

  async search(query: string): Promise<ExternalPlace[]> {
    const clientId = this.config.get<string>('NAVER_SEARCH_CLIENT_ID');
    const clientSecret = this.config.get<string>('NAVER_SEARCH_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      throw new AppException(
        AppErrorCode.PLACE_SEARCH_UNAVAILABLE,
        '장소 검색 키(NAVER_SEARCH_CLIENT_ID / NAVER_SEARCH_CLIENT_SECRET)가 설정되지 않았습니다',
      );
    }

    const params = new URLSearchParams({
      query,
      display: String(MAX_DISPLAY),
      start: '1',
      sort: 'random',
      format: 'json',
    });
    const response = await this.request(`${LOCAL_URL}?${params.toString()}`, clientId, clientSecret);
    if (!response.ok) {
      // API HUB 는 API Gateway 기반이라 실패 응답 형식이 검색 API(SE01 등)와 게이트웨이(인증·한도)로 다를 수 있다 → 본문을 그대로 남긴다
      const detail = (await response.text().catch(() => '')).slice(0, 300);
      this.logger.warn(`네이버 지역 검색 실패: HTTP ${response.status} ${detail}`);
      throw new AppException(AppErrorCode.PLACE_SEARCH_UNAVAILABLE, `장소 검색 실패 (네이버 HTTP ${response.status})`);
    }
    const body = (await response.json()) as { items?: NaverLocalItem[] };
    return (body.items ?? []).map(parseNaverLocalItem).filter((p): p is ExternalPlace => p !== null);
  }

  private async request(url: string, clientId: string, clientSecret: string): Promise<Response> {
    try {
      return await fetch(url, {
        headers: { 'X-NCP-APIGW-API-KEY-ID': clientId, 'X-NCP-APIGW-API-KEY': clientSecret },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (e) {
      this.logger.warn(`네이버 지역 검색 연결 실패: ${(e as Error).message}`);
      throw new AppException(AppErrorCode.PLACE_SEARCH_UNAVAILABLE, '장소 검색 서버(네이버)에 연결할 수 없습니다');
    }
  }
}
