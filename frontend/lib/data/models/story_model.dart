import 'memory_date_model.dart';
import 'story_photo_model.dart';
import 'story_user_model.dart';

// 스토리(기록) 공통 구조 (API 명세 v4 §7)
class StoryModel {
  const StoryModel({
    required this.storyId,
    required this.user,
    required this.placeId,
    required this.eventId,
    required this.memoryDate,
    required this.placeNameThen,
    required this.content,
    required this.photos,
    required this.createdAt,
  });

  factory StoryModel.fromJson(Map<String, dynamic> json) {
    return StoryModel(
      storyId: json['storyId'] as String,
      user: StoryUserModel.fromJson(json['user'] as Map<String, dynamic>),
      placeId: json['placeId'] as String?,
      eventId: json['eventId'] as String?,
      memoryDate: MemoryDateModel.fromJson(json['memoryDate'] as Map<String, dynamic>),
      placeNameThen: json['placeNameThen'] as String?,
      content: json['content'] as String?,
      photos: (json['photos'] as List<dynamic>? ?? const [])
          .map((e) => StoryPhotoModel.fromJson(e as Map<String, dynamic>))
          .toList(growable: false),
      createdAt: json['createdAt'] as String,
    );
  }

  final String storyId;
  final StoryUserModel user;
  final String? placeId;
  final String? eventId;
  final MemoryDateModel memoryDate;
  final String? placeNameThen; // 그때 이 자리의 이름
  final String? content;
  final List<StoryPhotoModel> photos;
  final String createdAt;

  Map<String, dynamic> toJson() => {
        'storyId': storyId,
        'user': user.toJson(),
        'placeId': placeId,
        'eventId': eventId,
        'memoryDate': memoryDate.toJson(),
        'placeNameThen': placeNameThen,
        'content': content,
        'photos': photos.map((p) => p.toJson()).toList(),
        'createdAt': createdAt,
      };
}
