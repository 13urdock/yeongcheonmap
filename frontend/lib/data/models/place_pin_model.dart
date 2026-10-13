// GET /places 항목 (API 명세 v4 §4). 지도 위 장소 핀 하나.
class PlacePinModel {
  const PlacePinModel({
    required this.placeId,
    required this.name,
    required this.usageType,
    required this.latitude,
    required this.longitude,
    required this.sinceYear,
    required this.thumbnailUrl,
    required this.storyCount,
  });

  factory PlacePinModel.fromJson(Map<String, dynamic> json) {
    return PlacePinModel(
      placeId: json['placeId'] as String,
      name: json['name'] as String,
      usageType: json['usageType'] as String?,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      sinceYear: json['sinceYear'] as int?,
      thumbnailUrl: json['thumbnailUrl'] as String?,
      storyCount: (json['storyCount'] as int?) ?? 0,
    );
  }

  final String placeId;
  final String name; // 지금 이름
  final String? usageType;
  final double latitude;
  final double longitude;
  final int? sinceYear;
  final String? thumbnailUrl;
  final int storyCount;

  Map<String, dynamic> toJson() => {
        'placeId': placeId,
        'name': name,
        'usageType': usageType,
        'latitude': latitude,
        'longitude': longitude,
        'sinceYear': sinceYear,
        'thumbnailUrl': thumbnailUrl,
        'storyCount': storyCount,
      };
}
