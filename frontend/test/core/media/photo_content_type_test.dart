import 'package:flutter_test/flutter_test.dart';
import 'package:yeongcheon_map/core/media/photo_content_type.dart';

void main() {
  test('jpeg · png · webp 는 매직 넘버로 판별', () {
    expect(detectPhotoContentType([0xFF, 0xD8, 0xFF, 0xE0, 0, 0]), 'image/jpeg');
    expect(detectPhotoContentType([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0]), 'image/png');
    expect(
      detectPhotoContentType([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50, 0x56]),
      'image/webp',
    );
  });

  test('그 밖의 형식·짧은 파일은 null', () {
    expect(detectPhotoContentType('GIF89a'.codeUnits), isNull);
    expect(detectPhotoContentType([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63]), isNull); // HEIC
    expect(detectPhotoContentType([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x41, 0x56, 0x49, 0x20]), isNull); // AVI(RIFF)
    expect(detectPhotoContentType([0xFF, 0xD8]), isNull);
    expect(detectPhotoContentType(const []), isNull);
  });
}
