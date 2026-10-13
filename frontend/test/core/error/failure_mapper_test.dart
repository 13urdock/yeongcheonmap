import 'package:flutter_test/flutter_test.dart';
import 'package:yeongcheon_map/core/error/failure.dart';
import 'package:yeongcheon_map/core/error/failure_mapper.dart';
import 'package:yeongcheon_map/core/error/result.dart';
import 'package:yeongcheon_map/core/network/api_exception.dart';

void main() {
  test('ApiException → ServerFailure(code 유지)', () async {
    final result = await runGuarded<int>(() async {
      throw const ApiException(code: 'PLACE_NOT_FOUND', message: '없음', statusCode: 404);
    });
    expect(result, isA<Err<int>>());
    final failure = (result as Err<int>).failure;
    expect(failure, isA<ServerFailure>());
    expect((failure as ServerFailure).code, 'PLACE_NOT_FOUND');
  });

  test('NetworkException → NetworkFailure', () async {
    final result = await runGuarded<int>(() async => throw const NetworkException('끊김'));
    expect((result as Err<int>).failure, isA<NetworkFailure>());
  });

  test('정상 → Ok', () async {
    final result = await runGuarded<int>(() async => 7);
    expect((result as Ok<int>).value, 7);
  });
}
