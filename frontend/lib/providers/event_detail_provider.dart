import 'package:flutter/foundation.dart';

import '../core/error/failure.dart';
import '../core/error/result.dart';
import '../data/models/event_detail_model.dart';
import '../data/repositories/event_repository.dart';

// 축제 상세 화면의 머리 정보 상태 (타임라인은 TimelineProvider 가 따로 담당)
class EventDetailProvider extends ChangeNotifier {
  EventDetailProvider({required EventRepository eventRepository, required this.eventId})
      : _eventRepository = eventRepository;

  final EventRepository _eventRepository;
  final String eventId;

  EventDetailModel? _event;
  bool _isLoading = false;
  Failure? _failure;

  EventDetailModel? get event => _event;
  bool get isLoading => _isLoading;
  Failure? get failure => _failure;

  Future<void> load() async {
    _isLoading = true;
    _failure = null;
    notifyListeners();

    final result = await _eventRepository.getDetail(eventId);
    _isLoading = false;
    switch (result) {
      case Ok(value: final event):
        _event = event;
      case Err(failure: final failure):
        _failure = failure;
    }
    notifyListeners();
  }
}
