// UI 가 다루는 실패 타입. 위젯은 이것만 보고 메시지/재시도 UI 를 결정한다.
sealed class Failure {
  const Failure(this.message);

  final String message;
}

/// 서버에 닿지 못함 (네트워크 단절·타임아웃)
class NetworkFailure extends Failure {
  const NetworkFailure([super.message = '서버에 연결할 수 없습니다']);
}

/// 서버가 실패 envelope 을 돌려줌 (API 명세 v3 에러 코드 포함)
class ServerFailure extends Failure {
  const ServerFailure({required this.code, required String message}) : super(message);

  final String code;
}

/// 고른 사진을 올릴 수 없음 (형식·크기·읽기 실패) — 서버에 보내기 전에 걸러진다
class PhotoFailure extends Failure {
  const PhotoFailure(super.message);
}

/// 그 밖의 예상 못 한 오류
class UnknownFailure extends Failure {
  const UnknownFailure([super.message = '알 수 없는 오류가 발생했습니다']);
}
