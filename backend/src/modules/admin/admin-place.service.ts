import { Injectable } from '@nestjs/common';
import { PagedResult } from '../../common/dto/pagination.dto';
import { AppErrorCode } from '../../common/errors/app-error-code';
import { AppException } from '../../common/errors/app.exception';
import { CreatePlaceDto } from '../place/dto/create-place.dto';
import { PlaceService } from '../place/place.service';
import { normalizeStoryText } from '../story/story-text';
import { QueryAdminPlacesDto } from './dto/query-admin-places.dto';
import { UpdateAdminPlaceDto } from './dto/update-admin-place.dto';
import { AdminPlaceResponse, toAdminPlaceResponse } from './admin-place.mapper';
import { AdminPlaceRepository, AdminPlaceRow, UpdatePlaceData } from './admin-place.repository';

// 운영진 장소 관리 유스케이스. 규칙:
// 1) 등록은 앱과 같은 PlaceService.create (만든 사람 = 로그인한 운영 계정)
// 2) 수정은 보낸 필드만. 이름은 비울 수 없고, 다른 글 필드는 ""/null 이면 지운다
// 3) 기록(휴지통 포함)이나 축제 개최지가 달린 장소는 지울 수 없다(PLACE_HAS_STORIES) — 기록이 사라지지 않게
@Injectable()
export class AdminPlaceService {
  constructor(
    private readonly repository: AdminPlaceRepository,
    private readonly placeService: PlaceService,
  ) {}

  async list(query: QueryAdminPlacesDto): Promise<PagedResult<AdminPlaceResponse>> {
    const [rows, totalCount] = await this.repository.list(query.q?.trim() || undefined, query.sort, query.skip, query.size);
    return { items: rows.map(toAdminPlaceResponse), page: query.page, size: query.size, totalCount };
  }

  async get(placeId: string): Promise<AdminPlaceResponse> {
    return toAdminPlaceResponse(await this.findOrThrow(placeId));
  }

  async create(dto: CreatePlaceDto, userId: string): Promise<AdminPlaceResponse> {
    const { placeId } = await this.placeService.create(dto, userId);
    return this.get(placeId);
  }

  async update(placeId: string, dto: UpdateAdminPlaceDto): Promise<AdminPlaceResponse> {
    await this.findOrThrow(placeId);
    return toAdminPlaceResponse(await this.repository.update(placeId, toUpdateData(dto)));
  }

  async remove(placeId: string): Promise<void> {
    await this.findOrThrow(placeId);
    const refs = await this.repository.countReferences(placeId);
    if (refs.stories > 0) {
      throw new AppException(
        AppErrorCode.PLACE_HAS_STORIES,
        `기록 ${refs.stories}개(휴지통 포함)가 달린 장소예요. 기록을 먼저 영구 삭제해 주세요`,
      );
    }
    if (refs.eventPlaces > 0) {
      throw new AppException(AppErrorCode.PLACE_HAS_STORIES, '축제 개최지로 쓰이는 장소라 지울 수 없어요');
    }
    await this.repository.delete(placeId);
  }

  private async findOrThrow(placeId: string): Promise<AdminPlaceRow> {
    const row = await this.repository.findById(placeId);
    if (!row) throw new AppException(AppErrorCode.PLACE_NOT_FOUND, '존재하지 않는 장소입니다');
    return row;
  }
}

// 보낸 필드만 옮긴다. undefined = 그대로
export function toUpdateData(dto: UpdateAdminPlaceDto): UpdatePlaceData {
  const data: UpdatePlaceData = {};
  if (dto.name !== undefined) {
    const name = dto.name.trim();
    if (!name) throw new AppException(AppErrorCode.INVALID_PARAMETER, '장소 이름은 비울 수 없어요');
    data.name = name;
  }
  for (const key of ['usageType', 'intro', 'address', 'thumbnailUrl'] as const) {
    if (dto[key] !== undefined) data[key] = normalizeStoryText(dto[key]) ?? null;
  }
  if (dto.sinceYear !== undefined) data.sinceYear = dto.sinceYear;
  if (dto.latitude !== undefined) data.latitude = dto.latitude;
  if (dto.longitude !== undefined) data.longitude = dto.longitude;
  return data;
}
