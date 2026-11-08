import '../../core/config/constants.dart';
import '../../core/error/failure_mapper.dart';
import '../../core/error/result.dart';
import '../datasources/place_remote_datasource.dart';
import '../models/place_candidate_model.dart';
import '../models/place_detail_model.dart';
import '../models/place_pin_model.dart';
import '../models/resolve_place_request.dart';

// 장소 데이터 제공. 예외를 Failure 로 바꿔 Result 로 돌려준다.
class PlaceRepository {
  PlaceRepository(this._remote);

  final PlaceRemoteDataSource _remote;

  /// 지도 핀. 지금은 첫 페이지(최대 pinPageSize)만 — bbox·클러스터링은 Map_04 다음 단계에서.
  Future<Result<List<PlacePinModel>>> getPins() {
    return runGuarded(() async {
      final paged = await _remote.fetchPins(size: MapConstants.pinPageSize);
      return paged.items;
    });
  }

  /// 기록할 장소 고르기: 이름·주소에 [keyword] 가 든 장소 (빈 문자열이면 전체, 이름순 앞쪽부터)
  Future<Result<List<PlacePinModel>>> search(String keyword) {
    return runGuarded(() async {
      final paged = await _remote.fetchPins(keyword: keyword, size: MapConstants.searchPageSize);
      return paged.items;
    });
  }

  Future<Result<PlaceDetailModel>> getDetail(String placeId) {
    return runGuarded(() => _remote.fetchDetail(placeId));
  }

  /// '영천의 장소': 네이버 지역 검색 결과 중 주소가 영천시인 곳 (서버가 대신 검색)
  Future<Result<List<PlaceCandidateModel>>> searchCandidates(String keyword) {
    return runGuarded(() => _remote.fetchCandidates(keyword));
  }

  /// 아직 등록 안 된 실제 장소를 우리 장소로 확정하고 placeId 를 돌려준다
  Future<Result<String>> resolve(PlaceCandidateModel candidate) {
    return runGuarded(() async {
      final resolved = await _remote.resolve(ResolvePlaceRequest(
        name: candidate.name,
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        address: candidate.address,
      ));
      return resolved.placeId;
    });
  }
}
