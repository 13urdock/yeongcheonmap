import 'package:flutter_test/flutter_test.dart';
import 'package:yeongcheon_map/core/error/failure.dart';
import 'package:yeongcheon_map/core/error/result.dart';
import 'package:yeongcheon_map/data/models/anchor_target.dart';
import 'package:yeongcheon_map/data/models/create_story_request.dart';
import 'package:yeongcheon_map/data/models/place_candidate_model.dart';
import 'package:yeongcheon_map/data/models/story_model.dart';
import 'package:yeongcheon_map/data/models/timeline_anchor.dart';
import 'package:yeongcheon_map/data/repositories/place_repository.dart';
import 'package:yeongcheon_map/data/repositories/story_repository.dart';
import 'package:yeongcheon_map/providers/story_write_provider.dart';

// 지도 상표·영천 장소 검색으로 고른 "아직 등록 안 된 장소": 보관할 때 확정(resolve) → 그 placeId 로 기록
class _FakePlaceRepository implements PlaceRepository {
  int resolveCalls = 0;
  Result<String> next = const Ok('p-new');

  @override
  Future<Result<String>> resolve(PlaceCandidateModel candidate) async {
    resolveCalls++;
    return next;
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _FakeStoryRepository implements StoryRepository {
  final requests = <CreateStoryRequest>[];
  Result<StoryModel>? next;

  @override
  Future<Result<StoryModel>> create(CreateStoryRequest request) async {
    requests.add(request);
    return next!;
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

void main() {
  const tapped = PlaceCandidateModel(name: '중앙카페', latitude: 35.97, longitude: 128.93);
  const failure = ServerFailure(code: 'INTERNAL_ERROR', message: '잠시 후 다시');

  late _FakePlaceRepository places;
  late _FakeStoryRepository stories;

  StoryWriteProvider build() => StoryWriteProvider(
        storyRepository: stories,
        placeRepository: places,
        initialTarget: AnchorTarget.newPlace(tapped),
        clock: () => DateTime(2026, 11, 7),
      )..setContent('방학식 날');

  setUp(() {
    places = _FakePlaceRepository();
    stories = _FakeStoryRepository()..next = const Err(failure);
  });

  test('새 장소도 장소이므로 그때 이름을 묻는다', () {
    final write = build();
    expect(write.target?.name, '중앙카페');
    expect(write.asksPlaceNameThen, isTrue);
    expect(write.canSubmit, isTrue);
  });

  test('보관하면 장소를 확정하고 그 placeId 로 기록을 보낸다', () async {
    final write = build();
    await write.submit();
    expect(places.resolveCalls, 1);
    expect(stories.requests.single.placeId, 'p-new');
    expect(stories.requests.single.eventId, isNull);
  });

  test('기록 저장이 실패해 다시 보관해도 장소는 한 번만 확정한다', () async {
    final write = build();
    await write.submit();
    await write.submit();
    expect(places.resolveCalls, 1);
    expect(stories.requests.length, 2);
    expect(write.target?.anchor, isA<PlaceAnchor>());
  });

  test('장소 확정이 실패하면 기록을 보내지 않고 실패를 알려준다', () async {
    places.next = const Err(failure);
    final write = build();
    final created = await write.submit();
    expect(created, isNull);
    expect(stories.requests, isEmpty);
    expect(write.failure?.message, '잠시 후 다시');
    expect(write.isSubmitting, isFalse);
  });
}
