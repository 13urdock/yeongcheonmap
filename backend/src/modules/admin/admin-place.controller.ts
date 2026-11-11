import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, CurrentUserInfo } from '../../common/decorators/current-user.decorator';
import { CreatePlaceDto } from '../place/dto/create-place.dto';
import { AdminOnly } from './admin-only.decorator';
import { AdminPlaceService } from './admin-place.service';
import { QueryAdminPlacesDto } from './dto/query-admin-places.dto';
import { UpdateAdminPlaceDto } from './dto/update-admin-place.dto';

// /admin/places 라우팅만 (API 명세 v4.8 §12)
@Controller('admin/places')
@AdminOnly()
export class AdminPlaceController {
  constructor(private readonly placeService: AdminPlaceService) {}

  // GET /admin/places?q=&sort=&page=&size=
  @Get()
  list(@Query() query: QueryAdminPlacesDto) {
    return this.placeService.list(query);
  }

  // GET /admin/places/:placeId
  @Get(':placeId')
  get(@Param('placeId', ParseUUIDPipe) placeId: string) {
    return this.placeService.get(placeId);
  }

  // POST /admin/places
  @Post()
  @HttpCode(201)
  create(@Body() dto: CreatePlaceDto, @CurrentUser() user: CurrentUserInfo) {
    return this.placeService.create(dto, user.userId);
  }

  // PATCH /admin/places/:placeId
  @Patch(':placeId')
  update(@Param('placeId', ParseUUIDPipe) placeId: string, @Body() dto: UpdateAdminPlaceDto) {
    return this.placeService.update(placeId, dto);
  }

  // DELETE /admin/places/:placeId — 기록·축제 개최지가 없을 때만
  @Delete(':placeId')
  async remove(@Param('placeId', ParseUUIDPipe) placeId: string) {
    await this.placeService.remove(placeId);
    return { placeId };
  }
}
