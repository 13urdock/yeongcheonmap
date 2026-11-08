// POST /places/resolve 요청 본문 (API 명세 v4.4 §4). null 필드는 보내지 않는다.
class ResolvePlaceRequest {
  const ResolvePlaceRequest({required this.name, required this.latitude, required this.longitude, this.address});

  final String name;
  final double latitude;
  final double longitude;
  final String? address;

  Map<String, dynamic> toJson() => {
        'name': name,
        'latitude': latitude,
        'longitude': longitude,
        if (address != null) 'address': address,
      };
}
