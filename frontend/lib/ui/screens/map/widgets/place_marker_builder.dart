import 'package:flutter_naver_map/flutter_naver_map.dart';

import '../../../../data/models/place_pin_model.dart';
import '../../../theme/retro_colors.dart';

// 장소 핀 → 네이버 지도 마커: 울트라바이올렛 정사각형([icon]) + 아래에 지금 이름.
class PlaceMarkerBuilder {
  PlaceMarkerBuilder._();

  static Set<NMarker> buildAll(
    List<PlacePinModel> pins, {
    required NOverlayImage icon,
    required void Function(PlacePinModel) onTap,
  }) {
    return {for (final pin in pins) _build(pin, icon, onTap)};
  }

  static NMarker _build(PlacePinModel pin, NOverlayImage icon, void Function(PlacePinModel) onTap) {
    final marker = NMarker(
      id: 'place:${pin.placeId}',
      position: NLatLng(pin.latitude, pin.longitude),
      icon: icon,
      anchor: const NPoint(0.5, 0.5), // 정사각형 가운데가 그 자리
      captionOffset: 2,
      caption: NOverlayCaption(text: pin.name, color: RetroColors.place, haloColor: RetroColors.paper),
    );
    marker.setOnTapListener((_) => onTap(pin));
    return marker;
  }
}
