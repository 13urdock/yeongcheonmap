import 'package:flutter_test/flutter_test.dart';
import 'package:yeongcheon_map/data/models/presign_upload_request.dart';
import 'package:yeongcheon_map/data/models/presigned_upload_model.dart';
import 'package:yeongcheon_map/data/models/upload_file_spec.dart';

// API 명세 §8 예시 그대로
void main() {
  test('POST /uploads/presign 요청 본문', () {
    const request = PresignUploadRequest([UploadFileSpec(contentType: 'image/jpeg', size: 834512)]);
    expect(request.toJson(), {
      'files': [
        {'contentType': 'image/jpeg', 'size': 834512},
      ],
    });
  });

  test('응답 items[] 파싱', () {
    final item = PresignedUploadModel.fromJson({
      'uploadUrl': 'https://yeongcheonmap.kr.ncloudstorage.com/stories/2026-11/x.jpg?X-Amz-Algorithm=a',
      'method': 'PUT',
      'headers': {'Content-Type': 'image/jpeg'},
      'publicUrl': 'https://yeongcheonmap.kr.ncloudstorage.com/stories/2026-11/x.jpg',
      'expiresAt': '2026-11-10T01:30:00.000Z',
    });
    expect(item.method, 'PUT');
    expect(item.headers, {'Content-Type': 'image/jpeg'});
    expect(item.publicUrl, endsWith('/stories/2026-11/x.jpg'));
  });
}
