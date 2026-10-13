// GET /places/{placeId} (API 명세 v4 §4). 장소 상세 머리 정보.
class PlaceDetailModel {
  const PlaceDetailModel({
    required this.placeId,
    required this.name,
    required this.usageType,
    required this.intro,
    required this.address,
    required this.latitude,
    required this.longitude,
    required this.sinceYear,
    required this.thumbnailUrl,
    required this.storyCount,
  });

  factory PlaceDetailModel.fromJson(Map<String, dynamic> json) {
    return PlaceDetailModel(
      placeId: json['placeId'] as String,
      name: json['name'] as String,
      usageType: json['usageType'] as String?,
      intro: json['intro'] as String?,
      address: json['address'] as String?,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      sinceYear: json['sinceYear'] as int?,
      thumbnailUrl: json['thumbnailUrl'] as String?,
      storyCount: (json['storyCount'] as int?) ?? 0,
    );
  }

  final String placeId;
  final String name;
  final String? usageType;
  final String? intro;
  final String? address;
  final double latitude;
  final double longitude;
  final int? sinceYear;
  final String? thumbnailUrl;
  final int storyCount;

  Map<String, dynamic> toJson() => {
        'placeId': placeId,
        'name': name,
        'usageType': usageType,
        'intro': intro,
        'address': address,
        'latitude': latitude,
        'longitude': longitude,
        'sinceYear': sinceYear,
        'thumbnailUrl': thumbnailUrl,
        'storyCount': storyCount,
      };
}
