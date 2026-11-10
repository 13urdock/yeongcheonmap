// PATCH /stories/{storyId} 요청 본문 (API 명세 §7).
// 수정 화면은 바꿀 수 있는 값을 모두 보낸다: 빈 문자열("") = 지우기, photoUrls = 사진 목록 전체(순서대로, 빈 배열 = 모두 빼기).
// placeNameThen 이 null 이면 보내지 않는다(축제 기록엔 그때 이름이 없음).
class UpdateStoryRequest {
  const UpdateStoryRequest({
    required this.memoryDate,
    required this.placeNameThen,
    required this.content,
    required this.photoUrls,
  });

  final String memoryDate;
  final String? placeNameThen;
  final String content;
  final List<String> photoUrls;

  Map<String, dynamic> toJson() => {
        'memoryDate': memoryDate,
        if (placeNameThen != null) 'placeNameThen': placeNameThen,
        'content': content,
        'photoUrls': photoUrls,
      };
}
