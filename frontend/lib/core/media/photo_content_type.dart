// 사진 파일 앞부분(매직 넘버)으로 형식을 판별한다. 확장자는 믿지 않는다.
// 서버가 받는 형식(API 명세 §8)만: image/jpeg · image/png · image/webp. 그 밖(HEIC·GIF 등)은 null.
String? detectPhotoContentType(List<int> head) {
  bool startsWith(List<int> sig, [int offset = 0]) {
    if (head.length < offset + sig.length) return false;
    for (var i = 0; i < sig.length; i++) {
      if (head[offset + i] != sig[i]) return false;
    }
    return true;
  }

  if (startsWith(const [0xFF, 0xD8, 0xFF])) return 'image/jpeg';
  if (startsWith(const [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) return 'image/png';
  // RIFF....WEBP
  if (startsWith(const [0x52, 0x49, 0x46, 0x46]) && startsWith(const [0x57, 0x45, 0x42, 0x50], 8)) return 'image/webp';
  return null;
}
