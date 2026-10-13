// GET /events 항목 (API 명세 v4 §5). 지도 위 축제 핀 하나.
class EventPinModel {
  const EventPinModel({
    required this.eventId,
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.address,
    required this.storyCount,
  });

  factory EventPinModel.fromJson(Map<String, dynamic> json) {
    return EventPinModel(
      eventId: json['eventId'] as String,
      name: json['name'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      address: json['address'] as String?,
      storyCount: (json['storyCount'] as int?) ?? 0,
    );
  }

  final String eventId;
  final String name;
  final double latitude;
  final double longitude;
  final String? address;
  final int storyCount;

  Map<String, dynamic> toJson() => {
        'eventId': eventId,
        'name': name,
        'latitude': latitude,
        'longitude': longitude,
        'address': address,
        'storyCount': storyCount,
      };
}
