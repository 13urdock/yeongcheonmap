import 'memory_date_constants.dart';
import 'memory_date_range.dart';

// 기억 날짜를 사람이 읽는 말로. (숫자판 옆 보조 설명, 연도 묶음 머리글)

/// 연도 패턴 → 묶음 이름. 예: 1995 → "1995년", 199X → "1990년대", XXXX → "연도 미상"
String yearGroupLabel(String yearPattern, {required int yearFrom, required int yearTo}) {
  if (!yearPattern.contains(unknownDigit)) return '$yearPattern년';
  if (yearPattern == unknownDigit * 4) return '연도 미상';

  final trailing = yearPattern.length - yearPattern.replaceAll(RegExp('$unknownDigit+\$'), '').length;
  final knownPrefix = yearPattern.substring(0, yearPattern.length - trailing);
  final onlyTrailingUnknown = !knownPrefix.contains(unknownDigit);
  if (onlyTrailingUnknown && trailing == 1) return '${knownPrefix}0년대';
  if (onlyTrailingUnknown && trailing == 2) return '${knownPrefix}00년대';
  return '$yearFrom~$yearTo년 중 어느 해';
}

/// 가능한 날짜 범위 → "1995.07.15" 또는 "1995.01.10 ~ 1995.09.19"
String rangeLabel(MemoryDateRange range) {
  final from = _dotted(range.from);
  return range.isSingleDay ? from : '$from ~ ${_dotted(range.to)}';
}

String _dotted(DateTime d) =>
    '${d.year.toString().padLeft(4, '0')}.${d.month.toString().padLeft(2, '0')}.${d.day.toString().padLeft(2, '0')}';
