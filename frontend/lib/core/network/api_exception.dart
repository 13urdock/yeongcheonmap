// 서버가 { success:false, error:{ code, message } } 로 응답했을 때 api_client 가 던지는 예외.
// (네트워크 단절 등 서버에 못 닿은 경우는 NetworkException)
class ApiException implements Exception {
  const ApiException({required this.code, required this.message, this.statusCode});

  final String code; // API 명세 v3 에러 코드 (PLACE_NOT_FOUND 등)
  final String message;
  final int? statusCode;

  @override
  String toString() => 'ApiException($code, $statusCode): $message';
}

class NetworkException implements Exception {
  const NetworkException(this.message);

  final String message;

  @override
  String toString() => 'NetworkException: $message';
}
