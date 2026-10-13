// 좌표 범위 (map-layers 의 bounds / 뷰포트 bbox 공용). SDK 타입에 의존하지 않는 순수 데이터.
class MapBoundsModel {
  const MapBoundsModel({
    required this.minLat,
    required this.minLng,
    required this.maxLat,
    required this.maxLng,
  });

  factory MapBoundsModel.fromJson(Map<String, dynamic> json) {
    return MapBoundsModel(
      minLat: (json['minLat'] as num).toDouble(),
      minLng: (json['minLng'] as num).toDouble(),
      maxLat: (json['maxLat'] as num).toDouble(),
      maxLng: (json['maxLng'] as num).toDouble(),
    );
  }

  final double minLat;
  final double minLng;
  final double maxLat;
  final double maxLng;

  Map<String, dynamic> toJson() => {
        'minLat': minLat,
        'minLng': minLng,
        'maxLat': maxLat,
        'maxLng': maxLng,
      };

  /// GET /places?bbox= 형식: "minLng,minLat,maxLng,maxLat"
  String toBboxQuery() => '$minLng,$minLat,$maxLng,$maxLat';
}
