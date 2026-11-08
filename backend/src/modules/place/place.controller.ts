import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser, CurrentUserInfo } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreatePlaceDto } from './dto/create-place.dto';
import { QueryPlaceCandidatesDto } from './dto/query-place-candidates.dto';
import { QueryPlacesDto } from './dto/query-places.dto';
import { ResolvePlaceDto } from './dto/resolve-place.dto';
import { PlaceCandidateService } from './place-candidate.service';
import { PlaceResolveService } from './place-resolve.service';
import { PlaceService } from './place.service';

// 라우팅·DTO 검증·응답 반환만. (장소 타임라인 GET /places/:id/stories 는 story 모듈 담당)
@Controller('places')
export class PlaceController {
  constructor(
    private readonly placeService: PlaceService,
    private readonly placeCandidateService: PlaceCandidateService,
    private readonly placeResolveService: PlaceResolveService,
  ) {}

  // GET /places?bbox=&usageType=&q=&page=&size=
  @Get()
  listPins(@Query() query: QueryPlacesDto) {
    return this.placeService.listPins(query);
  }

  // GET /places/candidates?q=  (영천의 실제 장소 검색. :placeId 보다 먼저 선언해야 한다)
  @Get('candidates')
  searchCandidates(@Query() query: QueryPlaceCandidatesDto) {
    return this.placeCandidateService.search(query);
  }

  // GET /places/:placeId
  @Get(':placeId')
  getDetail(@Param('placeId', ParseUUIDPipe) placeId: string) {
    return this.placeService.getDetail(placeId);
  }

  // POST /places/resolve (인증) — 찾거나 만들기
  @Post('resolve')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  resolve(@Body() dto: ResolvePlaceDto, @CurrentUser() user: CurrentUserInfo) {
    return this.placeResolveService.resolve(dto, user.userId);
  }

  // POST /places (인증)
  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreatePlaceDto, @CurrentUser() user: CurrentUserInfo) {
    return this.placeService.create(dto, user.userId);
  }
}
