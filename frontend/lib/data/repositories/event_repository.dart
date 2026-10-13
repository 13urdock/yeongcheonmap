import '../../core/error/failure_mapper.dart';
import '../../core/error/result.dart';
import '../datasources/event_remote_datasource.dart';
import '../models/event_detail_model.dart';
import '../models/event_pin_model.dart';

// 축제 데이터 제공. 예외를 Failure 로 바꿔 Result 로 돌려준다.
class EventRepository {
  EventRepository(this._remote);

  final EventRemoteDataSource _remote;

  Future<Result<List<EventPinModel>>> getPins() => runGuarded(_remote.fetchPins);

  Future<Result<EventDetailModel>> getDetail(String eventId) {
    return runGuarded(() => _remote.fetchDetail(eventId));
  }
}
