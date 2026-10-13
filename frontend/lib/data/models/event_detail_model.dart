import 'event_host_model.dart';
import 'event_occurrence_model.dart';

// GET /events/{eventId} (API 명세 v4 §5). 축제 상세 머리 정보.
class EventDetailModel {
  const EventDetailModel({
    required this.eventId,
    required this.name,
    required this.content,
    required this.address,
    required this.storyCount,
    required this.hosts,
    required this.occurrences,
  });

  factory EventDetailModel.fromJson(Map<String, dynamic> json) {
    return EventDetailModel(
      eventId: json['eventId'] as String,
      name: json['name'] as String,
      content: json['content'] as String?,
      address: json['address'] as String?,
      storyCount: (json['storyCount'] as int?) ?? 0,
      hosts: (json['hosts'] as List<dynamic>? ?? const [])
          .map((e) => EventHostModel.fromJson(e as Map<String, dynamic>))
          .toList(growable: false),
      occurrences: (json['occurrences'] as List<dynamic>? ?? const [])
          .map((e) => EventOccurrenceModel.fromJson(e as Map<String, dynamic>))
          .toList(growable: false),
    );
  }

  final String eventId;
  final String name;
  final String? content;
  final String? address;
  final int storyCount;
  final List<EventHostModel> hosts;
  final List<EventOccurrenceModel> occurrences;

  Map<String, dynamic> toJson() => {
        'eventId': eventId,
        'name': name,
        'content': content,
        'address': address,
        'storyCount': storyCount,
        'hosts': hosts.map((h) => h.toJson()).toList(),
        'occurrences': occurrences.map((o) => o.toJson()).toList(),
      };
}
