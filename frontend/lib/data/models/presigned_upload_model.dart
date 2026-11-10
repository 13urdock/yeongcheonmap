// POST /uploads/presign 응답 items[] 한 칸 (API 명세 §8).
// uploadUrl 로 method·headers 를 그대로 써서 PUT → 성공하면 publicUrl 을 기록의 photoUrls 로 보낸다.
class PresignedUploadModel {
  const PresignedUploadModel({
    required this.uploadUrl,
    required this.method,
    required this.headers,
    required this.publicUrl,
  });

  final String uploadUrl;
  final String method;
  final Map<String, String> headers;
  final String publicUrl;

  factory PresignedUploadModel.fromJson(Map<String, dynamic> json) {
    final rawHeaders = json['headers'];
    return PresignedUploadModel(
      uploadUrl: json['uploadUrl'] as String,
      method: (json['method'] as String?) ?? 'PUT',
      headers: rawHeaders is Map
          ? {for (final e in rawHeaders.entries) e.key.toString(): e.value.toString()}
          : const {},
      publicUrl: json['publicUrl'] as String,
    );
  }
}
