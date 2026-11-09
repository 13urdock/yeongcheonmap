import { Injectable } from '@nestjs/common';
import { PresignFileDto } from './dto/presign-upload.dto';
import { StoragePresigner } from './storage-presigner';
import { StorageSettingsProvider } from './storage-settings';
import { buildStoryPhotoKey } from './upload-key';

export const PRESIGN_EXPIRES_SEC = 10 * 60; // 10분

export interface PresignedUpload {
  uploadUrl: string;
  method: 'PUT';
  headers: Record<string, string>;
  publicUrl: string;
  expiresAt: string;
}

// 사진 업로드용 프리사인 주소 발급. 서버는 파일을 받지 않는다(API 명세 §8).
@Injectable()
export class UploadService {
  constructor(
    private readonly settingsProvider: StorageSettingsProvider,
    private readonly presigner: StoragePresigner,
  ) {}

  async presign(files: PresignFileDto[], now: Date = new Date()): Promise<{ items: PresignedUpload[] }> {
    const settings = this.settingsProvider.getOrThrow();
    const expiresAt = new Date(now.getTime() + PRESIGN_EXPIRES_SEC * 1000).toISOString();
    const items = await Promise.all(
      files.map(async ({ contentType }) => {
        const key = buildStoryPhotoKey(contentType, now);
        const uploadUrl = await this.presigner.presignPut(settings, key, contentType, PRESIGN_EXPIRES_SEC);
        return {
          uploadUrl,
          method: 'PUT' as const,
          headers: { 'Content-Type': contentType }, // 서명에 포함된 헤더 — 앱은 그대로 보내야 한다
          publicUrl: `${settings.publicBaseUrl}/${key}`,
          expiresAt,
        };
      }),
    );
    return { items };
  }
}
