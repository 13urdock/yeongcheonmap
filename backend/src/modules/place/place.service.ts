import { Injectable } from '@nestjs/common';
import { Place } from '../../generated/prisma/client';
import { PagedResult } from '../../common/dto/pagination.dto';
import { AppErrorCode } from '../../common/errors/app-error-code';
import { AppException } from '../../common/errors/app.exception';
import { parseBbox } from '../../common/utils/bbox.parser';
import { CreatePlaceDto } from './dto/create-place.dto';
import { QueryPlacesDto } from './dto/query-places.dto';
import { PlaceDetailResponse, PlacePinResponse, toPlaceDetailResponse, toPlacePinResponse } from './place.mapper';
import { PlaceRepository } from './place.repository';

// 장소 조회·등록 유스케이스
@Injectable()
export class PlaceService {
  constructor(private readonly placeRepository: PlaceRepository) {}

  // 지도 핀 목록
  async listPins(query: QueryPlacesDto): Promise<PagedResult<PlacePinResponse>> {
    const bbox = query.bbox ? parseBbox(query.bbox) : undefined;
    if (bbox === null) {
      throw new AppException(AppErrorCode.INVALID_PARAMETER, 'bbox 범위가 올바르지 않습니다');
    }

    const [rows, totalCount] = await this.placeRepository.findPins(
      { bbox, usageType: query.usageType },
      query.skip,
      query.size,
    );
    return { items: rows.map(toPlacePinResponse), page: query.page, size: query.size, totalCount };
  }

  async getDetail(placeId: string): Promise<PlaceDetailResponse> {
    const row = await this.placeRepository.findDetail(placeId);
    if (!row) {
      throw new AppException(AppErrorCode.PLACE_NOT_FOUND, '존재하지 않는 장소입니다');
    }
    return toPlaceDetailResponse(row);
  }

  async create(dto: CreatePlaceDto, createdBy: string): Promise<{ placeId: string }> {
    const place = await this.placeRepository.create({ ...dto, createdBy });
    return { placeId: place.placeId };
  }

  // 다른 서비스(story)가 "존재하는 장소"를 보장받을 때 사용
  async getPlaceOrThrow(placeId: string): Promise<Place> {
    const place = await this.placeRepository.findById(placeId);
    if (!place) {
      throw new AppException(AppErrorCode.PLACE_NOT_FOUND, '존재하지 않는 장소입니다');
    }
    return place;
  }
}
