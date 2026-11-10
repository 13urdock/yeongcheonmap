import { Module } from '@nestjs/common';
import { PhotoUrlPolicy } from './photo-url.policy';
import { StoragePresigner } from './storage-presigner';
import { StorageSettingsProvider } from './storage-settings';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, StorageSettingsProvider, StoragePresigner, PhotoUrlPolicy],
  exports: [PhotoUrlPolicy, UploadService],
})
export class UploadModule {}
