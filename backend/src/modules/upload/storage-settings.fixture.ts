import { ConfigService } from '@nestjs/config';
import { StorageSettingsProvider } from './storage-settings';

// 테스트 전용: 저장소 환경변수 묶음과 그걸 읽는 provider
export const FULL_STORAGE_ENV: Record<string, string> = {
  STORAGE_ENDPOINT: 'https://kr.ncloudstorage.com',
  STORAGE_REGION: 'kr',
  STORAGE_BUCKET: 'yeongcheonmap',
  STORAGE_PUBLIC_BASE_URL: 'https://yeongcheonmap.kr.ncloudstorage.com/',
  STORAGE_ACCESS_KEY: 'ak',
  STORAGE_SECRET_KEY: 'sk',
};

export const providerFor = (env: Record<string, string>) =>
  new StorageSettingsProvider({ get: (k: string) => env[k] } as unknown as ConfigService);
