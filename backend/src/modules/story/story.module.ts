import { Module } from '@nestjs/common';
import { EventModule } from '../event/event.module';
import { PlaceModule } from '../place/place.module';
import { StoryCreateService } from './story-create.service';
import { StoryQueryService } from './story-query.service';
import { StoryRepository } from './story.repository';
import { StoryTimelineController } from './story-timeline.controller';
import { StoryController } from './story.controller';

@Module({
  imports: [PlaceModule, EventModule],
  controllers: [StoryController, StoryTimelineController],
  providers: [StoryQueryService, StoryCreateService, StoryRepository],
})
export class StoryModule {}
