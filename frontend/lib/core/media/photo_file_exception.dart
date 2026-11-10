// 고른 사진 파일을 올릴 수 없을 때 (형식이 안 맞음·너무 큼·읽기 실패). failure_mapper 가 PhotoFailure 로 바꾼다.
class PhotoFileException implements Exception {
  const PhotoFileException(this.message);

  final String message;

  @override
  String toString() => 'PhotoFileException: $message';
}
