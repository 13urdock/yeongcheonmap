import 'package:flutter/foundation.dart';

import '../core/config/constants.dart';
import '../core/error/failure.dart';
import '../core/error/result.dart';
import '../core/media/photo_picker.dart';
import '../core/media/photo_source.dart';
import '../core/memory_date/memory_date_digit_rules.dart';
import '../core/memory_date/memory_date_pattern.dart';
import '../core/memory_date/memory_date_range.dart';
import '../data/models/anchor_target.dart';
import '../data/models/create_story_request.dart';
import '../data/models/story_model.dart';
import '../data/models/timeline_anchor.dart';
import '../data/models/update_story_request.dart';
import '../data/repositories/place_repository.dart';
import '../data/repositories/story_repository.dart';
import '../data/repositories/upload_repository.dart';

// 기록 작성 화면 상태: 기록할 곳(장소/축제), 숫자판 날짜, 그때 이름, 글, 사진(최대 5장), 전송.
// 날짜가 가능한지(범위)는 core/memory_date 로 즉시 계산해 버튼 활성화·안내에 쓴다. 최종 판단은 서버.
// 보관 순서: (새 장소면) 장소 확정(resolve) → 사진 업로드(Story_03, 프리사인) → 기록 저장.
// 중간에 실패해 다시 보관해도 이미 끝난 단계(확정된 장소·올라간 사진)는 다시 하지 않는다.
// 수정 모드(editingStory): 값을 채워 시작, 기록할 곳은 고정, 보관 = PATCH(사진 목록 전체 교체), 삭제 가능.
//   이미 올라간 사진은 공개 주소를 그대로 "출처"로 들고 있다가(photo_source) 새로 고른 사진만 올린다.
class StoryWriteProvider extends ChangeNotifier {
  StoryWriteProvider({
    required StoryRepository storyRepository,
    required PlaceRepository placeRepository,
    required UploadRepository uploadRepository,
    AnchorTarget? initialTarget,
    StoryModel? editingStory,
    PhotoPicker? photoPicker,
    DateTime Function()? clock,
  })  : _storyRepository = storyRepository,
        _placeRepository = placeRepository,
        _uploadRepository = uploadRepository,
        _target = initialTarget,
        _editing = editingStory,
        _photoPicker = photoPicker ?? PhotoPicker(),
        _clock = clock ?? DateTime.now {
    final editing = editingStory;
    if (editing != null) _fillFrom(editing);
    _range = computeMemoryDateRange(_pattern, _clock());
  }

  // 수정 모드 시작값. 올라가 있는 사진은 주소 → 주소로 "이미 올라감" 표시
  void _fillFrom(StoryModel story) {
    _pattern = MemoryDatePattern.tryParse(story.memoryDate.pattern) ?? MemoryDatePattern.unknown();
    _placeNameThen = story.placeNameThen ?? '';
    _content = story.content ?? '';
    _photoPaths = List.unmodifiable([for (final p in story.photos) p.imageUrl]);
    for (final url in _photoPaths) {
      _uploadedUrls[url] = url;
    }
  }

  final StoryRepository _storyRepository;
  final PlaceRepository _placeRepository;
  final UploadRepository _uploadRepository;
  final PhotoPicker _photoPicker;
  final DateTime Function() _clock;
  final StoryModel? _editing;

  AnchorTarget? _target;

  MemoryDatePattern _pattern = MemoryDatePattern.unknown();
  MemoryDateRange? _range;
  String _placeNameThen = '';
  String _content = '';
  List<String> _photoPaths = const [];
  bool _isSubmitting = false;
  bool _isUploadingPhotos = false;
  bool _isDeleting = false;

  /// 이미 저장소에 올라간 사진: 로컬 경로 → 공개 주소 (다시 보관할 때 재업로드 방지)
  final Map<String, String> _uploadedUrls = {};
  Failure? _failure;

  /// 기록할 곳. null 이면 아직 안 고름
  AnchorTarget? get target => _target;
  MemoryDatePattern get pattern => _pattern;

  /// null 이면 "가능한 날짜 없음"
  MemoryDateRange? get range => _range;
  String get placeNameThen => _placeNameThen;
  String get content => _content;

  /// 사진 출처 목록 (순서대로, 최대 StoryConstants.maxPhotos): 로컬 경로 또는 이미 올라간 공개 주소 (photo_source)
  List<String> get photoPaths => _photoPaths;
  bool get canAddPhoto => !_isBusy && _photoPaths.length < StoryConstants.maxPhotos;

  /// 수정 모드인지 (기존 기록 고치기)
  bool get isEditing => _editing != null;
  bool get isDeleting => _isDeleting;
  bool get _isBusy => _isSubmitting || _isDeleting;

  /// 숫자판 연도 상한선 계산용 (올해)
  int get currentYear => _clock().year;
  bool get isSubmitting => _isSubmitting;

