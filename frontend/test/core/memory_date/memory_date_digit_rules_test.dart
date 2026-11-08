import 'package:flutter_test/flutter_test.dart';
import 'package:yeongcheon_map/core/memory_date/memory_date_digit_rules.dart';
import 'package:yeongcheon_map/core/memory_date/memory_date_pattern.dart';

MemoryDatePattern p(String text) => MemoryDatePattern.tryParse(text)!;

void main() {
  List<String> at(String text, int i) => allowedSymbolsAt(p(text), i, currentYear: 2026);

  group('allowedSymbolsAt — 연도 상한선 (올해 2026, 최소 1800)', () {
    test('천의 자리: 1, 2', () {
      expect(at('XXXX.XX.XX', 0), ['1', '2', 'X']);
    });

    test('백의 자리: 천=2 → 0 / 천=1 → 8, 9 / 천=X → 0, 8, 9', () {
      expect(at('2XXX.XX.XX', 1), ['0', 'X']);
      expect(at('1XXX.XX.XX', 1), ['8', '9', 'X']);
      expect(at('XXXX.XX.XX', 1), ['0', '8', '9', 'X']);
    });

    test('십의 자리: 20 → 0~2 / 19 → 0~9', () {
      expect(at('20XX.XX.XX', 2), ['0', '1', '2', 'X']);
      expect(at('19XX.XX.XX', 2).length, 11);
    });

    test('일의 자리: 202 → 0~6 / 201 → 0~9', () {
      expect(at('202X.XX.XX', 3), ['0', '1', '2', '3', '4', '5', '6', 'X']);
      expect(at('201X.XX.XX', 3).length, 11);
    });
  });

  group('clearImpossibleYearDigits — 왼쪽 변경으로 불가능해진 오른쪽 자리는 X', () {
    MemoryDatePattern clear(String text) => clearImpossibleYearDigits(p(text), currentYear: 2026);

    test('2995 → 2XX5 (백 9 불가 → X, 그 뒤 자리는 바뀐 왼쪽 기준으로 다시 확인)', () {
      expect(clear('2995.XX.XX').toString(), '2XX5.XX.XX');
    });

    test('2029 → 202X, 2035 → 20X5', () {
      expect(clear('2029.XX.XX').toString(), '202X.XX.XX');
      expect(clear('2035.XX.XX').toString(), '20X5.XX.XX');
    });

    test('가능한 연도는 그대로', () {
      for (final text in ['1995.XX.XX', '2026.XX.XX', 'X995.XX.XX', '18XX.XX.XX']) {
        expect(clear(text).toString(), text);
      }
    });
  });

  group('allowedSymbolsAt — 월·일 상한선', () {

    test('월 첫째: 0, 1, X', () {
      expect(at('1995.XX.XX', 4), ['0', '1', 'X']);
    });

    test('월 둘째: 첫째에 따라 01~09 / 10~12 / 모름이면 전부', () {
      expect(at('1995.0X.XX', 5), ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'X']);
      expect(at('1995.1X.XX', 5), ['0', '1', '2', 'X']);
      expect(at('1995.XX.XX', 5).length, 11);
    });

    test('일 첫째: 0~3, X', () {
      expect(at('1995.07.XX', 6), ['0', '1', '2', '3', 'X']);
    });

    test('일 둘째: 첫째 0 → 1~9, 3 → 0~1, 2 → 0~9', () {
      expect(at('1995.07.0X', 7).first, '1');
      expect(at('1995.07.3X', 7), ['0', '1', 'X']);
      expect(at('1995.07.2X', 7).length, 11);
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
