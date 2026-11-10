import '../../core/error/failure_mapper.dart';
import '../../core/error/result.dart';
import '../../core/media/local_photo_reader.dart';
import '../../core/network/api_exception.dart';
import '../datasources/upload_remote_datasource.dart';
import '../models/presign_upload_request.dart';
import '../models/upload_file_spec.dart';

// 사진 업로드: 로컬 사진들을 읽어 확인 → 업로드 주소 한 번에 받기 → 각각 저장소에 PUT → 공개 주소 목록.
// 하나라도 실패하면 전체 실패(Err). 순서는 고른 순서 그대로.
class UploadRepository {
  UploadRepository(this._remote, {LocalPhotoReader reader = const LocalPhotoReader()}) : _reader = reader;

  final UploadRemoteDataSource _remote;
  final LocalPhotoReader _reader;

  Future<Result<List<String>>> uploadPhotos(List<String> paths) {
    return runGuarded(() async {
      if (paths.isEmpty) return const <String>[];
      final photos = await Future.wait(paths.map(_reader.read));
      final targets = await _remote.presign(
        PresignUploadRequest([for (final p in photos) UploadFileSpec(contentType: p.contentType, size: p.size)]),
      );
      if (targets.length != photos.length) {
        throw const ApiException(code: 'INVALID_RESPONSE', message: '업로드 주소를 제대로 받지 못했어요');
      }
      await Future.wait([for (var i = 0; i < photos.length; i++) _remote.put(targets[i], photos[i].bytes)]);
      return [for (final t in targets) t.publicUrl];
    });
  }
}
