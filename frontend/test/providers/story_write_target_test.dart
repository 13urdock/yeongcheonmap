import 'package:flutter_test/flutter_test.dart';
import 'package:yeongcheon_map/core/network/api_client.dart';
import 'package:yeongcheon_map/core/network/storage_upload_client.dart';
import 'package:yeongcheon_map/data/datasources/place_remote_datasource.dart';
import 'package:yeongcheon_map/data/datasources/story_remote_datasource.dart';
import 'package:yeongcheon_map/data/datasources/upload_remote_datasource.dart';
import 'package:yeongcheon_map/data/models/anchor_target.dart';
import 'package:yeongcheon_map/data/models/timeline_anchor.dart';
import 'package:yeongcheon_map/data/repositories/place_repository.dart';
import 'package:yeongcheon_map/data/repositories/story_repository.dart';
import 'package:yeongcheon_map/data/repositories/upload_repository.dart';
import 'package:yeongcheon_map/providers/story_write_provider.dart';

// 기록할 곳(장소/축제) 규칙: 고르기 전엔 보관 불가, "그때 이름"은 장소일 때만
void main() {
  final client = ApiClient(baseUrl: 'http://localhost');
  StoryWriteProvider build({AnchorTarget? initialTarget}) => StoryWriteProvider(
        storyRepository: StoryRepository(StoryRemoteDataSource(client)),
        placeRepository: PlaceRepository(PlaceRemoteDataSource(client)),
        uploadRepository: UploadRepository(UploadRemoteDataSource(client, StorageUploadClient())),
        initialTarget: initialTarget,
        clock: () => DateTime(2026, 10, 20),
      );

  const cafe = AnchorTarget(anchor: PlaceAnchor('c1'), name: '○○카페');
  const festival = AnchorTarget(anchor: EventAnchor('e1'), name: '영천 축제');

  test('지도에서 바로 들어오면(대상 없음) 글이 있어도 보관할 수 없다', () {
    final write = build()..setContent('방학식 날 떡볶이');
    expect(write.target, isNull);
    expect(write.canSubmit, isFalse);

    write.setTarget(cafe);
    expect(write.canSubmit, isTrue);
  });

  test('장소 상세에서 들어오면 그 장소가 미리 골라져 있다', () {
    final write = build(initialTarget: cafe);
    expect(write.target?.name, '○○카페');
    expect(write.asksPlaceNameThen, isTrue);
  });

  test('축제로 바꾸면 그때 이름 입력란을 숨긴다', () {
    final write = build(initialTarget: cafe)..setTarget(festival);
    expect(write.asksPlaceNameThen, isFalse);
  });
}
