import '../../../data/models/story_model.dart';
import 'timeline_year_group.dart';

/// 서버가 정렬해 준 기록 목록을 순서 그대로 연도 묶음으로 자른다.
/// 연속된 기록의 (yearFrom, yearTo) 가 같으면 한 묶음. (정렬 규칙상 같은 묶음은 항상 붙어서 온다 — ERD v5 §3)
List<TimelineYearGroup> groupStoriesByYear(List<StoryModel> stories) {
  final groups = <TimelineYearGroup>[];
  var current = <StoryModel>[];

  void close() {
    if (current.isEmpty) return;
    final first = current.first.memoryDate;
    groups.add(TimelineYearGroup(
      yearPattern: first.pattern.substring(0, 4),
      yearFrom: first.yearFrom,
      yearTo: first.yearTo,
      stories: List.unmodifiable(current),
    ));
    current = <StoryModel>[];
  }

  for (final story in stories) {
    final last = current.isEmpty ? null : current.last.memoryDate;
    final sameGroup = last != null &&
        last.yearFrom == story.memoryDate.yearFrom &&
        last.yearTo == story.memoryDate.yearTo;
    if (!sameGroup) close();
    current.add(story);
  }
  close();
  return groups;
}
