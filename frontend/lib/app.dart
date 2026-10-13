import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/config/env.dart';
import 'core/network/api_client.dart';
import 'data/datasources/event_remote_datasource.dart';
import 'data/datasources/place_remote_datasource.dart';
import 'data/datasources/story_remote_datasource.dart';
import 'data/repositories/event_repository.dart';
import 'data/repositories/place_repository.dart';
import 'data/repositories/story_repository.dart';
import 'providers/map_provider.dart';
import 'routing/app_router.dart';
import 'routing/app_routes.dart';
import 'ui/theme/retro_theme.dart';

// 앱 루트: 의존성 조립(api_client → datasource → repository) + 앱 전역 provider + 테마·라우팅
// 화면 전용 provider(상세·타임라인·작성)는 각 화면이 직접 만든다.
class YeongcheonMapApp extends StatelessWidget {
  const YeongcheonMapApp({super.key});

  @override
  Widget build(BuildContext context) {
    final apiClient = ApiClient(
      baseUrl: Env.apiBaseUrl,
      accessTokenProvider: () => Env.devAccessToken.isEmpty ? null : Env.devAccessToken,
    );
    final placeRepository = PlaceRepository(PlaceRemoteDataSource(apiClient));
    final eventRepository = EventRepository(EventRemoteDataSource(apiClient));
    final storyRepository = StoryRepository(StoryRemoteDataSource(apiClient));

    return MultiProvider(
      providers: [
        Provider.value(value: placeRepository),
        Provider.value(value: eventRepository),
        Provider.value(value: storyRepository),
        ChangeNotifierProvider(
          create: (_) => MapProvider(placeRepository: placeRepository, eventRepository: eventRepository)..load(),
        ),
      ],
      child: MaterialApp(
        title: '영천 기억 지도',
        theme: RetroTheme.build(),
        initialRoute: AppRoutes.map,
        onGenerateRoute: AppRouter.onGenerateRoute,
      ),
    );
  }
}
