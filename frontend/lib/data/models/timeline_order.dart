// 타임라인 정렬 방향 (GET .../stories?order=asc|desc). 기억 날짜 기준이며 작성일 순이 아니다.
enum TimelineOrder {
  asc('asc'),
  desc('desc');

  const TimelineOrder(this.query);

  /// 쿼리 문자열 값
  final String query;
}
