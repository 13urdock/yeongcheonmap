// 스토리 사진 한 장 (API 명세 v4 §7 photos)
class StoryPhotoModel {
  const StoryPhotoModel({required this.storyPhotoId, required this.imageUrl});

  factory StoryPhotoModel.fromJson(Map<String, dynamic> json) {
    return StoryPhotoModel(storyPhotoId: json['storyPhotoId'] as String, imageUrl: json['imageUrl'] as String);
  }

  final String storyPhotoId;
  final String imageUrl;

  Map<String, dynamic> toJson() => {'storyPhotoId': storyPhotoId, 'imageUrl': imageUrl};
}
