import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yeongcheon_map/ui/widgets/split_flap/flap_digit_wheel.dart';

// 숫자판 한 칸 조작: 탭 = 다음, 위로 끌기 = 다음(거리만큼), 아래로 끌기 = 이전, 길게 누르기 = X
void main() {
  Future<List<String>> pump(WidgetTester tester, String initial, {List<String>? symbols}) async {
    final changes = <String>[];
    var value = initial;
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: Center(
          child: StatefulBuilder(
            builder: (context, setState) => FlapDigitWheel(
              value: value,
              symbols: symbols ?? const ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'X'],
              onChanged: (next) {
                changes.add(next);
                setState(() => value = next);
              },
            ),
          ),
        ),
      ),
    ));
    return changes;
  }

  testWidgets('탭하면 다음 글자 (9 다음은 X, X 다음은 0)', (tester) async {
    final changes = await pump(tester, '9');
    await tester.tap(find.byType(FlapDigitWheel));
    await tester.pumpAndSettle();
    await tester.tap(find.byType(FlapDigitWheel));
    await tester.pumpAndSettle();
    expect(changes, ['X', '0']);
  });

  testWidgets('위로 끌면 끈 거리만큼 앞으로', (tester) async {
    final changes = await pump(tester, '1');
    // 16px 당 1칸. 처음 손가락 흔들림 구간(touch slop)은 빼고 세므로 넉넉히 100px 끈다 → 여러 칸
    await tester.drag(find.byType(FlapDigitWheel), const Offset(0, -100));
    await tester.pumpAndSettle();
    expect(changes.first, '2');
    expect(changes.length, greaterThanOrEqualTo(2));
    expect(int.parse(changes.last), greaterThan(2));
  });

  testWidgets('아래로 끌면 뒤로 (0 이전은 X)', (tester) async {
    final changes = await pump(tester, '0');
    await tester.drag(find.byType(FlapDigitWheel), const Offset(0, 40));
    await tester.pumpAndSettle();
    expect(changes.first, 'X');
  });

  testWidgets('길게 누르면 바로 X', (tester) async {
    final changes = await pump(tester, '7');
    await tester.longPress(find.byType(FlapDigitWheel));
    await tester.pumpAndSettle();
    expect(changes, ['X']);
  });

  testWidgets('symbols 로 좁히면 그 안에서만 돈다 (월 첫째: 0, 1, X)', (tester) async {
    final changes = await pump(tester, '1', symbols: const ['0', '1', 'X']);
    for (var i = 0; i < 3; i++) {
      await tester.tap(find.byType(FlapDigitWheel));
      await tester.pumpAndSettle();
    }
    expect(changes, ['X', '0', '1']);
  });
}
