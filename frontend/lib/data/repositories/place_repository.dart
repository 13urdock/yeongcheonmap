import '../../core/config/constants.dart';
import '../../core/error/failure_mapper.dart';
import '../../core/error/result.dart';
import '../datasources/place_remote_datasource.dart';
import '../models/place_detail_model.dart';
import '../models/place_pin_model.dart';

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

  Future<Result<PlaceDetailModel>> getDetail(String placeId) {
    return runGuarded(() => _remote.fetchDetail(placeId));
  }
}
