import 'package:flutter/painting.dart';

import 'retro_colors.dart';

// 레트로 글꼴 토큰. 별도 폰트 파일 없이 Android 기본 serif·monospace 계열을 쓴다.
// (전용 폰트를 넣으려면 pubspec fonts 에 등록하고 여기 fontFamily 만 바꾸면 된다)
class RetroTextStyles {
  RetroTextStyles._();

  static const String serif = 'serif';
  static const String mono = 'monospace';

  /// 숫자판 글자 (크기는 위젯이 tile 높이에 맞춰 copyWith)
  static const TextStyle flapGlyph = TextStyle(
    fontFamily: mono,
    fontWeight: FontWeight.w700,
    color: RetroColors.flapGlyph,
    height: 1.0,
  );

  /// 숫자판 아래 YEAR / MONTH / DAY 라벨
  static const TextStyle flapLabel = TextStyle(
    fontFamily: mono,
    fontSize: 11,
    fontWeight: FontWeight.w700,
    letterSpacing: 2,
    color: RetroColors.inkMuted,
  );

  static const TextStyle title = TextStyle(
    fontFamily: serif,
    fontSize: 22,
    fontWeight: FontWeight.w700,
    color: RetroColors.ink,
  );

  static const TextStyle sectionLabel = TextStyle(
    fontFamily: mono,
    fontSize: 12,
    fontWeight: FontWeight.w700,
    letterSpacing: 1.5,
    color: RetroColors.inkMuted,
  );

  static const TextStyle body = TextStyle(fontFamily: serif, fontSize: 15, height: 1.5, color: RetroColors.ink);

  static const TextStyle caption = TextStyle(fontFamily: mono, fontSize: 12, color: RetroColors.inkMuted);

  static const TextStyle stamp = TextStyle(
    fontFamily: mono,
    fontSize: 12,
    fontWeight: FontWeight.w700,
    letterSpacing: 1.2,
    color: RetroColors.stamp,
  );
}
