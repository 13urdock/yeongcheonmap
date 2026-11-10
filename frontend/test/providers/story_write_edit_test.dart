import 'package:flutter_test/flutter_test.dart';
import 'package:yeongcheon_map/core/error/failure.dart';
import 'package:yeongcheon_map/core/error/result.dart';
import 'package:yeongcheon_map/core/media/photo_picker.dart';
import 'package:yeongcheon_map/data/models/anchor_target.dart';
import 'package:yeongcheon_map/data/models/story_model.dart';
import 'package:yeongcheon_map/data/models/timeline_anchor.dart';
import 'package:yeongcheon_map/data/models/update_story_request.dart';
import 'package:yeongcheon_map/data/repositories/place_repository.dart';
import 'package:yeongcheon_map/data/repositories/story_repository.dart';
import 'package:yeongcheon_map/data/repositories/upload_repository.dart';
import 'package:yeongcheon_map/providers/story_write_provider.dart';

// 수정 모드: 값을 채워 시작, 기존 사진은 다시 올리지 않고 새 사진만, 사진 목록 전체를 순서대로 PATCH, 삭제
class _FakePicker implements PhotoPicker {
  @override
  Future<List<String>> pickMany() async => ['new.jpg'];
}

class _FakeUploadRepository implements UploadRepository {
  final calls = <List<String>>[];

  @override
  Future<Result<List<String>>> uploadPhotos(List<String> paths) async {
    calls.add(paths);
    return Ok([for (final p in paths) 'https://cdn/stories/$p']);
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _FakeStoryRepository implements StoryRepository {
  final updates = <(String, UpdateStoryRequest)>[];
  final deletes = <String>[];
  Result<void> deleteReply = const Ok(null);

  @override
  Future<Result<StoryModel>> update(String storyId, UpdateStoryRequest request) async {
    updates.add((storyId, request));
    return Ok(_story());
  }

  @override
  Future<Result<void>> delete(String storyId) async {
    deletes.add(storyId);
    return deleteReply;
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _UnusedPlaceRepository implements PlaceRepository {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

StoryModel _story({List<String> photos = const ['https://cdn/stories/old1.jpg', 'https://cdn/stories/old2.jpg']}) =>
    StoryModel.fromJson({
      'storyId': 's1',
      'user': {'userId': 'u1', 'name': '수집가', 'profileUrl': null},
      'placeId': 'c1',
      'eventId': null,
      'memoryDate': {'pattern': '1995.XX.XX', 'from': '1995-01-01', 'to': '1995-12-31', 'yearFrom': 1995, 'yearTo': 1995},
      'placeNameThen': '중앙분식',
      'content': '떡볶이',
      'photos': [
        for (var i = 0; i < photos.length; i++) {'storyPhotoId': 'p$i', 'imageUrl': photos[i]},
      ],
      'createdAt': '2026-11-10T00:00:00.000Z',
    });

void main() {
  const cafe = AnchorTarget(anchor: PlaceAnchor('c1'), name: '○○카페');
  late _FakeUploadRepository uploads;
  late _FakeStoryRepository stories;

  StoryWriteProvider build() => StoryWriteProvider(
        storyRepository: stories,
        placeRepository: _UnusedPlaceRepository(),
        uploadRepository: uploads,
        initialTarget: cafe,
        editingStory: _story(),
        photoPicker: _FakePicker(),
        clock: () => DateTime(2026, 11, 10),
      );

  setUp(() {
    uploads = _FakeUploadRepository();
    stories = _FakeStoryRepository();
  });

  test('원래 값으로 시작하고 기록할 곳은 바꿀 수 없다', () {
    final write = build();
    expect(write.isEditing, isTrue);
    expect(write.pattern.toString(), '1995.XX.XX');
    expect(write.placeNameThen, '중앙분식');
    expect(write.content, '떡볶이');
    expect(write.photoPaths, ['https://cdn/stories/old1.jpg', 'https://cdn/stories/old2.jpg']);
    write.setTarget(const AnchorTarget(anchor: EventAnchor('e1'), name: '축제'));
    expect(write.target, cafe);
    expect(write.canSubmit, isTrue);
  });

  test('기존 사진 하나 빼고 새 사진 추가 → 새 사진만 올리고 목록 전체를 순서대로 보낸다', () async {
    final write = build();
    write.removePhotoAt(0);
    await write.pickPhotos();
    write.setContent('');

    expect(await write.submit(), isNotNull);
    expect(uploads.calls, [
      ['new.jpg'],
    ]);
    final (id, req) = stories.updates.single;
    expect(id, 's1');
    expect(req.toJson(), {
      'memoryDate': '1995.XX.XX',
      'placeNameThen': '중앙분식',
      'content': '',
      'photoUrls': ['https://cdn/stories/old2.jpg', 'https://cdn/stories/new.jpg'],
    });
  });

  test('사진을 모두 빼고 글도 비우면 보관할 수 없다', () {
    final write = build();
    write.removePhotoAt(0);
    write.removePhotoAt(0);
    write.setContent('  ');
    expect(write.canSubmit, isFalse);
  });

  test('삭제 성공 / 실패', () async {
    final write = build();
    expect(await write.delete(), isTrue);
    expect(stories.deletes, ['s1']);

    stories.deleteReply = const Err(ServerFailure(code: 'FORBIDDEN', message: '본인이 남긴 기록만 고칠 수 있어요'));
    expect(await write.delete(), isFalse);
    expect(write.failure?.message, '본인이 남긴 기록만 고칠 수 있어요');
  });
}
