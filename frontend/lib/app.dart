import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/config/env.dart';
import 'core/network/api_client.dart';
import 'core/network/storage_upload_client.dart';
import 'data/datasources/auth_local_datasource.dart';
import 'data/datasources/auth_remote_datasource.dart';
import 'data/datasources/event_remote_datasource.dart';
import 'data/datasources/place_remote_datasource.dart';
import 'data/datasources/story_remote_datasource.dart';
import 'data/datasources/upload_remote_datasource.dart';
import 'data/repositories/auth_repository.dart';
import 'data/repositories/event_repository.dart';
import 'data/repositories/place_repository.dart';
import 'data/repositories/story_repository.dart';
import 'data/repositories/upload_repository.dart';
import 'providers/auth_provider.dart';
import 'providers/map_provider.dart';
import 'routing/app_router.dart';
import 'routing/app_routes.dart';
import 'ui/theme/retro_theme.dart';

// 앱 루트: 의존성 조립(api_client → datasource → repository) + 앱 전역 provider + 테마·라우팅
// 화면 전용 provider(상세·타임라인·작성·로그인 입력)는 각 화면이 직접 만든다.
class YeongcheonMapApp extends StatefulWidget {
  const YeongcheonMapApp({super.key});

  @override
  State<YeongcheonMapApp> createState() => _YeongcheonMapAppState();
}

class _YeongcheonMapAppState extends State<YeongcheonMapApp> {
  // 의존성은 한 번만 만든다 (build 가 다시 불려도 토큰·세션이 유지되도록)
  late final AuthRepository _authRepository;
  late final PlaceRepository _placeRepository;
  late final EventRepository _eventRepository;
  late final StoryRepository _storyRepository;
  late final UploadRepository _uploadRepository;

  @override
  void initState() {
    super.initState();
    // api_client ↔ auth_repository 연결: 토큰 읽기·401 시 갱신은 콜백으로만 (core 가 data 를 import 하지 않게)
    final apiClient = ApiClient(
      baseUrl: Env.apiBaseUrl,
      accessTokenProvider: () => _authRepository.accessToken,
      tokenRefresher: () => _authRepository.refreshSession(),
    );
    _authRepository = AuthRepository(remote: AuthRemoteDataSource(apiClient), local: AuthLocalDataSource());
    _placeRepository = PlaceRepository(PlaceRemoteDataSource(apiClient));
    _eventRepository = EventRepository(EventRemoteDataSource(apiClient));
    _storyRepository = StoryRepository(StoryRemoteDataSource(apiClient));
    _uploadRepository = UploadRepository(UploadRemoteDataSource(apiClient, StorageUploadClient()));
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider.value(value: _authRepository),
        Provider.value(value: _placeRepository),
        Provider.value(value: _eventRepository),
        Provider.value(value: _storyRepository),
        Provider.value(value: _uploadRepository),
        ChangeNotifierProvider(create: (_) => AuthProvider(authRepository: _authRepository)..restore()),
        ChangeNotifierProvider(
          create: (_) => MapProvider(placeRepository: _placeRepository, eventRepository: _eventRepository)..load(),
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
