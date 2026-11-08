import 'package:flutter/foundation.dart';

import '../core/config/constants.dart';
import '../core/error/failure.dart';
import '../core/error/result.dart';
import '../core/media/photo_picker.dart';
import '../core/memory_date/memory_date_digit_rules.dart';
import '../core/memory_date/memory_date_pattern.dart';
import '../core/memory_date/memory_date_range.dart';
import '../data/models/anchor_target.dart';
import '../data/models/create_story_request.dart';
import '../data/models/story_model.dart';
import '../data/models/timeline_anchor.dart';
import '../data/repositories/place_repository.dart';
import '../data/repositories/story_repository.dart';

// 기록 작성 화면 상태: 기록할 곳(장소/축제), 숫자판 날짜, 그때 이름, 글, 사진(최대 5장), 전송.
// 날짜가 가능한지(범위)는 core/memory_date 로 즉시 계산해 버튼 활성화·안내에 쓴다. 최종 판단은 서버.
// 아직 등록 안 된 실제 장소(지도 상표·영천 장소 검색)는 보관하는 순간 장소로 확정(resolve)한 뒤 기록을 만든다.
class StoryWriteProvider extends ChangeNotifier {
  StoryWriteProvider({
    required StoryRepository storyRepository,
    required PlaceRepository placeRepository,
    AnchorTarget? initialTarget,
    PhotoPicker? photoPicker,
    DateTime Function()? clock,
  })  : _storyRepository = storyRepository,
        _placeRepository = placeRepository,
        _target = initialTarget,
        _photoPicker = photoPicker ?? PhotoPicker(),
        _clock = clock ?? DateTime.now {
    _range = computeMemoryDateRange(_pattern, _clock());
  }

  final StoryRepository _storyRepository;
  final PlaceRepository _placeRepository;
  final PhotoPicker _photoPicker;
  final DateTime Function() _clock;

  AnchorTarget? _target;

  MemoryDatePattern _pattern = MemoryDatePattern.unknown();
  MemoryDateRange? _range;
  String _placeNameThen = '';
  String _content = '';
  List<String> _photoPaths = const [];
  bool _isSubmitting = false;
  Failure? _failure;

  /// 기록할 곳. null 이면 아직 안 고름
  AnchorTarget? get target => _target;
  MemoryDatePattern get pattern => _pattern;

  /// null 이면 "가능한 날짜 없음"
  MemoryDateRange? get range => _range;
  String get placeNameThen => _placeNameThen;
  String get content => _content;

  /// 고른 사진의 로컬 경로 (고른 순서, 최대 StoryConstants.maxPhotos)
  List<String> get photoPaths => _photoPaths;
  bool get canAddPhoto => _photoPaths.length < StoryConstants.maxPhotos;

  /// 숫자판 연도 상한선 계산용 (올해)
  int get currentYear => _clock().year;
  bool get isSubmitting => _isSubmitting;
  Failure? get failure => _failure;

  /// "그때 이름" 입력란은 장소에 남길 때만 보여준다
  bool get asksPlaceNameThen => _target?.isPlace ?? false;

  /// 사진 업로드(Story_03, 프리사인)가 붙기 전까지는 글이 있어야 보낼 수 있다.
  /// TODO(Story_03): 업로드 API 가 생기면 photoPaths 를 올리고 받은 URL 을 photoUrls 로 보낸다.
  bool get canSubmit => !_isSubmitting && _target != null && _range != null && _content.trim().isNotEmpty;

  void setTarget(AnchorTarget target) {
    _target = target;
    _failure = null;
    notifyListeners();
  }

  /// 한 자리를 바꾸고 나머지 자리를 규칙에 맞게 정리한다
  /// (연도: 불가능해진 자리는 X / 월·일: 둘째 자리를 범위 안으로 — memory_date_digit_rules)
  void setDigit(int index, String digit) {
    _pattern = normalizeDigits(_pattern.withDigit(index, digit), currentYear: currentYear);
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

  /// 갤러리에서 사진을 고른다. 남은 자리 수를 넘는 사진은 버린다.
  Future<void> pickPhotos() async {
    if (!canAddPhoto) return;
    final picked = await _photoPicker.pickMany();
    if (picked.isEmpty) return;
    final room = StoryConstants.maxPhotos - _photoPaths.length;
    _photoPaths = List.unmodifiable([..._photoPaths, ...picked.take(room)]);
    notifyListeners();
  }

  void removePhotoAt(int index) {
    _photoPaths = List.unmodifiable([..._photoPaths]..removeAt(index));
    notifyListeners();
  }

  /// 성공 시 만들어진 기록, 실패 시 null (실패 내용은 failure)
  Future<StoryModel?> submit() async {
    if (!canSubmit) return null;
    _isSubmitting = true;
    _failure = null;
    notifyListeners();

    final anchor = await _resolveAnchor();
    final created = anchor == null
        ? null
        : switch (await _storyRepository.create(_buildRequest(anchor))) {
            Ok(value: final story) => story,
            Err(failure: final failure) => _remember(failure),
          };
    _isSubmitting = false;
    notifyListeners();
    return created;
  }

  // 등록된 곳이면 그대로, 새 장소면 확정해서 PlaceAnchor 로. 확정되면 대상도 바꿔 둔다
  // (기록 저장이 실패해 다시 보관해도 장소를 또 확정하지 않게). 실패하면 null.
  Future<TimelineAnchor?> _resolveAnchor() async {
    final target = _target!;
    final newPlace = target.newPlace;
    if (newPlace == null) return target.anchor;

    switch (await _placeRepository.resolve(newPlace)) {
      case Ok(value: final placeId):
        _target = AnchorTarget(anchor: PlaceAnchor(placeId), name: target.name);
        return _target!.anchor;
      case Err(failure: final failure):
        _remember(failure);
        return null;
    }
  }

  // canSubmit 이 _target 을 보장한 뒤에만 불린다
  CreateStoryRequest _buildRequest(TimelineAnchor anchor) {
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
