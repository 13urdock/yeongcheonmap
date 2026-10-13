// GET /events/{eventId} 의 hosts 항목
class EventHostModel {
  const EventHostModel({required this.hostType, required this.hostName});

  factory EventHostModel.fromJson(Map<String, dynamic> json) {
    return EventHostModel(hostType: json['hostType'] as String, hostName: json['hostName'] as String);
  }

  final String hostType; // '지자체' 등
  final String hostName;

  Map<String, dynamic> toJson() => {'hostType': hostType, 'hostName': hostName};
}
