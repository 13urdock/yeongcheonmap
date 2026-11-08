import 'package:flutter/material.dart';
import 'package:flutter_naver_map/flutter_naver_map.dart';

import '../../../../core/config/constants.dart';
import '../../../../data/models/event_pin_model.dart';
import '../../../../data/models/place_candidate_model.dart';
import '../../../../data/models/place_pin_model.dart';
import '../../../theme/retro_colors.dart';
import 'event_marker_builder.dart';
import 'place_marker_builder.dart';
import 'square_marker_icon.dart';

// Map_01 기본 지도 + Map_04 장소·축제 핀. 지도 SDK 를 직접 만지는 유일한 위젯.
// 핀 목록은 부모에게서 받기만 하고 provider/HTTP 를 모른다.
// 지도에 원래 보이는 상표(장소 이름 심볼)를 누르면 그 이름·좌표를 PlaceCandidateModel 로 넘긴다.
class YeongcheonMapView extends StatefulWidget {
  const YeongcheonMapView({
    super.key,
    required this.placePins,
    required this.eventPins,
    required this.onPlaceTap,
    required this.onEventTap,
    required this.onSymbolTap,
    this.showMyLocation = false,
  });

  final List<PlacePinModel> placePins;
  final List<EventPinModel> eventPins;
  final void Function(PlacePinModel pin) onPlaceTap;
  final void Function(EventPinModel pin) onEventTap;

  /// 지도 상표(심볼)를 눌렀을 때 — 아직 우리 장소인지 모르는 실제 장소
  final void Function(PlaceCandidateModel place) onSymbolTap;

  /// 위치 권한이 허용됐을 때 true → 현재 위치 오버레이 표시(따라가지는 않음)
  final bool showMyLocation;

  @override
  State<YeongcheonMapView> createState() => _YeongcheonMapViewState();
}

class _YeongcheonMapViewState extends State<YeongcheonMapView> {
  NaverMapController? _controller;

  // 정사각형 아이콘 (지도 준비 때 한 번 구워 재사용)
  NOverlayImage? _placeIcon;
  NOverlayImage? _eventIcon;

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

  Future<void> _onMapReady(NaverMapController controller) async {
    _controller = controller;
    _syncLocationMode();
    final (placeIcon, eventIcon) = await (
      SquareMarkerIcon.build(context, RetroColors.place),
      SquareMarkerIcon.build(context, RetroColors.festival),
    ).wait;
    if (!mounted) return;
    _placeIcon = placeIcon;
    _eventIcon = eventIcon;
    await _syncMarkers();
  }

  // 핀 목록이 바뀌면 마커를 전부 지우고 다시 올린다 (증분 갱신은 클러스터링 단계에서)
  Future<void> _syncMarkers() async {
    final controller = _controller;
    final placeIcon = _placeIcon;
    final eventIcon = _eventIcon;
    if (controller == null || placeIcon == null || eventIcon == null) return;
    await controller.clearOverlays();
    final markers = {
      ...PlaceMarkerBuilder.buildAll(widget.placePins, icon: placeIcon, onTap: widget.onPlaceTap),
      ...EventMarkerBuilder.buildAll(widget.eventPins, icon: eventIcon, onTap: widget.onEventTap),
    };
    if (markers.isNotEmpty) {
      await controller.addOverlayAll(markers);
    }
  }

  void _onSymbolTapped(NSymbolInfo symbol) {
    // 심볼 이름이 두 줄로 오는 경우가 있어 공백 하나로 합친다
    final name = symbol.caption.replaceAll(RegExp(r'\s+'), ' ').trim();
    if (name.isEmpty) return;
    widget.onSymbolTap(PlaceCandidateModel(
      name: name,
      latitude: symbol.position.latitude,
      longitude: symbol.position.longitude,
    ));
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
      onSymbolTapped: _onSymbolTapped,
    );
  }
}
