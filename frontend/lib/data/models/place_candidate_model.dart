// 아직 우리 장소로 확정되지 않은 실제 장소 하나 (API 명세 v4.4 §4).
// - GET /places/candidates 항목 ('영천의 장소' 검색 결과)
// - 지도에서 상표(장소 이름)를 눌렀을 때 (이름·좌표만 있음)
// 기록을 보관할 때 POST /places/resolve 로 우리 장소(placeId)가 된다.
class PlaceCandidateModel {
  const PlaceCandidateModel({
    required this.name,
    required this.latitude,
    required this.longitude,
    this.category,
    this.address,
    this.placeId,
  });

  factory PlaceCandidateModel.fromJson(Map<String, dynamic> json) {
    return PlaceCandidateModel(
      name: json['name'] as String,
      category: json['category'] as String?,
      address: json['address'] as String?,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      placeId: json['placeId'] as String?,
    );
  }

  final String name;
  final String? category; // 예: "음식점 > 카페"
  final String? address;
  final double latitude;
  final double longitude;

  /// 이미 우리 DB 에 있는 같은 장소면 그 id
  final String? placeId;
}
