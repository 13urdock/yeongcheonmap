import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { CurrentUser, CurrentUserInfo } from '../../common/decorators/current-user.decorator';
import { CreateStoryDto } from '../story/dto/create-story.dto';
import { UpdateStoryDto } from '../story/dto/update-story.dto';
import { AdminOnly } from './admin-only.decorator';
import { AdminStoryCommandService } from './admin-story-command.service';
import { AdminStoryQueryService } from './admin-story-query.service';
import { QueryAdminStoriesDto } from './dto/query-admin-stories.dto';
import { SetStoryHiddenDto } from './dto/set-story-hidden.dto';

// /admin/stories 라우팅만 (API 명세 v4.8 §12)
@Controller('admin/stories')
@AdminOnly()
export class AdminStoryController {
  constructor(
    private readonly queryService: AdminStoryQueryService,
    private readonly commandService: AdminStoryCommandService,
  ) {}

  // GET /admin/stories?placeId=&eventId=&contributorId=&q=&source=&status=&sort=&from=&to=&page=&size=
  @Get()
  list(@Query() query: QueryAdminStoriesDto) {
    return this.queryService.list(query);
  }

  // GET /admin/stories/export (같은 필터, 페이지 무시) → text/csv. envelope 없이 파일로 보낸다
  @Get('export')
  async export(@Query() query: QueryAdminStoriesDto, @Res() res: Response): Promise<void> {
    const csv = await this.queryService.exportCsv(query);
    const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10).replace(/-/g, '');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="yeongcheon-stories-${today}.csv"`);
    res.send(csv);
  }

  // GET /admin/stories/:storyId (숨김·휴지통 포함)
  @Get(':storyId')
  get(@Param('storyId', ParseUUIDPipe) storyId: string) {
    return this.queryService.get(storyId);
  }

  // POST /admin/stories — 기록자 = 로그인한 운영 계정, 경로 admin
  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateStoryDto, @CurrentUser() user: CurrentUserInfo) {
    return this.commandService.create(dto, user.userId);
  }

  // PATCH /admin/stories/:storyId — PATCH /stories/:id 와 같은 규칙, 누구의 기록이든
  @Patch(':storyId')
  update(@Param('storyId', ParseUUIDPipe) storyId: string, @Body() dto: UpdateStoryDto, @CurrentUser() user: CurrentUserInfo) {
    return this.commandService.update(storyId, dto, user.userId);
  }

  // PATCH /admin/stories/:storyId/visibility { hidden }
  @Patch(':storyId/visibility')
  setHidden(@Param('storyId', ParseUUIDPipe) storyId: string, @Body() dto: SetStoryHiddenDto) {
    return this.commandService.setHidden(storyId, dto.hidden);
  }

  // DELETE /admin/stories/:storyId → 휴지통
  @Delete(':storyId')
  async trash(@Param('storyId', ParseUUIDPipe) storyId: string, @CurrentUser() user: CurrentUserInfo) {
    await this.commandService.trash(storyId, user.userId);
    return { storyId };
  }

  // POST /admin/stories/:storyId/restore → 휴지통에서 꺼내기
  @Post(':storyId/restore')
  @HttpCode(200)
  restore(@Param('storyId', ParseUUIDPipe) storyId: string) {
    return this.commandService.restore(storyId);
  }

  // DELETE /admin/stories/:storyId/permanent → 휴지통의 기록만 영구 삭제
  @Delete(':storyId/permanent')
  async purge(@Param('storyId', ParseUUIDPipe) storyId: string) {
    await this.commandService.purge(storyId);
    return { storyId };
  }
}
