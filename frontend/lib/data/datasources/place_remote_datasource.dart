import '../../core/network/api_client.dart';
import '../models/map_bounds_model.dart';
import '../models/paged_result_model.dart';
import '../models/place_detail_model.dart';
import '../models/place_pin_model.dart';

// 장소 리소스 원격 호출 (HTTP + 파싱만). 장소 타임라인은 story_remote_datasource 담당.
class PlaceRemoteDataSource {
  PlaceRemoteDataSource(this._client);

  final ApiClient _client;

  /// GET /places?bbox=&usageType=&page=&size=
  Future<PagedResultModel<PlacePinModel>> fetchPins({
    MapBoundsModel? bbox,
    String? usageType,
    int page = 1,
    int size = 20,
  }) async {
    final data = await _client.get('/places', query: {
      if (bbox != null) 'bbox': bbox.toBboxQuery(),
      if (usageType != null) 'usageType': usageType,
      'page': page,
      'size': size,
    });
    return PagedResultModel.fromJson(data, PlacePinModel.fromJson);
  }

  /// GET /places/{placeId}
  Future<PlaceDetailModel> fetchDetail(String placeId) async {
    final data = await _client.get('/places/$placeId');
    return PlaceDetailModel.fromJson(data);
  }
}
