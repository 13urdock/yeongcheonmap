import 'package:flutter/material.dart';

import '../ui/screens/event_detail/event_detail_screen.dart';
import '../ui/screens/map/map_screen.dart';
import '../ui/screens/place_detail/place_detail_screen.dart';
import '../ui/screens/story_write/story_write_screen.dart';
import 'app_routes.dart';
import 'route_args/event_detail_args.dart';
import 'route_args/place_detail_args.dart';
import 'route_args/story_write_args.dart';

// 라우트 이름 → 화면 생성. 새 화면은 여기에만 추가한다.
class AppRouter {
  AppRouter._();

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    final args = settings.arguments;
    return switch (settings.name) {
      AppRoutes.map => _page(settings, const MapScreen()),
      AppRoutes.placeDetail when args is PlaceDetailArgs => _page(settings, PlaceDetailScreen(args: args)),
      AppRoutes.eventDetail when args is EventDetailArgs => _page(settings, EventDetailScreen(args: args)),
      AppRoutes.storyWrite when args is StoryWriteArgs => _page(settings, StoryWriteScreen(args: args)),
      _ => _page(settings, Scaffold(body: Center(child: Text('잘못된 경로: ${settings.name}')))),
    };
  }

  static Route<T> _page<T>(RouteSettings settings, Widget screen) {
    return MaterialPageRoute<T>(builder: (_) => screen, settings: settings);
  }
}
