// POST /uploads/presign 의 files[] 한 칸 (API 명세 §8)
class UploadFileSpec {
  const UploadFileSpec({required this.contentType, required this.size});

  final String contentType; // image/jpeg · image/png · image/webp
  final int size; // 바이트

  Map<String, dynamic> toJson() => {'contentType': contentType, 'size': size};
}
