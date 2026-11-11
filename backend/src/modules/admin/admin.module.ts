import { Module } from '@nestjs/common';
import { ContributorModule } from '../contributor/contributor.module';
import { PlaceModule } from '../place/place.module';
import { StoryModule } from '../story/story.module';
import { UserModule } from '../user/user.module';
import { AdminAccountController } from './admin-account.controller';
import { AdminAccountService } from './admin-account.service';
import { AdminPlaceController } from './admin-place.controller';
import { AdminPlaceRepository } from './admin-place.repository';
import { AdminPlaceService } from './admin-place.service';
import { AdminRoleGuard } from './admin-role.guard';
import { AdminStatsController } from './admin-stats.controller';
import { AdminStatsRepository } from './admin-stats.repository';
import { AdminStatsService } from './admin-stats.service';
import { AdminStoryCommandService } from './admin-story-command.service';
import { AdminStoryController } from './admin-story.controller';
import { AdminStoryQueryService } from './admin-story-query.service';
import { AdminStoryRepository } from './admin-story.repository';

// 운영진 관리 웹(/admin) 전용 API (API 명세 v4.8 §12). 모든 라우트는 @AdminOnly.
// 기록 작성·수정·휴지통은 story 모듈의 서비스를 그대로 써서 규칙을 한 곳에 둔다.
@Module({
  imports: [UserModule, ContributorModule, PlaceModule, StoryModule],
  controllers: [AdminAccountController, AdminStatsController, AdminStoryController, AdminPlaceController],
  providers: [
    AdminRoleGuard,
    AdminAccountService,
    AdminStatsService,
    AdminStatsRepository,
    AdminStoryQueryService,
    AdminStoryCommandService,
    AdminStoryRepository,
    AdminPlaceService,
    AdminPlaceRepository,
  ],
})
export class AdminModule {}
