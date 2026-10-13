import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser, CurrentUserInfo } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreatePlaceDto } from './dto/create-place.dto';
import { QueryPlacesDto } from './dto/query-places.dto';
import { PlaceService } from './place.service';

// 라우팅·DTO 검증·응답 반환만. (장소 타임라인 GET /places/:id/stories 는 story 모듈 담당)
@Controller('places')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  // GET /places?bbox=&usageType=&page=&size=
  @Get()
  listPins(@Query() query: QueryPlacesDto) {
    return this.placeService.listPins(query);
  }

  // GET /places/:placeId
  @Get(':placeId')
  getDetail(@Param('placeId', ParseUUIDPipe) placeId: string) {
    return this.placeService.getDetail(placeId);
  }

  // POST /places (인증)
  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreatePlaceDto, @CurrentUser() user: CurrentUserInfo) {
    return this.placeService.create(dto, user.userId);
  }
}
