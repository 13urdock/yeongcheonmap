import 'package:dio/dio.dart';

import 'api_exception.dart';

/// 로그인 후 access 토큰을 돌려주는 콜백. auth 구현 전에는 null(비인증 호출만).
typedef AccessTokenProvider = String? Function();

// 모든 HTTP 호출이 거치는 단 하나의 클라이언트.
// 역할: base URL·타임아웃·토큰 부착, 응답 envelope 해석({ success, data } → data / { success, error } → ApiException).
class ApiClient {
  ApiClient({required String baseUrl, AccessTokenProvider? accessTokenProvider})
      : _dio = Dio(
          BaseOptions(
            baseUrl: baseUrl,
            connectTimeout: const Duration(seconds: 10),
            receiveTimeout: const Duration(seconds: 10),
            headers: {'Accept': 'application/json'},
            // 4xx/5xx 도 예외 대신 응답으로 받아 envelope 을 직접 해석한다
            validateStatus: (_) => true,
          ),
        ) {
    _dio.interceptors.add(_AuthHeaderInterceptor(accessTokenProvider));
  }

  final Dio _dio;

  /// GET 요청 → envelope 의 data(Map)를 반환
  Future<Map<String, dynamic>> get(String path, {Map<String, dynamic>? query}) async {
    return _send(() => _dio.get<dynamic>(path, queryParameters: query));
  }

  /// POST 요청 → envelope 의 data(Map)를 반환
  Future<Map<String, dynamic>> post(String path, {Object? body}) async {
    return _send(() => _dio.post<dynamic>(path, data: body));
  }

  Future<Map<String, dynamic>> _send(Future<Response<dynamic>> Function() request) async {
    final Response<dynamic> response;
    try {
      response = await request();
    } on DioException catch (e) {
      throw NetworkException(_networkMessage(e));
    }
    return _unwrapEnvelope(response);
  }

  // Dio 의 영어 기술 메시지 대신, 사용자가 이해할 수 있는 한국어 안내로 바꾼다.
  String _networkMessage(DioException e) {
    return switch (e.type) {
      DioExceptionType.connectionTimeout ||
      DioExceptionType.connectionError =>
        '서버에 연결할 수 없어요. 서버가 켜져 있는지, 주소(API_BASE_URL)가 맞는지 확인해 주세요.',
      DioExceptionType.sendTimeout ||
      DioExceptionType.receiveTimeout =>
        '서버 응답이 너무 늦어요. 잠시 후 다시 시도해 주세요.',
      DioExceptionType.cancel => '요청이 취소됐어요.',
      _ => '네트워크 오류가 발생했어요. 인터넷 연결을 확인해 주세요.',
    };
  }

  Map<String, dynamic> _unwrapEnvelope(Response<dynamic> response) {
    final body = response.data;
    if (body is! Map<String, dynamic>) {
      throw ApiException(
        code: 'INVALID_RESPONSE',
        message: '응답 형식이 올바르지 않습니다',
        statusCode: response.statusCode,
      );
    }

    if (body['success'] == true) {
      final data = body['data'];
      return data is Map<String, dynamic> ? data : <String, dynamic>{};
    }

    final error = body['error'];
    final errorMap = error is Map<String, dynamic> ? error : const <String, dynamic>{};
    throw ApiException(
      code: (errorMap['code'] as String?) ?? 'UNKNOWN',
      message: (errorMap['message'] as String?) ?? '알 수 없는 오류',
      statusCode: response.statusCode,
    );
  }
}

// Authorization: Bearer {accessToken} 부착 (토큰이 있을 때만)
class _AuthHeaderInterceptor extends Interceptor {
  _AuthHeaderInterceptor(this._tokenProvider);

  final AccessTokenProvider? _tokenProvider;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = _tokenProvider?.call();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }
}
