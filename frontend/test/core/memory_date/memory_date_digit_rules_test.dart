import 'package:flutter_test/flutter_test.dart';
import 'package:yeongcheon_map/core/memory_date/memory_date_digit_rules.dart';
import 'package:yeongcheon_map/core/memory_date/memory_date_pattern.dart';

MemoryDatePattern p(String text) => MemoryDatePattern.tryParse(text)!;

void main() {
  group('allowedSymbolsAt — 월·일 상한선', () {
    test('연도 칸은 제한 없음', () {
      expect(allowedSymbolsAt(p('XXXX.XX.XX'), 0), ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'X']);
    });

    test('월 첫째: 0, 1, X', () {
      expect(allowedSymbolsAt(p('1995.XX.XX'), 4), ['0', '1', 'X']);
    });

    test('월 둘째: 첫째에 따라 01~09 / 10~12 / 모름이면 전부', () {
      expect(allowedSymbolsAt(p('1995.0X.XX'), 5), ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'X']);
      expect(allowedSymbolsAt(p('1995.1X.XX'), 5), ['0', '1', '2', 'X']);
      expect(allowedSymbolsAt(p('1995.XX.XX'), 5).length, 11);
    });

    test('일 첫째: 0~3, X', () {
      expect(allowedSymbolsAt(p('1995.07.XX'), 6), ['0', '1', '2', '3', 'X']);
    });

    test('일 둘째: 첫째 0 → 1~9, 3 → 0~1, 2 → 0~9', () {
      expect(allowedSymbolsAt(p('1995.07.0X'), 7).first, '1');
      expect(allowedSymbolsAt(p('1995.07.3X'), 7), ['0', '1', 'X']);
      expect(allowedSymbolsAt(p('1995.07.2X'), 7).length, 11);
    });
  });

  group('clampMonthAndDay — 첫째 자리 변경으로 범위를 벗어나면 둘째 자리를 맞춤', () {
    test('19월 → 12월, 00월 → 01월', () {
      expect(clampMonthAndDay(p('1995.19.XX')).toString(), '1995.12.XX');
      expect(clampMonthAndDay(p('1995.00.XX')).toString(), '1995.01.XX');
    });

    test('39일 → 31일, 00일 → 01일', () {
      expect(clampMonthAndDay(p('1995.07.39')).toString(), '1995.07.31');
      expect(clampMonthAndDay(p('1995.07.00')).toString(), '1995.07.01');
    });

    test('한쪽이 X 이거나 범위 안이면 그대로', () {
      for (final text in ['1995.1X.XX', '1995.X9.XX', '1995.12.31', '1995.07.3X']) {
        expect(clampMonthAndDay(p(text)).toString(), text);
      }
    });
  });
}
