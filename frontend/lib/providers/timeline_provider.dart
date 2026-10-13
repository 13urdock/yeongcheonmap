import 'package:flutter/foundation.dart';

import '../core/error/failure.dart';
import '../core/error/result.dart';
import '../data/models/story_model.dart';
import '../data/models/timeline_anchor.dart';
import '../data/models/timeline_order.dart';
import '../data/repositories/story_repository.dart';

// 장소·축제 공용 타임라인 상태: 기억 날짜 순 기록 목록, 정렬 방향, 페이지네이션.
// 정렬은 서버가 한다. 이 provider 는 받은 순서를 그대로 이어 붙인다.
class TimelineProvider extends ChangeNotifier {
  TimelineProvider({required StoryRepository storyRepository, required this.anchor})
      : _storyRepository = storyRepository;

  final StoryRepository _storyRepository;
  final TimelineAnchor anchor;

  TimelineOrder _order = TimelineOrder.asc;
  List<StoryModel> _items = const [];
  int _page = 0;
  int _totalCount = 0;
  bool _isLoading = false;
  Failure? _failure;
  int _requestSeq = 0; // 정렬을 빠르게 바꿀 때 늦게 온 응답을 버리기 위한 번호

  TimelineOrder get order => _order;
  List<StoryModel> get items => _items;
  int get totalCount => _totalCount;
  bool get isLoading => _isLoading;
  Failure? get failure => _failure;
  bool get hasMore => _items.length < _totalCount;

  /// 처음부터 다시 (화면 진입, 기록 작성 후)
  Future<void> refresh() async {
    _items = const [];
    _page = 0;
    _totalCount = 0;
    await _loadNextPage();
  }

  /// 오름차순 ↔ 내림차순
  Future<void> toggleOrder() async {
    _order = _order == TimelineOrder.asc ? TimelineOrder.desc : TimelineOrder.asc;
    await refresh();
  }

  /// 목록 끝에 닿았을 때
  Future<void> loadMore() async {
    if (_isLoading || !hasMore) return;
    await _loadNextPage();
  }

  Future<void> _loadNextPage() async {
    final seq = ++_requestSeq;
    _isLoading = true;
    _failure = null;
    notifyListeners();

    final result = await _storyRepository.getTimelinePage(anchor: anchor, order: _order, page: _page + 1);
    if (seq != _requestSeq) return;

    _isLoading = false;
    switch (result) {
      case Ok(value: final paged):
        _items = [..._items, ...paged.items];
        _page = paged.page;
        _totalCount = paged.totalCount;
      case Err(failure: final failure):
        _failure = failure;
    }
    notifyListeners();
  }
}
