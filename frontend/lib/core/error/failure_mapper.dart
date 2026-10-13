import '../network/api_exception.dart';
import 'failure.dart';
import 'result.dart';

// datasource 예외 → Failure 변환 규칙을 한 곳에. repository 는 runGuarded 로 감싸기만 한다.
Failure failureFrom(Object error) {
  if (error is ApiException) {
    return ServerFailure(code: error.code, message: error.message);
  }
  if (error is NetworkException) {
    return NetworkFailure(error.message);
  }
  return const UnknownFailure();
}

/// datasource 호출을 실행하고 예외를 `Result<T>` 로 바꿔 돌려준다.
Future<Result<T>> runGuarded<T>(Future<T> Function() action) async {
  try {
    return Ok(await action());
  } catch (e) {
    return Err(failureFrom(e));
  }
}
