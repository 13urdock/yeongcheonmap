import 'dart:io';
import 'dart:typed_data';

import '../config/constants.dart';
import 'local_photo.dart';
import 'photo_content_type.dart';
import 'photo_file_exception.dart';

// 로컬 경로의 사진을 읽어 형식·크기를 확인한다. 올릴 수 없으면 PhotoFileException.
class LocalPhotoReader {
  const LocalPhotoReader();

  Future<LocalPhoto> read(String path) async {
    final Uint8List bytes;
    try {
      bytes = await File(path).readAsBytes();
    } on FileSystemException {
      throw const PhotoFileException('사진 파일을 읽지 못했어요. 사진을 빼고 다시 골라 주세요.');
    }
    final contentType = detectPhotoContentType(bytes);
    if (contentType == null) {
      throw const PhotoFileException('이 사진 형식은 올릴 수 없어요 (JPG·PNG·WEBP만). 다른 사진을 골라 주세요.');
    }
    if (bytes.isEmpty || bytes.length > StoryConstants.maxPhotoBytes) {
      throw const PhotoFileException('사진이 너무 커요 (한 장 10MB까지). 다른 사진을 골라 주세요.');
    }
    return LocalPhoto(bytes: bytes, contentType: contentType);
  }
}
