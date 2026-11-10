import 'package:image_picker/image_picker.dart';

import '../config/constants.dart';

// 기기 갤러리에서 사진 여러 장 고르기 (image_picker 래핑). 고른 파일의 로컬 경로만 돌려준다.
// 고를 때 긴 변 StoryConstants.photoMaxSide 이하·품질 photoQuality 로 줄인 사본을 받는다(업로드 크기 절약).
// 플러그인 의존을 이 파일 한 곳에 가둬, provider 는 경로 문자열만 다룬다.
class PhotoPicker {
  PhotoPicker([ImagePicker? picker]) : _picker = picker ?? ImagePicker();

  final ImagePicker _picker;

  /// 사용자가 취소하면 빈 목록
  Future<List<String>> pickMany() async {
    final files = await _picker.pickMultiImage(
      maxWidth: StoryConstants.photoMaxSide,
      maxHeight: StoryConstants.photoMaxSide,
      imageQuality: StoryConstants.photoQuality,
    );
    return [for (final f in files) f.path];
  }
}
