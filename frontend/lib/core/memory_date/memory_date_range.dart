import 'memory_date_constants.dart';
import 'memory_date_pattern.dart';

// 기억 날짜 패턴 → 실제로 가능한 날짜 범위. 백엔드 memory-date-range.ts 와 같은 규칙.
// - X 자리를 0~9로 채워 만든 "실제 달력 날짜" 중 [1800-01-01, 오늘] 안의 것만 후보
// - from = 가장 이른 후보, to = 가장 늦은 후보. 후보가 없으면 null
// 숫자판에서 "가능한 날짜 없음"을 즉시 보여주는 데 쓴다(최종 판단은 서버).

class MemoryDateRange {
  const MemoryDateRange({required this.from, required this.to, required this.yearFrom, required this.yearTo});

  final DateTime from; // UTC 자정
  final DateTime to;
  final int yearFrom;
  final int yearTo;

  bool get isSingleDay => from == to;
}

MemoryDateRange? computeMemoryDateRange(MemoryDatePattern pattern, DateTime today) {
  final todayDate = DateTime.utc(today.year, today.month, today.day);
  final years = [
    for (var y = memoryDateMinYear; y <= today.year; y++)
      if (matchesDigits(pattern.year, y)) y,
  ];
  final months = [for (var m = 1; m <= 12; m++) if (matchesDigits(pattern.month, m)) m];
  final days = [for (var d = 1; d <= 31; d++) if (matchesDigits(pattern.day, d)) d];
  if (years.isEmpty || months.isEmpty || days.isEmpty) return null;

  final from = _findFirstValid(years, months, days, todayDate);
  final to = _findFirstValid(years.reversed, months.reversed, days.reversed, todayDate);
  if (from == null || to == null) return null;

  return MemoryDateRange(from: from, to: to, yearFrom: years.first, yearTo: years.last);
}

// 주어진 순서대로 훑어 처음 만나는 유효 날짜 (연→월→일 중첩이라 곧 시간순)
DateTime? _findFirstValid(Iterable<int> years, Iterable<int> months, Iterable<int> days, DateTime today) {
  for (final y in years) {
    for (final m in months) {
      for (final d in days) {
        if (d > _daysInMonth(y, m)) continue;
        final date = DateTime.utc(y, m, d);
        if (!date.isAfter(today)) return date;
      }
    }
  }
  return null;
}

// 다음 달 0일 = 이번 달 마지막 날 (윤년 자동 반영)
int _daysInMonth(int year, int month) => DateTime.utc(year, month + 1, 0).day;
