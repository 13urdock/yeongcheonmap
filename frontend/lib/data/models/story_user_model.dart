// 스토리 작성자 요약 (API 명세 v4 §7 user)
class StoryUserModel {
  const StoryUserModel({required this.userId, required this.name, required this.profileUrl});

  factory StoryUserModel.fromJson(Map<String, dynamic> json) {
    return StoryUserModel(
      userId: json['userId'] as String,
      name: json['name'] as String,
      profileUrl: json['profileUrl'] as String?,
    );
  }

  final String userId;
  final String name;
  final String? profileUrl;

  Map<String, dynamic> toJson() => {'userId': userId, 'name': name, 'profileUrl': profileUrl};
}
