import { Module } from '@nestjs/common';
import { PlaceModule } from '../place/place.module';
import { StoryModule } from '../story/story.module';
import { UploadModule } from '../upload/upload.module';
import { VisitorCodeGuard } from './visitor-code.guard';
import { VisitorConfigService } from './visitor-config.service';
import { VisitorRateLimiter } from './visitor-rate-limiter';
import { VisitorController } from './visitor.controller';

@Module({
  imports: [PlaceModule, UploadModule, StoryModule],
  controllers: [VisitorController],
  providers: [
    VisitorConfigService,
    VisitorCodeGuard,
    { provide: VisitorRateLimiter, useFactory: () => new VisitorRateLimiter() },
  ],
})
export class VisitorModule {}
