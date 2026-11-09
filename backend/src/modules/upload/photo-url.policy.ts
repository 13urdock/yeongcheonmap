import { Injectable } from '@nestjs/common';
import { AppErrorCode } from '../../common/errors/app-error-code';
import { AppException } from '../../common/errors/app.exception';
import { StorageSettingsProvider } from './storage-settings';
import { STORY_PHOTO_PREFIX } from './upload-key';

// 스토리 photoUrls 는 우리 저장소의 공개 주소({STORAGE_PUBLIC_BASE_URL}/stories/...)만 허용 (API 명세 §8).
@Injectable()
export class PhotoUrlPolicy {
  constructor(private readonly settingsProvider: StorageSettingsProvider) {}

  assertOwnPhotoUrls(urls: string[]): void {
    if (urls.length === 0) return; // 사진 없는 기록은 저장소 설정과 무관
    const prefix = `${this.settingsProvider.getOrThrow().publicBaseUrl}/${STORY_PHOTO_PREFIX}`;
    const foreign = urls.find((url) => !url.startsWith(prefix) || url.length === prefix.length);
    if (foreign) {
      throw new AppException(AppErrorCode.INVALID_PARAMETER, '사진은 앱에서 올린 주소만 쓸 수 있습니다');
    }
  }
}
