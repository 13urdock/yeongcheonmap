import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, CurrentUserInfo } from '../../common/decorators/current-user.decorator';
import { ResolvePlaceDto } from '../place/dto/resolve-place.dto';
import { PlaceResolveService } from '../place/place-resolve.service';
import { CreateStoryDto } from '../story/dto/create-story.dto';
import { StoryCreateService } from '../story/story-create.service';
import { StorySource } from '../story/story-source';
import { PresignUploadDto } from '../upload/dto/presign-upload.dto';
import { UploadService } from '../upload/upload.service';
import { VisitorCodeGuard } from './visitor-code.guard';
import { VisitorConfigService } from './visitor-config.service';

// 관람객 웹(/visit) 전용 입구 (API 명세 §11). 리소스가 아니라 "로그인 없는 쓰기 채널"이라
// 로직은 없고, 각 리소스 서비스에 그대로 넘긴다. 읽기는 기존 공개 GET 을 쓴다. 관람객은 올리기만 한다.
@Controller('visitor')
export class VisitorController {
  constructor(
    private readonly visitorConfigService: VisitorConfigService,
    private readonly placeResolveService: PlaceResolveService,
    private readonly uploadService: UploadService,
    private readonly storyCreateService: StoryCreateService,
  ) {}

  // GET /visitor/config
  @Get('config')
  config() {
    return this.visitorConfigService.get();
  }

  // POST /visitor/places/resolve (쓰기 코드) — POST /places/resolve 와 같음
  @Post('places/resolve')
  @HttpCode(200)
  @UseGuards(VisitorCodeGuard)
  resolvePlace(@Body() dto: ResolvePlaceDto, @CurrentUser() user: CurrentUserInfo) {
    return this.placeResolveService.resolve(dto, user.userId);
  }

  // POST /visitor/uploads/presign (쓰기 코드) — POST /uploads/presign 과 같음
  @Post('uploads/presign')
  @HttpCode(200)
  @UseGuards(VisitorCodeGuard)
  presign(@Body() dto: PresignUploadDto) {
    return this.uploadService.presign(dto.files);
  }

  // POST /visitor/stories (쓰기 코드) — POST /stories 와 같음, 작성자·기록자는 수집가, 경로 visitor_web
  @Post('stories')
  @HttpCode(201)
  @UseGuards(VisitorCodeGuard)
  createStory(@Body() dto: CreateStoryDto, @CurrentUser() user: CurrentUserInfo) {
    return this.storyCreateService.create(dto, { userId: user.userId, source: StorySource.VISITOR_WEB });
  }
}
