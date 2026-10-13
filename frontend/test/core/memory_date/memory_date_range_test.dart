import 'package:flutter_test/flutter_test.dart';
import 'package:yeongcheon_map/core/memory_date/memory_date_pattern.dart';
import 'package:yeongcheon_map/core/memory_date/memory_date_range.dart';

// 백엔드 src/common/memory-date/memory-date-range.spec.ts 와 같은 사례 표. 규칙이 바뀌면 두 곳을 같이 고친다.
final today = DateTime(2026, 10, 10);
DateTime d(int y, int m, int day) => DateTime.utc(y, m, day);

MemoryDateRange? range(String text) => computeMemoryDateRange(MemoryDatePattern.tryParse(text)!, today);

void main() {
  test('완전한 날짜는 그 하루', () {
    final r = range('1995.07.15')!;
    expect([r.from, r.to], [d(1995, 7, 15), d(1995, 7, 15)]);
    expect([r.yearFrom, r.yearTo], [1995, 1995]);
  });

  test('월·일 모름 → 그 해 전체', () {
    final r = range('1995.XX.XX')!;
    expect([r.from, r.to], [d(1995, 1, 1), d(1995, 12, 31)]);
  });

  test('연도 끝자리 모름 → 1990년대', () {
    final r = range('199X.XX.XX')!;
    expect([r.from, r.to, r.yearFrom, r.yearTo], [d(1990, 1, 1), d(1999, 12, 31), 1990, 1999]);
  });

  test('중간 자리 모름 → 1905 … 1995', () {
    final r = range('19X5.XX.XX')!;
    expect([r.from, r.to], [d(1905, 1, 1), d(1995, 12, 31)]);
  });

  test('월 0X, 일 1X → 1~9월, 10~19일', () {
    final r = range('1995.0X.1X')!;
    expect([r.from, r.to], [d(1995, 1, 10), d(1995, 9, 19)]);
  });

  test('월 1X → 10~12월만', () {
    final r = range('2001.1X.XX')!;
    expect([r.from, r.to], [d(2001, 10, 1), d(2001, 12, 31)]);
  });

  test('일 3X: 2월엔 불가, 4월은 30일까지', () {
    expect(range('2001.02.3X'), isNull);
    expect(range('2001.04.3X')!.to, d(2001, 4, 30));
  });

  test('윤년 2월 29일', () {
    expect(range('2001.02.29'), isNull);
    expect(range('2000.02.29'), isNotNull);
    final r = range('200X.02.29')!;
    expect([r.from, r.to], [d(2000, 2, 29), d(2008, 2, 29)]);
  });

  test('존재하지 않는 월/일', () {
    expect(range('1995.00.XX'), isNull);
    expect(range('1995.13.XX'), isNull);
    expect(range('1995.XX.00'), isNull);
  });

  test('미래 불가, 올해는 오늘까지', () {
    expect(range('2027.XX.XX'), isNull);
    expect(range('2026.11.XX'), isNull);
    expect(range('2026.XX.XX')!.to, d(2026, 10, 10));
    expect(range('202X.XX.XX')!.to, d(2026, 10, 10));
  });

  test('1800년 이전은 후보에서 제외', () {
    expect(range('1799.XX.XX'), isNull);
    expect(range('17XX.XX.XX'), isNull);
    expect(range('1XXX.XX.XX')!.from, d(1800, 1, 1));
  });

  test('전부 모름 → 1800-01-01 ~ 오늘', () {
    final r = range('XXXX.XX.XX')!;
    expect([r.from, r.to], [d(1800, 1, 1), d(2026, 10, 10)]);
  });
}
