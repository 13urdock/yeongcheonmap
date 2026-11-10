import 'upload_file_spec.dart';

// POST /uploads/presign 요청 본문 (API 명세 §8). 1~5장.
class PresignUploadRequest {
  const PresignUploadRequest(this.files);

  final List<UploadFileSpec> files;

  Map<String, dynamic> toJson() => {'files': [for (final f in files) f.toJson()]};
}
