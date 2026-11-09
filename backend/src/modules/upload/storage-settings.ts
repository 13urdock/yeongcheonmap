import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppErrorCode } from '../../common/errors/app-error-code';
import { AppException } from '../../common/errors/app.exception';

export interface StorageSettings {
  endpoint: string;
  region: string;
  bucket: string;
  /** 끝 '/' 를 뗀 공개 주소 앞부분 */
  publicBaseUrl: string;
  accessKey: string;
  secretKey: string;
}

// 사진 저장소 환경변수(STORAGE_*)를 읽는 곳은 여기 한 곳. 하나라도 비면 "설정 없음".
@Injectable()
export class StorageSettingsProvider {
  constructor(private readonly config: ConfigService) {}

  getOrThrow(): StorageSettings {
    const s = this.read();
    if (!s) {
      throw new AppException(AppErrorCode.STORAGE_UNAVAILABLE, '사진 저장소(STORAGE_*)가 서버에 설정되지 않았습니다');
    }
    return s;
  }

  private read(): StorageSettings | null {
    const get = (key: string) => this.config.get<string>(key)?.trim() || undefined;
    const endpoint = get('STORAGE_ENDPOINT');
    const region = get('STORAGE_REGION');
    const bucket = get('STORAGE_BUCKET');
    const publicBaseUrl = get('STORAGE_PUBLIC_BASE_URL');
    const accessKey = get('STORAGE_ACCESS_KEY');
    const secretKey = get('STORAGE_SECRET_KEY');
    if (!endpoint || !region || !bucket || !publicBaseUrl || !accessKey || !secretKey) return null;
    return { endpoint, region, bucket, publicBaseUrl: publicBaseUrl.replace(/\/+$/, ''), accessKey, secretKey };
  }
}
