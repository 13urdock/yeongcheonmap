import '../../../data/models/story_model.dart';

// 타임라인의 연도 묶음 하나: 같은 (yearFrom, yearTo) 를 가진 연속된 기록들.
class TimelineYearGroup {
  const TimelineYearGroup({
    required this.yearPattern,
    required this.yearFrom,
    required this.yearTo,
    required this.stories,
  });

  /// 머리글 숫자판에 보일 연도 4자리 ("1995", "199X", "XXXX")
  final String yearPattern;
  final int yearFrom;
  final int yearTo;
  final List<StoryModel> stories;
}
