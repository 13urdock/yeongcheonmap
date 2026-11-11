import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, CurrentUserInfo } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { StoryCreateService } from './story-create.service';
import { StoryDeleteService } from './story-delete.service';
import { StoryQueryService } from './story-query.service';
import { StoryUpdateService } from './story-update.service';
import { StorySource } from './story-source';

// /stories 라우팅만
@Controller('stories')
export class StoryController {
  constructor(
    private readonly storyQueryService: StoryQueryService,
    private readonly storyCreateService: StoryCreateService,
    private readonly storyUpdateService: StoryUpdateService,
    private readonly storyDeleteService: StoryDeleteService,
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
    return this.storyCreateService.create(dto, { userId: user.userId, source: StorySource.APP });
  }

  // PATCH /stories/:storyId (인증, 본인 또는 운영진)
  @Patch(':storyId')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('storyId', ParseUUIDPipe) storyId: string,
    @Body() dto: UpdateStoryDto,
    @CurrentUser() user: CurrentUserInfo,
  ) {
    return this.storyUpdateService.update(storyId, dto, user.userId);
  }

  // DELETE /stories/:storyId (인증, 본인 또는 운영진) → 휴지통으로, 200 { storyId }
  @Delete(':storyId')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('storyId', ParseUUIDPipe) storyId: string, @CurrentUser() user: CurrentUserInfo) {
    await this.storyDeleteService.delete(storyId, user.userId);
    return { storyId };
  }
}
