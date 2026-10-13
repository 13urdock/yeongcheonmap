import 'package:flutter_naver_map/flutter_naver_map.dart';

import '../../../../data/models/event_pin_model.dart';
import '../../../theme/retro_colors.dart';

// 축제 핀 → 네이버 지도 마커 (호박색, 장소 핀과 구분). 라벨 = 축제 이름.
class EventMarkerBuilder {
  EventMarkerBuilder._();

  static Set<NMarker> buildAll(List<EventPinModel> pins, {required void Function(EventPinModel) onTap}) {
    return {for (final pin in pins) _build(pin, onTap)};
  }

  static NMarker _build(EventPinModel pin, void Function(EventPinModel) onTap) {
    final marker = NMarker(
      id: 'event:${pin.eventId}',
      position: NLatLng(pin.latitude, pin.longitude),
      iconTintColor: RetroColors.festival,
      caption: NOverlayCaption(text: '✦ ${pin.name}', color: RetroColors.festival),
    );
    marker.setOnTapListener((_) => onTap(pin));
    return marker;
  }
}
