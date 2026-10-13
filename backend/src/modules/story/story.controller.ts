import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, CurrentUserInfo } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateStoryDto } from './dto/create-story.dto';
import { StoryCreateService } from './story-create.service';
import { StoryQueryService } from './story-query.service';

// /stories 라우팅만. (PATCH/DELETE 는 다음 단계)
@Controller('stories')
export class StoryController {
  constructor(
    private readonly storyQueryService: StoryQueryService,
    private readonly storyCreateService: StoryCreateService,
  ) {}

  // GET /stories/:storyId
  @Get(':storyId')
  getStory(@Param('storyId', ParseUUIDPipe) storyId: string) {
    return this.storyQueryService.getStory(storyId);
  }

  // POST /stories (인증)
  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateStoryDto, @CurrentUser() user: CurrentUserInfo) {
    return this.storyCreateService.create(dto, user.userId);
  }
}
