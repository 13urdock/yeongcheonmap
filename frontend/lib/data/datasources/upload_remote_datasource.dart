import 'dart:typed_data';

import '../../core/network/api_client.dart';
import '../../core/network/storage_upload_client.dart';
import '../models/presign_upload_request.dart';
import '../models/presigned_upload_model.dart';

// 사진 업로드 원격 호출 (HTTP + 파싱만): 우리 서버에 업로드 주소 받기 → 저장소에 파일 올리기
class UploadRemoteDataSource {
  UploadRemoteDataSource(this._client, this._storage);

  final ApiClient _client;
  final StorageUploadClient _storage;

  /// POST /uploads/presign → 요청 순서대로 업로드 주소
  Future<List<PresignedUploadModel>> presign(PresignUploadRequest request) async {
    final data = await _client.post('/uploads/presign', body: request.toJson());
    final items = (data['items'] as List<dynamic>? ?? const []);
    return [for (final item in items) PresignedUploadModel.fromJson(item as Map<String, dynamic>)];
  }

  /// 받은 주소로 저장소에 직접 PUT
  Future<void> put(PresignedUploadModel target, Uint8List bytes) {
    return _storage.put(url: target.uploadUrl, method: target.method, headers: target.headers, bytes: bytes);
  }
}
