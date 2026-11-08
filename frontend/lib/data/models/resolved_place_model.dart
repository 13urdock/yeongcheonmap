// POST /places/resolve 응답 (API 명세 v4.4 §4): 찾았거나 새로 만든 장소
class ResolvedPlaceModel {
  const ResolvedPlaceModel({required this.placeId, required this.created});

  factory ResolvedPlaceModel.fromJson(Map<String, dynamic> json) {
    return ResolvedPlaceModel(placeId: json['placeId'] as String, created: (json['created'] as bool?) ?? false);
  }

  final String placeId;
  final bool created;
}