  /// 보관 중 사진을 올리는 단계인지 (버튼 문구용)
  bool get isUploadingPhotos => _isUploadingPhotos;
  Failure? get failure => _failure;

  /// "그때 이름" 입력란은 장소에 남길 때만 보여준다
  bool get asksPlaceNameThen => _target?.isPlace ?? false;

  /// 글 또는 사진 중 하나는 있어야 보관할 수 있다 (사진만 / 글만 가능 — Story_03)
  bool get hasContent => _content.trim().isNotEmpty || _photoPaths.isNotEmpty;
  bool get canSubmit => !_isBusy && _target != null && _range != null && hasContent;

  void setTarget(AnchorTarget target) {
    if (isEditing) return; // 수정할 땐 기록할 곳을 바꾸지 않는다 (명세: 앵커는 수정 불가)
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
    if (_isBusy) return; // 올리는 중엔 목록을 바꾸지 않는다
    _photoPaths = List.unmodifiable([..._photoPaths]..removeAt(index));
    notifyListeners();
  }

  /// 성공 시 만들어진(수정 모드면 고쳐진) 기록, 실패 시 null (실패 내용은 failure)
  Future<StoryModel?> submit() async {
    if (!canSubmit) return null;
    _isSubmitting = true;
    _failure = null;
    notifyListeners();

    final editing = _editing;
    final saved = editing != null ? await _submitEdit(editing) : await _submitNew();
    _isSubmitting = false;
    notifyListeners();
    return saved;
  }

  Future<StoryModel?> _submitNew() async {
    final anchor = await _resolveAnchor();
    final photoUrls = anchor == null ? null : await _uploadPhotos();
    if (anchor == null || photoUrls == null) return null;
    return switch (await _storyRepository.create(_buildRequest(anchor, photoUrls))) {
      Ok(value: final story) => story,
      Err(failure: final failure) => _remember(failure),
    };
  }

  // 수정: 새로 고른 사진만 올리고, 사진 목록 전체를 지금 순서대로 보낸다
  Future<StoryModel?> _submitEdit(StoryModel editing) async {
    final photoUrls = await _uploadPhotos();
    if (photoUrls == null) return null;
    final request = UpdateStoryRequest(
      memoryDate: _pattern.toString(),
      placeNameThen: asksPlaceNameThen ? _placeNameThen.trim() : null,
      content: _content.trim(),
      photoUrls: photoUrls,
    );
    return switch (await _storyRepository.update(editing.storyId, request)) {
      Ok(value: final story) => story,
      Err(failure: final failure) => _remember(failure),
    };
  }

  /// 수정 중인 기록을 지운다. 성공하면 true (실패 내용은 failure)
  Future<bool> delete() async {
    final editing = _editing;
    if (editing == null || _isBusy) return false;
    _isDeleting = true;
    _failure = null;
    notifyListeners();
    final result = await _storyRepository.delete(editing.storyId);
    _isDeleting = false;
    if (result case Err(failure: final failure)) _remember(failure);
    notifyListeners();
    return result is Ok;
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

  // 아직 안 올라간 사진만 올리고, 고른 순서대로 공개 주소를 돌려준다. 실패하면 null.
  Future<List<String>?> _uploadPhotos() async {
    final pending = [
      for (final path in _photoPaths)
        if (!_uploadedUrls.containsKey(path) && !isRemotePhoto(path)) path,
    ];
    if (pending.isNotEmpty) {
      _isUploadingPhotos = true;
      notifyListeners();
      final result = await _uploadRepository.uploadPhotos(pending);
      _isUploadingPhotos = false;
      notifyListeners();
      switch (result) {
        case Ok(value: final urls):
          for (var i = 0; i < pending.length; i++) {
            _uploadedUrls[pending[i]] = urls[i];
          }
        case Err(failure: final failure):
          _remember(failure);
          return null;
      }
    }
    return [for (final path in _photoPaths) _uploadedUrls[path]!];
  }

  // canSubmit 이 _target 을 보장한 뒤에만 불린다
  CreateStoryRequest _buildRequest(TimelineAnchor anchor, List<String> photoUrls) {
    final content = _content.trim();
    final nameThen = _placeNameThen.trim();
    return CreateStoryRequest(
      placeId: switch (anchor) { PlaceAnchor(:final placeId) => placeId, EventAnchor() => null },
      eventId: switch (anchor) { EventAnchor(:final eventId) => eventId, PlaceAnchor() => null },
      memoryDate: _pattern.toString(),
      placeNameThen: asksPlaceNameThen && nameThen.isNotEmpty ? nameThen : null,
      content: content.isEmpty ? null : content,
      photoUrls: photoUrls,
    );
  }

  StoryModel? _remember(Failure failure) {
    _failure = failure;
    return null;
  }
}
