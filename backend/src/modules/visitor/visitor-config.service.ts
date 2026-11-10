import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface VisitorConfigResponse {
  /** 관람객 웹 지도용 NCP Maps Client ID. 없으면 웹은 지도 없이 검색으로만 장소를 고른다 */
  naverMapClientId: string | null;
  /** 관람객 쓰기가 켜져 있는지 (코드가 맞는지는 알려주지 않는다) */
  writable: boolean;
}

// 관람객 웹이 시작할 때 읽는 공개 설정
@Injectable()
export class VisitorConfigService {
  constructor(private readonly config: ConfigService) {}

  get(): VisitorConfigResponse {
    return {
      naverMapClientId: this.config.get<string>('NAVER_MAP_CLIENT_ID') || null,
      writable: Boolean(this.config.get<string>('VISITOR_WRITE_CODE')),
    };
  }
}
