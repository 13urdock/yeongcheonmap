import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageSettings } from './storage-settings';

// S3 호환 저장소(Ncloud Storage)에 PUT 프리사인 주소를 만드는 일만. SDK 는 이 파일에서만 쓴다.
@Injectable()
export class StoragePresigner {
  private client: S3Client | null = null;
  private clientKey = '';

  async presignPut(settings: StorageSettings, key: string, contentType: string, expiresInSec: number): Promise<string> {
    const command = new PutObjectCommand({ Bucket: settings.bucket, Key: key, ContentType: contentType });
    // content-type 을 서명에 넣는다 → 앱이 다른 형식으로 올리면 저장소가 거절(403). SDK 기본은 host 만 서명한다.
    return getSignedUrl(this.getClient(settings), command, {
      expiresIn: expiresInSec,
      signableHeaders: new Set(['content-type']),
    });
  }

  private getClient(s: StorageSettings): S3Client {
    const cacheKey = `${s.endpoint}|${s.region}|${s.accessKey}`;
    if (!this.client || this.clientKey !== cacheKey) {
      this.client = new S3Client({
        region: s.region,
        endpoint: s.endpoint,
        credentials: { accessKeyId: s.accessKey, secretAccessKey: s.secretKey },
        // 최신 SDK 기본 체크섬 파라미터는 S3 호환 저장소에서 거부될 수 있어 꺼 둔다 (2026-11-10 시험으로 확인한 설정)
        requestChecksumCalculation: 'WHEN_REQUIRED',
        responseChecksumValidation: 'WHEN_REQUIRED',
      });
      this.clientKey = cacheKey;
    }
    return this.client;
  }
}
