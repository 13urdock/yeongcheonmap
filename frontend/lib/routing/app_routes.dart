// 라우트 이름 상수. (라우팅 방식: 기본 Navigator + named route, 인자는 route_args/)
class AppRoutes {
  AppRoutes._();

  static const String map = '/';
  static const String placeDetail = '/place';
  static const String eventDetail = '/event';
  static const String storyWrite = '/story/write';

  /// 기록할 장소·축제 고르기(검색). 결과로 AnchorTarget 을 돌려준다.
  static const String anchorPicker = '/story/anchor';

  /// 수집가 로그인 / 등록. 성공하면 true 를 돌려준다.
  static const String auth = '/auth';
}
