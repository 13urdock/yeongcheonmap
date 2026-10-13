// POST /stories 요청 본문 (API 명세 v4 §7). null 필드는 보내지 않는다.
class CreateStoryRequest {
  const CreateStoryRequest({
    this.placeId,
    this.eventId,
    required this.memoryDate,
    this.placeNameThen,
    this.content,
    this.photoUrls = const [],
  });

  final String? placeId;
  final String? eventId;
  final String memoryDate; // "199X.XX.XX"
  final String? placeNameThen;
  final String? content;
  final List<String> photoUrls;

  Map<String, dynamic> toJson() => {
        if (placeId != null) 'placeId': placeId,
        if (eventId != null) 'eventId': eventId,
        'memoryDate': memoryDate,
        if (placeNameThen != null) 'placeNameThen': placeNameThen,
        if (content != null) 'content': content,
        if (photoUrls.isNotEmpty) 'photoUrls': photoUrls,
      };
}
