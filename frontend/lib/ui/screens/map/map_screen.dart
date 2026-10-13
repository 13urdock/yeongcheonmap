import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/permission/location_permission.dart';
import '../../../data/models/event_pin_model.dart';
import '../../../data/models/place_pin_model.dart';
import '../../../providers/map_provider.dart';
import '../../../routing/app_routes.dart';
import '../../../routing/route_args/event_detail_args.dart';
import '../../../routing/route_args/place_detail_args.dart';
import 'widgets/map_status_banner.dart';
import 'widgets/map_title_bar.dart';
import 'widgets/yeongcheon_map_view.dart';

// 지도 화면: 지도 + 머리띠 + 상태 배너. 핀을 누르면 장소/축제 상세(연도별 기록)로.
class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  bool _locationGranted = false;

  @override
  void initState() {
    super.initState();
    _requestLocation();
  }

  Future<void> _requestLocation() async {
    final granted = await AppLocationPermission.request();
    if (!mounted) return;
    setState(() => _locationGranted = granted);
  }

  void _openPlace(PlacePinModel pin) {
    Navigator.of(context).pushNamed(AppRoutes.placeDetail, arguments: PlaceDetailArgs(placeId: pin.placeId));
  }

  void _openEvent(EventPinModel pin) {
    Navigator.of(context).pushNamed(AppRoutes.eventDetail, arguments: EventDetailArgs(eventId: pin.eventId));
  }

  @override
  Widget build(BuildContext context) {
    final placePins = context.select<MapProvider, List<PlacePinModel>>((p) => p.placePins);
    final eventPins = context.select<MapProvider, List<EventPinModel>>((p) => p.eventPins);

    return Scaffold(
      body: Stack(
        children: [
          Positioned.fill(
            child: YeongcheonMapView(
              placePins: placePins,
              eventPins: eventPins,
              showMyLocation: _locationGranted,
              onPlaceTap: _openPlace,
              onEventTap: _openEvent,
            ),
          ),
          const Positioned(top: 0, left: 0, right: 0, child: SafeArea(child: MapTitleBar())),
          const Positioned(left: 0, right: 0, bottom: 0, child: SafeArea(child: MapStatusBanner())),
        ],
      ),
    );
  }
}
