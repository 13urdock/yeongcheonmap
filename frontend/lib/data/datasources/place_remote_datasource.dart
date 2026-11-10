import '../../core/network/api_client.dart';
import '../models/map_bounds_model.dart';
import '../models/paged_result_model.dart';
import '../models/place_candidate_model.dart';
import '../models/place_detail_model.dart';
import '../models/place_pin_model.dart';
import '../models/resolve_place_request.dart';
import '../models/resolved_place_model.dart';

// 장소 리소스 원격 호출 (HTTP + 파싱만). 장소 타임라인은 story_remote_datasource 담당.
class PlaceRemoteDataSource {
  PlaceRemoteDataSource(this._client);

  final ApiClient _client;

  /// GET /places?bbox=&usageType=&q=&page=&size=  (q = 이름·주소 검색어)
  Future<PagedResultModel<PlacePinModel>> fetchPins({
    MapBoundsModel? bbox,
    String? usageType,
    String? keyword,
    int page = 1,
    int size = 20,
  }) async {
    final data = await _client.get('/places', query: {
      if (bbox != null) 'bbox': bbox.toBboxQuery(),
      if (usageType != null) 'usageType': usageType,
      if (keyword != null && keyword.isNotEmpty) 'q': keyword,
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

  /// GET /places/candidates?q=  (영천의 실제 장소 검색, 최대 5곳)
  Future<List<PlaceCandidateModel>> fetchCandidates(String keyword) async {
    final data = await _client.get('/places/candidates', query: {'q': keyword});
    final items = data['items'] as List<dynamic>? ?? const [];
    return items.map((e) => PlaceCandidateModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  /// POST /places/resolve (인증) — 같은 이름+50m 안이면 그 장소, 아니면 새로 만든다
  Future<ResolvedPlaceModel> resolve(ResolvePlaceRequest request) async {
    final data = await _client.post('/places/resolve', body: request.toJson());
    return ResolvedPlaceModel.fromJson(data);
  }
}
