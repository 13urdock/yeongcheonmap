import 'package:flutter_test/flutter_test.dart';
import 'package:yeongcheon_map/core/error/failure.dart';
import 'package:yeongcheon_map/core/error/result.dart';
import 'package:yeongcheon_map/data/models/event_pin_model.dart';
import 'package:yeongcheon_map/data/models/place_candidate_model.dart';
import 'package:yeongcheon_map/data/models/place_pin_model.dart';
import 'package:yeongcheon_map/data/repositories/event_repository.dart';
import 'package:yeongcheon_map/data/repositories/place_repository.dart';
import 'package:yeongcheon_map/providers/anchor_search_provider.dart';

// '영천의 장소' 검색 규칙: 검색어가 있을 때만, 이미 보이는 장소는 빼고, 실패해도 우리 DB 결과는 그대로
class _FakePlaceRepository implements PlaceRepository {
  List<PlacePinModel> pins = const [];
  Result<List<PlaceCandidateModel>> candidates = const Ok([]);
  int candidateCalls = 0;

  @override
  Future<Result<List<PlacePinModel>>> search(String keyword) async => Ok(pins);

  @override
  Future<Result<List<PlaceCandidateModel>>> searchCandidates(String keyword) async {
    candidateCalls++;
    return candidates;
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _FakeEventRepository implements EventRepository {
  @override
  Future<Result<List<EventPinModel>>> search(String keyword) async => const Ok([]);

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

void main() {
  const registered = PlacePinModel(
    placeId: 'p1',
    name: '중앙카페',
    usageType: null,
    latitude: 35.97,
    longitude: 128.93,
    sinceYear: null,
    thumbnailUrl: null,
    storyCount: 3,
  );
  const sameAsRegistered = PlaceCandidateModel(name: '중앙카페', latitude: 35.97, longitude: 128.93, placeId: 'p1');
  const fresh = PlaceCandidateModel(name: '영천시장', latitude: 35.96, longitude: 128.94);

  late _FakePlaceRepository places;
  AnchorSearchProvider build() =>
      AnchorSearchProvider(placeRepository: places, eventRepository: _FakeEventRepository(), debounce: Duration.zero);

  setUp(() => places = _FakePlaceRepository());

  test('검색어가 없으면 영천 장소를 찾지 않는다', () async {
    final search = build();
    await search.search();
    expect(places.candidateCalls, 0);
    expect(search.searchesCandidates, isFalse);
  });

  test('이미 장소 목록에 보이는 곳은 영천의 장소에서 뺀다', () async {
    places
      ..pins = const [registered]
      ..candidates = const Ok([sameAsRegistered, fresh]);
    final search = build()..setQuery('카페');
    await search.search();
    expect(search.places.map((p) => p.placeId), ['p1']);
    expect(search.candidates.map((c) => c.name), ['영천시장']);
  });

  test('영천 장소 검색이 실패해도 우리 장소 결과와 전체 실패는 그대로', () async {
    places
      ..pins = const [registered]
      ..candidates = const Err(ServerFailure(code: 'PLACE_SEARCH_UNAVAILABLE', message: '지금 안 됨'));
    final search = build()..setQuery('카페');
    await search.search();
    expect(search.places, hasLength(1));
    expect(search.failure, isNull);
    expect(search.candidateFailure, isNotNull);
    expect(search.hasNoResult, isFalse);
  });
}
