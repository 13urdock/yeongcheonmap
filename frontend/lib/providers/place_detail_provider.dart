import 'package:flutter/foundation.dart';

import '../core/error/failure.dart';
import '../core/error/result.dart';
import '../data/models/place_detail_model.dart';
import '../data/repositories/place_repository.dart';

// 장소 상세 화면의 머리 정보 상태 (타임라인은 TimelineProvider 가 따로 담당)
class PlaceDetailProvider extends ChangeNotifier {
  PlaceDetailProvider({required PlaceRepository placeRepository, required this.placeId})
      : _placeRepository = placeRepository;

  final PlaceRepository _placeRepository;
  final String placeId;

  PlaceDetailModel? _place;
  bool _isLoading = false;
  Failure? _failure;

  PlaceDetailModel? get place => _place;
  bool get isLoading => _isLoading;
  Failure? get failure => _failure;

  Future<void> load() async {
    _isLoading = true;
    _failure = null;
    notifyListeners();

    final result = await _placeRepository.getDetail(placeId);
    _isLoading = false;
    switch (result) {
      case Ok(value: final place):
        _place = place;
      case Err(failure: final failure):
        _failure = failure;
    }
    notifyListeners();
  }
}
