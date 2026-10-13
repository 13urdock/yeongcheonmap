import 'package:flutter/foundation.dart';

import '../core/error/failure.dart';
import '../core/error/result.dart';
import '../core/memory_date/memory_date_digit_rules.dart';
import '../core/memory_date/memory_date_pattern.dart';
import '../core/memory_date/memory_date_range.dart';
import '../data/models/create_story_request.dart';
import '../data/models/story_model.dart';
import '../data/models/timeline_anchor.dart';
import '../data/repositories/story_repository.dart';

// 기록 작성 화면 상태: 숫자판 날짜, 그때 이름, 글, 전송.
// 날짜가 가능한지(범위)는 core/memory_date 로 즉시 계산해 버튼 활성화·안내에 쓴다. 최종 판단은 서버.
class StoryWriteProvider extends ChangeNotifier {
  StoryWriteProvider({
    required StoryRepository storyRepository,
    required this.anchor,
    DateTime Function()? clock,
  })  : _storyRepository = storyRepository,
        _clock = clock ?? DateTime.now {
    _range = computeMemoryDateRange(_pattern, _clock());
  }

  final StoryRepository _storyRepository;
  final DateTime Function() _clock;
  final TimelineAnchor anchor;

  MemoryDatePattern _pattern = MemoryDatePattern.unknown();
  MemoryDateRange? _range;
  String _placeNameThen = '';
  String _content = '';
  bool _isSubmitting = false;
  Failure? _failure;

  MemoryDatePattern get pattern => _pattern;

  /// null 이면 "가능한 날짜 없음"
  MemoryDateRange? get range => _range;
  String get placeNameThen => _placeNameThen;
  String get content => _content;
  bool get isSubmitting => _isSubmitting;
  Failure? get failure => _failure;

  /// "그때 이름" 입력란은 장소에 남길 때만 보여준다
  bool get asksPlaceNameThen => anchor is PlaceAnchor;

  /// 사진 업로드(Story_03)가 붙기 전까지는 글이 있어야 보낼 수 있다
  bool get canSubmit => !_isSubmitting && _range != null && _content.trim().isNotEmpty;

  /// 첫째 자리 변경으로 월·일이 범위를 벗어나면 둘째 자리를 맞춘다 (예: 09 → 첫째 1 → 12)
  void setDigit(int index, String digit) {
    _pattern = clampMonthAndDay(_pattern.withDigit(index, digit));
    _range = computeMemoryDateRange(_pattern, _clock());
    notifyListeners();
  }

  void resetDate() {
    _pattern = MemoryDatePattern.unknown();
    _range = computeMemoryDateRange(_pattern, _clock());
    notifyListeners();
  }

  void setPlaceNameThen(String value) {
    _placeNameThen = value;
    notifyListeners();
  }

  void setContent(String value) {
    _content = value;
    notifyListeners();
  }

  /// 성공 시 만들어진 기록, 실패 시 null (실패 내용은 failure)
  Future<StoryModel?> submit() async {
    if (!canSubmit) return null;
    _isSubmitting = true;
    _failure = null;
    notifyListeners();

    final result = await _storyRepository.create(_buildRequest());
    _isSubmitting = false;
    final created = switch (result) {
      Ok(value: final story) => story,
      Err(failure: final failure) => _remember(failure),
    };
    notifyListeners();
    return created;
  }

  CreateStoryRequest _buildRequest() {
    final nameThen = _placeNameThen.trim();
    return CreateStoryRequest(
      placeId: switch (anchor) { PlaceAnchor(:final placeId) => placeId, EventAnchor() => null },
      eventId: switch (anchor) { EventAnchor(:final eventId) => eventId, PlaceAnchor() => null },
      memoryDate: _pattern.toString(),
      placeNameThen: asksPlaceNameThen && nameThen.isNotEmpty ? nameThen : null,
      content: _content.trim(),
    );
  }

  StoryModel? _remember(Failure failure) {
    _failure = failure;
    return null;
  }
}
