import 'dart:async';

import 'package:flutter/foundation.dart';

import '../core/error/failure.dart';
import '../core/error/result.dart';
import '../data/models/event_pin_model.dart';
import '../data/models/place_candidate_model.dart';
import '../data/models/place_pin_model.dart';
import '../data/repositories/event_repository.dart';
import '../data/repositories/place_repository.dart';

// 기록할 곳 고르기 화면 상태: 검색어 → 기록이 쌓인 장소·축제(우리 DB) + 영천의 실제 장소(지도 회사 검색). 위젯을 모른다.
// 글자를 칠 때마다 부르지 않고 잠깐 멈추면(debounce) 검색. 늦게 온 옛 응답은 버린다.
// 영천 장소 검색은 검색어가 있을 때만, 실패해도 그 칸만 안내한다(우리 DB 결과는 그대로).
class AnchorSearchProvider extends ChangeNotifier {
  AnchorSearchProvider({
    required PlaceRepository placeRepository,
    required EventRepository eventRepository,
    this.debounce = const Duration(milliseconds: 300),
  })  : _placeRepository = placeRepository,
        _eventRepository = eventRepository;

  final PlaceRepository _placeRepository;
  final EventRepository _eventRepository;
  final Duration debounce;

  String _query = '';
  List<PlacePinModel> _places = const [];
  List<EventPinModel> _events = const [];
  List<PlaceCandidateModel> _candidates = const [];
  bool _isLoading = false;
  Failure? _failure;
  Failure? _candidateFailure;
  Timer? _debounceTimer;
  int _requestSeq = 0;
  bool _disposed = false;

  String get query => _query;
  List<PlacePinModel> get places => _places;
  List<EventPinModel> get events => _events;

  /// 영천의 실제 장소 (이미 [places] 에 보이는 장소는 뺀다)
  List<PlaceCandidateModel> get candidates => _candidates;
  bool get isLoading => _isLoading;
  Failure? get failure => _failure;

  /// 영천 장소 검색만의 실패 (검색 키 미설정·외부 오류 등)
  Failure? get candidateFailure => _candidateFailure;

  /// 검색어가 있어야 영천 장소를 찾는다
  bool get searchesCandidates => _query.trim().isNotEmpty;
  bool get hasNoResult =>
      !_isLoading &&
      _failure == null &&
      _candidateFailure == null &&
      _places.isEmpty &&
      _events.isEmpty &&
      _candidates.isEmpty;

  void setQuery(String value) {
    _query = value;
    _debounceTimer?.cancel();
    _debounceTimer = Timer(debounce, search);
  }

  /// 지금 검색어로 장소·축제·영천 장소를 함께 찾는다 (한쪽이 실패해도 성공한 쪽은 보여준다)
  Future<void> search() async {
    final seq = ++_requestSeq;
    final keyword = _query.trim();
    _isLoading = true;
    _failure = null;
    _candidateFailure = null;
    _notify();

    final (placesResult, eventsResult, candidatesResult) = await (
      _placeRepository.search(keyword),
      _eventRepository.search(keyword),
      keyword.isEmpty
          ? Future<Result<List<PlaceCandidateModel>>>.value(const Ok([]))
          : _placeRepository.searchCandidates(keyword),
    ).wait;
    if (seq != _requestSeq || _disposed) return;

    _isLoading = false;
    _places = switch (placesResult) { Ok(value: final v) => v, Err() => const [] };
    _events = switch (eventsResult) { Ok(value: final v) => v, Err() => const [] };
    _candidates = switch (candidatesResult) { Ok(value: final v) => _withoutShown(v), Err() => const [] };
    _candidateFailure = switch (candidatesResult) { Err(failure: final f) => f, Ok() => null };
    _failure = switch ((placesResult, eventsResult)) {
      (Err(failure: final f), _) => f,
      (_, Err(failure: final f)) => f,
      _ => null,
    };
    _notify();
  }

  // 우리 DB 결과에 이미 있는 장소는 '영천의 장소'에서 빼서 두 번 보이지 않게
  List<PlaceCandidateModel> _withoutShown(List<PlaceCandidateModel> found) {
    final shown = {for (final p in _places) p.placeId};
    return found.where((c) => c.placeId == null || !shown.contains(c.placeId)).toList(growable: false);
  }

  void _notify() {
    if (!_disposed) notifyListeners();
  }

  @override
  void dispose() {
    _disposed = true;
    _debounceTimer?.cancel();
    super.dispose();
  }
}
