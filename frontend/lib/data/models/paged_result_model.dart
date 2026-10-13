// 목록 응답 공통 형태 { items, page, size, totalCount } (API 명세 v3 §1)
class PagedResultModel<T> {
  const PagedResultModel({
    required this.items,
    required this.page,
    required this.size,
    required this.totalCount,
  });

  /// [itemParser] 로 각 항목을 모델로 변환한다.
  factory PagedResultModel.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) itemParser,
  ) {
    final rawItems = (json['items'] as List<dynamic>? ?? const []);
    return PagedResultModel(
      items: rawItems.map((e) => itemParser(e as Map<String, dynamic>)).toList(growable: false),
      page: (json['page'] as int?) ?? 1,
      size: (json['size'] as int?) ?? rawItems.length,
      totalCount: (json['totalCount'] as int?) ?? rawItems.length,
    );
  }

  final List<T> items;
  final int page;
  final int size;
  final int totalCount;

  bool get hasMore => page * size < totalCount;
}
