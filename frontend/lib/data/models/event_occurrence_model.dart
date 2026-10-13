// GET /events/{eventId} 의 occurrences 항목 — 개최 정보(언제 열렸나). 기록은 회차가 아니라 축제에 붙는다.
class EventOccurrenceModel {
  const EventOccurrenceModel({
    required this.occurrenceId,
    required this.year,
    required this.startDate,
    required this.endDate,
  });

  factory EventOccurrenceModel.fromJson(Map<String, dynamic> json) {
    return EventOccurrenceModel(
      occurrenceId: json['occurrenceId'] as String,
      year: json['year'] as int,
      startDate: json['startDate'] as String?,
      endDate: json['endDate'] as String?,
    );
  }

  final String occurrenceId;
  final int year;
  final String? startDate; // YYYY-MM-DD
  final String? endDate;

  Map<String, dynamic> toJson() => {
        'occurrenceId': occurrenceId,
        'year': year,
        'startDate': startDate,
        'endDate': endDate,
      };
}
