import 'dart:typed_data';

// 올릴 준비가 된 사진 한 장: 파일 바이트 + 판별한 형식
class LocalPhoto {
  const LocalPhoto({required this.bytes, required this.contentType});

  final Uint8List bytes;
  final String contentType;

  int get size => bytes.length;
}
