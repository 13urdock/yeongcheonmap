import { Injectable, Logger } from '@nestjs/common';
import { boxAround } from '../../common/utils/geo-distance';
import { QueryPlaceCandidatesDto } from './dto/query-place-candidates.dto';
import { PlaceCandidatesResponse, toPlaceCandidate } from './place-candidate.mapper';
import { PlaceRepository } from './place.repository';
import { NaverLocalClient } from './place-search/naver-local.client';
import { isYeongcheonAddress, withRegion } from './place-search/yeongcheon-area';
import { findSamePlace, SAME_PLACE_RADIUS_M } from './same-place.rule';

// 영천의 실제 장소 검색: 외부 검색('영천'을 붙여서) → 영천시 주소만 → 이미 등록된 같은 장소면 placeId 를 붙인다
@Injectable()
export class PlaceCandidateService {
  private readonly logger = new Logger(PlaceCandidateService.name);

  constructor(
    private readonly naver: NaverLocalClient,
    private readonly placeRepository: PlaceRepository,
  ) {}

  async search(query: QueryPlaceCandidatesDto): Promise<PlaceCandidatesResponse> {
    const found = await this.naver.search(withRegion(query.q));
    const candidates = found.filter((p) => isYeongcheonAddress(p.address, p.roadAddress)).map(toPlaceCandidate);
    this.logger.debug(`"${query.q}" → 네이버 ${found.length}건, 영천시 ${candidates.length}건`);

    const registered = candidates.length
      ? await this.placeRepository.findInBoxes(candidates.map((c) => boxAround(c, SAME_PLACE_RADIUS_M)))
      : [];
    return { items: candidates.map((c) => ({ ...c, placeId: findSamePlace(registered, c)?.placeId ?? null })) };
  }
}
