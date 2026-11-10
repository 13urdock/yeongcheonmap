import 'package:flutter_test/flutter_test.dart';
import 'package:yeongcheon_map/core/error/failure.dart';
import 'package:yeongcheon_map/core/error/result.dart';
import 'package:yeongcheon_map/core/media/photo_picker.dart';
import 'package:yeongcheon_map/data/models/anchor_target.dart';
import 'package:yeongcheon_map/data/models/create_story_request.dart';
import 'package:yeongcheon_map/data/models/story_model.dart';
import 'package:yeongcheon_map/data/models/timeline_anchor.dart';
import 'package:yeongcheon_map/data/repositories/place_repository.dart';
import 'package:yeongcheon_map/data/repositories/story_repository.dart';
import 'package:yeongcheon_map/data/repositories/upload_repository.dart';
import 'package:yeongcheon_map/providers/story_write_provider.dart';

// Story_03 사진: 사진만으로 보관 가능, 보관할 때 올려서 photoUrls 로, 실패 후 다시 보관하면 올라간 사진은 재업로드 안 함
class _FakePicker implements PhotoPicker {
  _FakePicker(this.paths);
  final List<String> paths;

  @override
  Future<List<String>> pickMany() async => paths;
}

class _FakeUploadRepository implements UploadRepository {
  final calls = <List<String>>[];
  Result<List<String>> Function(List<String> paths)? reply;

  @override
  Future<Result<List<String>>> uploadPhotos(List<String> paths) async {
    calls.add(paths);
    return reply?.call(paths) ?? Ok([for (final p in paths) 'https://cdn/stories/$p']);
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _FakeStoryRepository implements StoryRepository {
  final requests = <CreateStoryRequest>[];
  final results = <Result<StoryModel>>[];

  @override
  Future<Result<StoryModel>> create(CreateStoryRequest request) async {
    requests.add(request);
    return results.removeAt(0);
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _UnusedPlaceRepository implements PlaceRepository {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

void main() {
  const cafe = AnchorTarget(anchor: PlaceAnchor('c1'), name: '○○카페');
  const serverDown = ServerFailure(code: 'INTERNAL_ERROR', message: '잠시 후 다시');

  late _FakeUploadRepository uploads;
  late _FakeStoryRepository stories;

  StoryWriteProvider build(List<String> picked) => StoryWriteProvider(
        storyRepository: stories,
        placeRepository: _UnusedPlaceRepository(),
        uploadRepository: uploads,
        initialTarget: cafe,
        photoPicker: _FakePicker(picked),
        clock: () => DateTime(2026, 11, 10),
      );

  setUp(() {
    uploads = _FakeUploadRepository();
    stories = _FakeStoryRepository();
  });

  test('글 없이 사진만 있어도 보관할 수 있다', () async {
    final write = build(['a.jpg']);
    expect(write.canSubmit, isFalse);
    await write.pickPhotos();
    expect(write.canSubmit, isTrue);
  });

  test('보관하면 사진을 올리고 고른 순서대로 photoUrls 로 보낸다 (글이 없으면 content 생략)', () async {
    final write = build(['a.jpg', 'b.png']);
    await write.pickPhotos();
    stories.results.add(const Err(serverDown)); // 저장 결과는 이 테스트의 관심 밖

    await write.submit();

    expect(uploads.calls, [
      ['a.jpg', 'b.png'],
    ]);
    final body = stories.requests.single.toJson();
    expect(body['photoUrls'], ['https://cdn/stories/a.jpg', 'https://cdn/stories/b.png']);
    expect(body.containsKey('content'), isFalse);
  });

  test('업로드가 실패하면 기록을 저장하지 않고 실패를 보여준다', () async {
    final write = build(['a.jpg']);
    await write.pickPhotos();
    uploads.reply = (_) => const Err(PhotoFailure('이 사진 형식은 올릴 수 없어요'));

    expect(await write.submit(), isNull);
    expect(stories.requests, isEmpty);
    expect(write.failure, isA<PhotoFailure>());
    expect(write.isSubmitting, isFalse);
    expect(write.isUploadingPhotos, isFalse);
  });

  test('저장이 실패해 다시 보관하면 이미 올라간 사진은 다시 올리지 않는다', () async {
    final write = build(['a.jpg']);
    await write.pickPhotos();
    stories.results.addAll(const [Err(serverDown), Err(serverDown)]);

    await write.submit();
    await write.submit();

    expect(uploads.calls.length, 1);
    expect(stories.requests.length, 2);
    expect(stories.requests.last.photoUrls, ['https://cdn/stories/a.jpg']);
  });

  test('사진이 없으면 업로드를 부르지 않는다', () async {
    final write = build(const [])..setContent('방학식 날');
    stories.results.add(const Err(serverDown));
    await write.submit();
    expect(uploads.calls, isEmpty);
    expect(stories.requests.single.toJson().containsKey('photoUrls'), isFalse);
  });
}
