import 'memory_date_constants.dart';
import 'memory_date_pattern.dart';

// 숫자판 칸별로 돌 수 있는 글자 (월·일 상한선). 순수 함수.
// - 연도 4칸: 0~9, X (제한 없음)
// - 월 첫째: 0, 1, X          · 월 둘째: 첫째가 0이면 1~9, 1이면 0~2, X면 0~9  (+X)
// - 일 첫째: 0, 1, 2, 3, X    · 일 둘째: 첫째가 0이면 1~9, 1·2면 0~9, 3이면 0~1, X면 0~9  (+X)
// 달마다 다른 마지막 날(2월 30일 등)은 칸 단위로 막지 않는다 → memory_date_range 가 "가능한 날짜 없음"으로 안내.

const int _monthTensIndex = 4;
const int _dayTensIndex = 6;
const int _maxMonth = 12;
const int _maxDay = 31;

/// index 칸(0~7)이 지금 패턴에서 돌 수 있는 글자들 (숫자 오름차순, 마지막에 X)
List<String> allowedSymbolsAt(MemoryDatePattern pattern, int index) {
  return switch (index) {
    _monthTensIndex => _tensSymbols(_maxMonth),
    5 => _onesSymbols(pattern.digits[_monthTensIndex], _maxMonth),
    _dayTensIndex => _tensSymbols(_maxDay),
    7 => _onesSymbols(pattern.digits[_dayTensIndex], _maxDay),
    _ => flapSymbols,
  };
}

/// 첫째 자리를 바꿔 월·일이 범위를 벗어나면 둘째 자리를 맞춘다.
/// 예: 09월에서 첫째를 1로 → 19월이 아니라 12월 / 10월에서 첫째를 0으로 → 00월이 아니라 01월
MemoryDatePattern clampMonthAndDay(MemoryDatePattern pattern) {
  final monthFixed = _clampPair(pattern, _monthTensIndex, _maxMonth);
  return _clampPair(monthFixed, _dayTensIndex, _maxDay);
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
