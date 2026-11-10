// 작성·수정 화면의 사진 한 장 = "출처" 문자열 하나.
// - 기기에서 고른 사진: 로컬 파일 경로 (보관할 때 저장소에 올린다)
// - 이미 올라간 사진(수정할 때 불러온 것): 공개 주소 https://...
bool isRemotePhoto(String source) => source.startsWith('https://') || source.startsWith('http://');
