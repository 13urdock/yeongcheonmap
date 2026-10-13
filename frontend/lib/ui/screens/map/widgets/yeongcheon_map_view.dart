import 'package:flutter/material.dart';
import 'package:flutter_naver_map/flutter_naver_map.dart';

import '../../../../core/config/constants.dart';
import '../../../../data/models/event_pin_model.dart';
import '../../../../data/models/place_pin_model.dart';
import 'event_marker_builder.dart';
import 'place_marker_builder.dart';

// Map_01 기본 지도 + Map_04 장소·축제 핀. 지도 SDK 를 직접 만지는 유일한 위젯.
// 핀 목록은 부모에게서 받기만 하고 provider/HTTP 를 모른다.
class YeongcheonMapView extends StatefulWidget {
  const YeongcheonMapView({
    super.key,
    required this.placePins,
    required this.eventPins,
    required this.onPlaceTap,
    required this.onEventTap,
    this.showMyLocation = false,
  });

  final List<PlacePinModel> placePins;
  final List<EventPinModel> eventPins;
  final void Function(PlacePinModel pin) onPlaceTap;
  final void Function(EventPinModel pin) onEventTap;

  /// 위치 권한이 허용됐을 때 true → 현재 위치 오버레이 표시(따라가지는 않음)
  final bool showMyLocation;

  @override
  State<YeongcheonMapView> createState() => _YeongcheonMapViewState();
}

class _YeongcheonMapViewState extends State<YeongcheonMapView> {
  NaverMapController? _controller;

  static const _initialCamera = NCameraPosition(
    target: NLatLng(MapConstants.yeongcheonLat, MapConstants.yeongcheonLng),
    zoom: MapConstants.defaultZoom,
  );

  @override
  void didUpdateWidget(covariant YeongcheonMapView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!identical(oldWidget.placePins, widget.placePins) || !identical(oldWidget.eventPins, widget.eventPins)) {
      _syncMarkers();
    }
    if (oldWidget.showMyLocation != widget.showMyLocation) {
      _syncLocationMode();
    }
  }

  void _onMapReady(NaverMapController controller) {
    _controller = controller;
    _syncMarkers();
    _syncLocationMode();
  }

  // 핀 목록이 바뀌면 마커를 전부 지우고 다시 올린다 (증분 갱신은 클러스터링 단계에서)
  Future<void> _syncMarkers() async {
    final controller = _controller;
    if (controller == null) return;
    await controller.clearOverlays();
    final markers = {
      ...PlaceMarkerBuilder.buildAll(widget.placePins, onTap: widget.onPlaceTap),
      ...EventMarkerBuilder.buildAll(widget.eventPins, onTap: widget.onEventTap),
    };
    if (markers.isNotEmpty) {
      await controller.addOverlayAll(markers);
    }
  }

  void _syncLocationMode() {
    final controller = _controller;
    if (controller == null) return;
    controller.setLocationTrackingMode(
      widget.showMyLocation ? NLocationTrackingMode.noFollow : NLocationTrackingMode.none,
    );
  }

  @override
  Widget build(BuildContext context) {
    return NaverMap(
      options: const NaverMapViewOptions(
        initialCameraPosition: _initialCamera,
        locationButtonEnable: true,
        scaleBarEnable: true,
        indoorEnable: false,
        minZoom: 8,
        maxZoom: 20,
      ),
      onMapReady: _onMapReady,
    );
  }
}
