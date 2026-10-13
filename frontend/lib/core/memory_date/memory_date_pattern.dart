import 'memory_date_constants.dart';

// 기억 날짜 패턴 YYYY.MM.DD (8자리 각각 '0'~'9' 또는 'X'). 불변 값 객체.
// 가능한 날짜인지는 memory_date_range.dart 가 판단한다.
class MemoryDatePattern {
  MemoryDatePattern._(List<String> digits) : digits = List.unmodifiable(digits);

  /// 아무것도 모를 때: XXXX.XX.XX
  factory MemoryDatePattern.unknown() =>
      MemoryDatePattern._(List.filled(memoryDateDigitCount, unknownDigit));

  /// "1995.0x.1x" 같은 문자열 → 패턴. 형식이 틀리면 null.
  static MemoryDatePattern? tryParse(String text) {
    final normalized = text.trim().replaceAll('x', unknownDigit);
    if (!memoryDateRegex.hasMatch(normalized)) return null;
    return MemoryDatePattern._(normalized.replaceAll('.', '').split(''));
  }

  /// 0~3 연도, 4~5 월, 6~7 일
  final List<String> digits;

  String get year => digits.sublist(0, 4).join();
  String get month => digits.sublist(4, 6).join();
  String get day => digits.sublist(6, 8).join();

  bool get isYearUnknown => year == unknownDigit * 4;
  bool get isFullyUnknown => digits.every((d) => d == unknownDigit);

  /// index 자리만 바꾼 새 패턴
  MemoryDatePattern withDigit(int index, String digit) {
    final next = List<String>.of(digits);
    next[index] = digit;
    return MemoryDatePattern._(next);
  }

  /// 서버로 보내는 문자열 형태
  @override
  String toString() => '$year.$month.$day';

  @override
  bool operator ==(Object other) => other is MemoryDatePattern && other.toString() == toString();

  @override
  int get hashCode => toString().hashCode;
}

/// 패턴의 각 자리가 숫자 n 과 맞는가. 예: matchesDigits('19X5', 1995) == true
bool matchesDigits(String pattern, int n) {
  final text = n.toString().padLeft(pattern.length, '0');
  if (text.length != pattern.length) return false;
  for (var i = 0; i < pattern.length; i++) {
    if (pattern[i] != unknownDigit && pattern[i] != text[i]) return false;
  }
  return true;
}
