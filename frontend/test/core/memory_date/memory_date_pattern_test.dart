import 'package:flutter_test/flutter_test.dart';
import 'package:yeongcheon_map/core/memory_date/memory_date_label.dart';
import 'package:yeongcheon_map/core/memory_date/memory_date_pattern.dart';

void main() {
  group('MemoryDatePattern', () {
    test('기본값은 XXXX.XX.XX', () {
      final p = MemoryDatePattern.unknown();
      expect(p.toString(), 'XXXX.XX.XX');
      expect(p.isFullyUnknown, isTrue);
      expect(p.isYearUnknown, isTrue);
    });

    test('소문자 x 허용, 형식이 틀리면 null', () {
      expect(MemoryDatePattern.tryParse('1995.0x.1x').toString(), '1995.0X.1X');
      expect(MemoryDatePattern.tryParse('1995-07-15'), isNull);
      expect(MemoryDatePattern.tryParse('1995.7.15'), isNull);
    });

    test('withDigit 은 한 자리만 바꾼 새 값', () {
      final p = MemoryDatePattern.unknown().withDigit(0, '1').withDigit(1, '9').withDigit(2, '9');
      expect(p.toString(), '199X.XX.XX');
      expect(p.year, '199X');
    });
  });

  group('yearGroupLabel', () {
    test('사례', () {
      expect(yearGroupLabel('1995', yearFrom: 1995, yearTo: 1995), '1995년');
      expect(yearGroupLabel('199X', yearFrom: 1990, yearTo: 1999), '1990년대');
      expect(yearGroupLabel('19XX', yearFrom: 1900, yearTo: 1999), '1900년대');
      expect(yearGroupLabel('XXXX', yearFrom: 1800, yearTo: 2026), '연도 미상');
      expect(yearGroupLabel('19X5', yearFrom: 1905, yearTo: 1995), '1905~1995년 중 어느 해');
    });
  });
}
