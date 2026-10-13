import 'package:flutter_naver_map/flutter_naver_map.dart';

import '../../../../data/models/place_pin_model.dart';
import '../../../theme/retro_colors.dart';

// 장소 핀 → 네이버 지도 마커 (먹색). 라벨 = 장소의 지금 이름.
class PlaceMarkerBuilder {
  PlaceMarkerBuilder._();

  static Set<NMarker> buildAll(List<PlacePinModel> pins, {required void Function(PlacePinModel) onTap}) {
    return {for (final pin in pins) _build(pin, onTap)};
  }

  static NMarker _build(PlacePinModel pin, void Function(PlacePinModel) onTap) {
    final marker = NMarker(
      id: 'place:${pin.placeId}',
      position: NLatLng(pin.latitude, pin.longitude),
      iconTintColor: RetroColors.ink,
      caption: NOverlayCaption(text: pin.name, color: RetroColors.ink),
    );
    marker.setOnTapListener((_) => onTap(pin));
    return marker;
  }
}
