import { Module } from '@nestjs/common';
import { EventModule } from '../event/event.module';
import { PlaceModule } from '../place/place.module';
import { UploadModule } from '../upload/upload.module';
import { StoryCreateService } from './story-create.service';
import { StoryDeleteService } from './story-delete.service';
import { StoryQueryService } from './story-query.service';
import { StoryUpdateService } from './story-update.service';
import { StoryRepository } from './story.repository';
import { StoryTimelineController } from './story-timeline.controller';
import { StoryController } from './story.controller';

@Module({
  imports: [PlaceModule, EventModule, UploadModule],
  controllers: [StoryController, StoryTimelineController],
  providers: [StoryQueryService, StoryCreateService, StoryUpdateService, StoryDeleteService, StoryRepository],
  exports: [StoryCreateService],
})
export class StoryModule {}
