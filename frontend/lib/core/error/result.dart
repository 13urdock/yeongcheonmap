import 'failure.dart';

// repository 가 provider 에 돌려주는 결과 타입. 성공(Ok) 또는 실패(Err) 둘 중 하나.
sealed class Result<T> {
  const Result();
}

class Ok<T> extends Result<T> {
  const Ok(this.value);

  final T value;
}

class Err<T> extends Result<T> {
  const Err(this.failure);

  final Failure failure;
}
