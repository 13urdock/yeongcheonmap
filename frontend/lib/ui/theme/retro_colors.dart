import 'package:flutter/painting.dart';

// 레트로 아카이브 팔레트 (Sys_06). 화면에서는 이 토큰만 쓴다.
// 바탕은 바랜 종이, 글씨는 먹색, 숫자판은 공항 출발 안내판의 검은 판 + 흰 글자.
class RetroColors {
  RetroColors._();

  // 종이
  static const Color paper = Color(0xFFF3EBDD);
  static const Color paperDeep = Color(0xFFE8DCC6);
  static const Color paperLine = Color(0xFFD6C7AC);

  // 먹
  static const Color ink = Color(0xFF2B2622);
  static const Color inkMuted = Color(0xFF7A6F63);

  // 숫자판
  static const Color flapBody = Color(0xFF1E1E1E);
  static const Color flapBodyLight = Color(0xFF2C2C2C);
  static const Color flapHinge = Color(0xFF0A0A0A);
  static const Color flapGlyph = Color(0xFFF2EFE6);
  static const Color flapUnknown = Color(0xFFE0A33A); // X(모름) 글자는 호박색
  static const Color flapFrame = Color(0xFF111111);

  // 도장·강조
  static const Color stamp = Color(0xFFB5452F);
  static const Color stampFaded = Color(0x99B5452F);
  static const Color festival = Color(0xFFC77B2A); // 축제 핀
}
