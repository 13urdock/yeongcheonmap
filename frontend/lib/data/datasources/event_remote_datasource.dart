import '../../core/network/api_client.dart';
import '../models/event_detail_model.dart';
import '../models/event_pin_model.dart';

// 축제 리소스 원격 호출 (HTTP + 파싱만). 축제 타임라인은 story_remote_datasource 담당.
class EventRemoteDataSource {
  EventRemoteDataSource(this._client);

  final ApiClient _client;

  /// GET /events — 좌표 있는 축제만 온다
  Future<List<EventPinModel>> fetchPins() async {
    final data = await _client.get('/events');
    final items = data['items'] as List<dynamic>? ?? const [];
    return items.map((e) => EventPinModel.fromJson(e as Map<String, dynamic>)).toList(growable: false);
  }

  /// GET /events/{eventId}
  Future<EventDetailModel> fetchDetail(String eventId) async {
    final data = await _client.get('/events/$eventId');
    return EventDetailModel.fromJson(data);
  }
}
