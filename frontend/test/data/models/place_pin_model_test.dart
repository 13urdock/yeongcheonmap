import 'package:flutter_test/flutter_test.dart';
import 'package:yeongcheon_map/data/models/paged_result_model.dart';
import 'package:yeongcheon_map/data/models/place_pin_model.dart';
import 'package:yeongcheon_map/data/models/story_model.dart';

// API 명세 v4 예시 JSON 이 그대로 파싱되는지
void main() {
  const pinJson = {
    'placeId': 'p1',
    'name': '○○카페',
    'usageType': '카페',
    'latitude': 35.9733,
    'longitude': 128.9386,
    'sinceYear': 2019,
    'thumbnailUrl': null,
    'storyCount': 12,
  };

  test('PlacePinModel.fromJson 은 명세 예시를 파싱한다', () {
    final pin = PlacePinModel.fromJson(pinJson);
    expect(pin.name, '○○카페');
    expect(pin.latitude, 35.9733);
    expect(pin.sinceYear, 2019);
    expect(pin.storyCount, 12);
  });

  test('PagedResultModel 은 items/page/size/totalCount 를 읽고 hasMore 를 계산한다', () {
    final paged = PagedResultModel.fromJson(
      {'items': [pinJson], 'page': 1, 'size': 20, 'totalCount': 42},
      PlacePinModel.fromJson,
    );
    expect(paged.items.single.placeId, 'p1');
    expect(paged.hasMore, isTrue);
  });

  test('StoryModel.fromJson 은 memoryDate 객체와 placeNameThen 을 읽는다', () {
    final story = StoryModel.fromJson(const {
      'storyId': 's1',
      'user': {'userId': 'u1', 'name': '홍길동', 'profileUrl': null},
      'placeId': 'p1',
      'eventId': null,
      'memoryDate': {'pattern': '199X.XX.XX', 'from': '1990-01-01', 'to': '1999-12-31', 'yearFrom': 1990, 'yearTo': 1999},
      'placeNameThen': '중앙분식',
      'content': '그때 이 골목엔...',
      'photos': [
        {'storyPhotoId': 'ph1', 'imageUrl': 'https://storage/1.jpg'}
      ],
      'createdAt': '2026-10-10T14:30:00.000Z',
    });
    expect(story.memoryDate.pattern, '199X.XX.XX');
    expect(story.memoryDate.yearTo, 1999);
    expect(story.placeNameThen, '중앙분식');
    expect(story.photos.single.imageUrl, 'https://storage/1.jpg');
  });
}
