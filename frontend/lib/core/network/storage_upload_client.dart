import 'dart:async';
import 'dart:io';
import 'dart:typed_data';

import 'api_exception.dart';

// 외부 사진 저장소(Ncloud Storage)에 프리사인 주소로 파일 바이트를 PUT 한다 (API 명세 §8).
// api_client 를 거치지 않는 유일한 호출: 우리 서버가 아니라 envelope 이 없고, 로그인 토큰을 붙이면 안 된다.
// 서명에 포함된 헤더(Content-Type)를 글자 그대로 보내야 해서 dart:io HttpClient 로 직접 보낸다
// (값이 조금만 달라도 저장소가 403 으로 거절).
class StorageUploadClient {
  StorageUploadClient({HttpClient? httpClient})
      : _http = httpClient ?? (HttpClient()..connectionTimeout = const Duration(seconds: 10));

  final HttpClient _http;

  static const Duration _timeout = Duration(seconds: 60);

  Future<void> put({
    required String url,
    required String method,
    required Map<String, String> headers,
    required Uint8List bytes,
  }) async {
    final int status;
    try {
      final request = await _http.openUrl(method, Uri.parse(url));
      headers.forEach((name, value) => request.headers.set(name, value, preserveHeaderCase: true));
      request.contentLength = bytes.length;
      request.add(bytes);
      final response = await request.close().timeout(_timeout);
      status = response.statusCode;
      await response.drain<void>();
    } on TimeoutException {
      throw const NetworkException('사진을 올리는 데 너무 오래 걸려요. 인터넷 연결을 확인하고 다시 시도해 주세요.');
    } on IOException {
      throw const NetworkException('사진 저장소에 연결할 수 없어요. 인터넷 연결을 확인해 주세요.');
    }
    if (status < 200 || status >= 300) {
      throw ApiException(
        code: 'STORAGE_UPLOAD_FAILED',
        message: '사진을 올리지 못했어요 (저장소 응답 $status). 다시 시도해 주세요.',
        statusCode: status,
      );
    }
  }
}
