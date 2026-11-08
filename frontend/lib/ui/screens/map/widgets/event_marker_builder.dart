import 'package:flutter_naver_map/flutter_naver_map.dart';

import '../../../../data/models/event_pin_model.dart';
import '../../../theme/retro_colors.dart';

// 축제 핀 → 네이버 지도 마커: 호박색 정사각형([icon], 장소와 같은 모양·다른 색) + 아래에 축제 이름.
class EventMarkerBuilder {
  EventMarkerBuilder._();

  static Set<NMarker> buildAll(
    List<EventPinModel> pins, {
    required NOverlayImage icon,
    required void Function(EventPinModel) onTap,
  }) {
    return {for (final pin in pins) _build(pin, icon, onTap)};
  }

  static NMarker _build(EventPinModel pin, NOverlayImage icon, void Function(EventPinModel) onTap) {
    final marker = NMarker(
      id: 'event:${pin.eventId}',
      position: NLatLng(pin.latitude, pin.longitude),
      icon: icon,
      anchor: const NPoint(0.5, 0.5),
      captionOffset: 2,
      caption: NOverlayCaption(text: pin.name, color: RetroColors.festival, haloColor: RetroColors.paper),
    );
    marker.setOnTapListener((_) => onTap(pin));
    return marker;
  }
}
