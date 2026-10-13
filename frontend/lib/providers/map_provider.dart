import 'dart:async';

import 'package:flutter/foundation.dart';

import '../core/error/failure.dart';
import '../core/error/result.dart';
import '../data/models/event_pin_model.dart';
import '../data/models/place_pin_model.dart';
import '../data/repositories/event_repository.dart';
import '../data/repositories/place_repository.dart';

// 지도 화면 상태: 장소 핀·축제 핀·로딩·실패. 위젯을 모른다.
class MapProvider extends ChangeNotifier {
  MapProvider({required PlaceRepository placeRepository, required EventRepository eventRepository})
      : _placeRepository = placeRepository,
        _eventRepository = eventRepository;

  final PlaceRepository _placeRepository;
  final EventRepository _eventRepository;

  List<PlacePinModel> _placePins = const [];
  List<EventPinModel> _eventPins = const [];
  bool _isLoading = false;
  Failure? _failure;

  List<PlacePinModel> get placePins => _placePins;
  List<EventPinModel> get eventPins => _eventPins;
  bool get isLoading => _isLoading;
  Failure? get failure => _failure;

  /// 장소·축제 핀을 함께 불러온다 (둘 중 하나가 실패해도 성공한 쪽은 보여준다)
  Future<void> load() async {
    _isLoading = true;
    _failure = null;
    notifyListeners();

    final (placesResult, eventsResult) = await (
      _placeRepository.getPins(),
      _eventRepository.getPins(),
    ).wait;

    _isLoading = false;
    switch (placesResult) {
      case Ok(value: final pins):
        _placePins = pins;
      case Err(failure: final failure):
        _failure = failure;
    }
    switch (eventsResult) {
      case Ok(value: final pins):
        _eventPins = pins;
      case Err(failure: final failure):
        _failure ??= failure;
    }
    notifyListeners();
  }

  Future<void> retry() => load();
}
