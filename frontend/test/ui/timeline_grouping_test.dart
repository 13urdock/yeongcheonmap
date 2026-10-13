import 'package:flutter_test/flutter_test.dart';
import 'package:yeongcheon_map/data/models/story_model.dart';
import 'package:yeongcheon_map/ui/widgets/timeline/timeline_grouping.dart';

StoryModel story(String id, String pattern, int yearFrom, int yearTo) => StoryModel.fromJson({
      'storyId': id,
      'user': {'userId': 'u', 'name': 'n', 'profileUrl': null},
      'placeId': 'p',
      'eventId': null,
      'memoryDate': {'pattern': pattern, 'from': '', 'to': '', 'yearFrom': yearFrom, 'yearTo': yearTo},
      'placeNameThen': null,
      'content': 'c',
      'photos': <dynamic>[],
      'createdAt': '',
    });

void main() {
  test('서버 정렬 순서 그대로 (yearFrom, yearTo) 가 같은 연속 기록을 한 묶음으로', () {
    // 시드 데이터 오름차순과 같은 순서
    final groups = groupStoriesByYear([
      story('1', '1990.05.XX', 1990, 1990),
      story('2', '199X.XX.XX', 1990, 1999),
      story('3', '1995.XX.XX', 1995, 1995),
      story('4', '1995.07.15', 1995, 1995),
      story('5', 'XXXX.XX.XX', 1800, 2026),
    ]);
    expect(groups.map((g) => g.yearPattern), ['1990', '199X', '1995', 'XXXX']);
    expect(groups[2].stories.map((s) => s.storyId), ['3', '4']);
  });

  test('빈 목록 → 빈 묶음', () {
    expect(groupStoriesByYear(const []), isEmpty);
  });
}
