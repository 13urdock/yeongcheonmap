import 'memory_date_constants.dart';
import 'memory_date_pattern.dart';

// 숫자판 칸별로 돌 수 있는 글자 (연도·월·일 상한선). 순수 함수.
// - 연도 4칸: 왼쪽 자리들을 고정했을 때 [memoryDateMinYear, 올해] 안에 들어갈 수 있는 숫자만 (+X)
//     예) 올해 2026 → 천: 1, 2 / 천=2 → 백: 0 / 20 → 십: 0~2 / 202 → 일: 0~6
//     왼쪽이 X 면 그 자리는 모든 값으로 본다 (X995 → 1995 가능)
// - 월 첫째: 0, 1, X          · 월 둘째: 첫째가 0이면 1~9, 1이면 0~2, X면 0~9  (+X)
// - 일 첫째: 0, 1, 2, 3, X    · 일 둘째: 첫째가 0이면 1~9, 1·2면 0~9, 3이면 0~1, X면 0~9  (+X)
// 달마다 다른 마지막 날(2월 30일 등)은 칸 단위로 막지 않는다 → memory_date_range 가 "가능한 날짜 없음"으로 안내.

const int _yearDigitCount = 4;
const int _monthTensIndex = 4;
const int _dayTensIndex = 6;
const int _maxMonth = 12;
const int _maxDay = 31;

/// index 칸(0~7)이 지금 패턴에서 돌 수 있는 글자들 (숫자 오름차순, 마지막에 X)
List<String> allowedSymbolsAt(MemoryDatePattern pattern, int index, {required int currentYear}) {
  if (index < _yearDigitCount) return _yearSymbols(pattern, index, currentYear);
  return switch (index) {
    _monthTensIndex => _tensSymbols(_maxMonth),
    5 => _onesSymbols(pattern.digits[_monthTensIndex], _maxMonth),
    _dayTensIndex => _tensSymbols(_maxDay),
    7 => _onesSymbols(pattern.digits[_dayTensIndex], _maxDay),
    _ => flapSymbols,
  };
}

/// 한 자리를 바꾼 뒤 나머지 자리를 규칙에 맞게 정리한다.
/// - 연도: 왼쪽 자리 변경으로 오른쪽 자리가 불가능해지면 그 자리는 X 로 (예: 1995 에서 천을 2로 → 2XXX)
/// - 월·일: 첫째 자리 변경으로 범위를 벗어나면 둘째 자리를 맞춘다 (예: 09월 → 첫째 1 → 12월)
MemoryDatePattern normalizeDigits(MemoryDatePattern pattern, {required int currentYear}) {
  return clampMonthAndDay(clearImpossibleYearDigits(pattern, currentYear: currentYear));
}

/// 연도 칸을 왼쪽부터 확인해, 올 수 없는 숫자는 X 로 바꾼다.
MemoryDatePattern clearImpossibleYearDigits(MemoryDatePattern pattern, {required int currentYear}) {
  var result = pattern;
  for (var i = 0; i < _yearDigitCount; i++) {
    final digit = result.digits[i];
    if (digit == unknownDigit) continue;
    if (!_yearSymbols(result, i, currentYear).contains(digit)) result = result.withDigit(i, unknownDigit);
  }
  return result;
}

/// 첫째 자리를 바꿔 월·일이 범위를 벗어나면 둘째 자리를 맞춘다.
/// 예: 09월에서 첫째를 1로 → 19월이 아니라 12월 / 10월에서 첫째를 0으로 → 00월이 아니라 01월
MemoryDatePattern clampMonthAndDay(MemoryDatePattern pattern) {
  final monthFixed = _clampPair(pattern, _monthTensIndex, _maxMonth);
  return _clampPair(monthFixed, _dayTensIndex, _maxDay);
}

// 왼쪽 자리(0..index-1)는 지금 값, index 자리는 후보 d, 오른쪽은 X 로 두고 가능한 해가 하나라도 있으면 허용
List<String> _yearSymbols(MemoryDatePattern pattern, int index, int currentYear) {
  final left = pattern.year.substring(0, index);
  final right = unknownDigit * (_yearDigitCount - index - 1);
  return [
    for (var d = 0; d <= 9; d++)
      if (_anyYearMatches('$left$d$right', currentYear)) '$d',
    unknownDigit,
  ];
}

bool _anyYearMatches(String yearPattern, int currentYear) {
  for (var y = memoryDateMinYear; y <= currentYear; y++) {
    if (matchesDigits(yearPattern, y)) return true;
  }
  return false;
}

List<String> _tensSymbols(int max) => [for (var t = 0; t <= max ~/ 10; t++) '$t', unknownDigit];

List<String> _onesSymbols(String tens, int max) {
  if (tens == unknownDigit) return flapSymbols;
  final t = int.parse(tens);
  return [
    for (var o = 0; o <= 9; o++)
      if (t * 10 + o >= 1 && t * 10 + o <= max) '$o',
    unknownDigit,
  ];
}

MemoryDatePattern _clampPair(MemoryDatePattern pattern, int tensIndex, int max) {
  final tens = pattern.digits[tensIndex];
  final ones = pattern.digits[tensIndex + 1];
  if (tens == unknownDigit || ones == unknownDigit) return pattern;

  final value = int.parse('$tens$ones');
  if (value >= 1 && value <= max) return pattern;

  final fixed = (value < 1 ? 1 : max).toString().padLeft(2, '0');
  return pattern.withDigit(tensIndex, fixed[0]).withDigit(tensIndex + 1, fixed[1]);
}
