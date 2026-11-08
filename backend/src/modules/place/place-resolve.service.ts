import { Injectable, Logger } from '@nestjs/common';
import { boxAround, distanceMeters } from '../../common/utils/geo-distance';
import { ResolvePlaceDto } from './dto/resolve-place.dto';
import { PlaceRepository } from './place.repository';
import { NaverLocalClient } from './place-search/naver-local.client';
import { isYeongcheonAddress, withRegion } from './place-search/yeongcheon-area';
import { findSamePlace, normalizePlaceName, SAME_PLACE_RADIUS_M } from './same-place.rule';

const ADDRESS_LOOKUP_RADIUS_M = 100;

export interface ResolvePlaceResponse {
  placeId: string;
  created: boolean;
}

// 장소 확정(찾거나 만들기, API 명세 v4.4 §4): 같은 이름+50m 안이면 그 장소, 아니면 새로 만든다.
// 기록을 보관하는 순간에만 불린다 — 지도에서 누르기만 한 곳은 DB 에 남지 않는다.
@Injectable()
export class PlaceResolveService {
  private readonly logger = new Logger(PlaceResolveService.name);

  constructor(
    private readonly placeRepository: PlaceRepository,
    private readonly naver: NaverLocalClient,
  ) {}

  async resolve(dto: ResolvePlaceDto, userId: string): Promise<ResolvePlaceResponse> {
    const target = { name: dto.name.trim(), latitude: dto.latitude, longitude: dto.longitude };
    const nearby = await this.placeRepository.findInBoxes([boxAround(target, SAME_PLACE_RADIUS_M)]);
    const existing = findSamePlace(nearby, target);
    if (existing) return { placeId: existing.placeId, created: false };

    const address = dto.address?.trim() || (await this.lookupAddress(target));
    const place = await this.placeRepository.create({ ...target, address: address ?? undefined, createdBy: userId });
    return { placeId: place.placeId, created: true };
  }

  // 지도 상표처럼 주소 없이 온 곳: 이름으로 검색해 같은 이름·100m 안·영천시인 결과의 주소.
  // 못 찾거나 검색이 안 되면 null(확정은 계속). 100m 는 지도 상표 위치와 검색 좌표가 조금 다를 수 있어서.
  private async lookupAddress(target: { name: string; latitude: number; longitude: number }): Promise<string | null> {
    try {
      const wanted = normalizePlaceName(target.name);
      const found = await this.naver.search(withRegion(target.name));
      const match = found.find(
        (p) =>
          normalizePlaceName(p.name) === wanted &&
          distanceMeters(p, target) <= ADDRESS_LOOKUP_RADIUS_M &&
          isYeongcheonAddress(p.address, p.roadAddress),
      );
      return match ? (match.roadAddress ?? match.address) : null;
    } catch (e) {
      this.logger.warn(`주소 찾기 건너뜀: ${(e as Error).message}`);
      return null;
    }
  }
}
