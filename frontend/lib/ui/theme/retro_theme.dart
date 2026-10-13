import 'package:flutter/material.dart';

import 'retro_colors.dart';
import 'retro_text_styles.dart';

// 앱 전체 ThemeData — 종이 바탕, 먹색 글씨, 각진 모서리, 그림자 최소화.
class RetroTheme {
  RetroTheme._();

  static const double radius = 4;

  static ThemeData build() {
    final scheme = ColorScheme.fromSeed(
      seedColor: RetroColors.ink,
      brightness: Brightness.light,
    ).copyWith(
      surface: RetroColors.paper,
      onSurface: RetroColors.ink,
      primary: RetroColors.ink,
      onPrimary: RetroColors.paper,
      secondary: RetroColors.stamp,
      onSecondary: RetroColors.paper,
      error: RetroColors.stamp,
    );

    const shape = RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(radius)));

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: RetroColors.paper,
      fontFamily: RetroTextStyles.serif,
      appBarTheme: const AppBarTheme(
        backgroundColor: RetroColors.paper,
        foregroundColor: RetroColors.ink,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: RetroTextStyles.title,
        shape: Border(bottom: BorderSide(color: RetroColors.ink, width: 1.5)),
      ),
      cardTheme: const CardThemeData(
        color: RetroColors.paper,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          side: BorderSide(color: RetroColors.paperLine),
          borderRadius: BorderRadius.all(Radius.circular(radius)),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: RetroColors.ink,
          foregroundColor: RetroColors.paper,
          shape: shape,
          textStyle: const TextStyle(fontFamily: RetroTextStyles.mono, fontWeight: FontWeight.w700, letterSpacing: 1.5),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: RetroColors.ink,
          side: const BorderSide(color: RetroColors.ink),
          shape: shape,
          textStyle: const TextStyle(fontFamily: RetroTextStyles.mono, fontWeight: FontWeight.w700),
        ),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: RetroColors.ink,
        foregroundColor: RetroColors.paper,
        shape: shape,
      ),
      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: RetroColors.paperDeep,
        border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(radius))),
        enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: RetroColors.paperLine),
          borderRadius: BorderRadius.all(Radius.circular(radius)),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(color: RetroColors.ink, width: 1.5),
          borderRadius: BorderRadius.all(Radius.circular(radius)),
        ),
      ),
      dividerTheme: const DividerThemeData(color: RetroColors.paperLine, thickness: 1),
    );
  }
}
