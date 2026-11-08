import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/permission/location_permission.dart';
import '../../../data/models/anchor_target.dart';
import '../../../data/models/event_pin_model.dart';
import '../../../data/models/place_candidate_model.dart';
import '../../../data/models/place_pin_model.dart';
import '../../../providers/map_provider.dart';
import '../../../routing/app_routes.dart';
import '../../../routing/route_args/event_detail_args.dart';
import '../../../routing/route_args/place_detail_args.dart';
import '../../../routing/route_args/story_write_args.dart';
import 'widgets/map_status_banner.dart';
import 'widgets/map_title_bar.dart';
import 'widgets/yeongcheon_map_view.dart';

// 지도 화면: 지도 + 머리띠 + 상태 배너 + "기억 남기기". 핀을 누르면 장소/축제 상세(연도별 기록)로.
// 지도에 원래 보이는 상표(가게·건물 이름)를 누르면 그 곳으로 바로 기록 작성 — 장소 확정은 보관할 때.
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

  // 지도에서 바로 기록: 작성 화면에서 장소·축제를 고른다. 보관하면 핀(기록 수)을 다시 불러온다.
  Future<void> _write() => _openWrite(const StoryWriteArgs());

  // 상표를 눌렀을 때: 그 장소가 미리 골라진 작성 화면
  Future<void> _writeAtSymbol(PlaceCandidateModel place) {
    return _openWrite(StoryWriteArgs(initialTarget: AnchorTarget.newPlace(place)));
  }

  Future<void> _openWrite(StoryWriteArgs args) async {
    final map = context.read<MapProvider>();
    final result = await Navigator.of(context).pushNamed(AppRoutes.storyWrite, arguments: args);
    if (result == true) await map.load();
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
              onSymbolTap: _writeAtSymbol,
            ),
          ),
          const Positioned(top: 0, left: 0, right: 0, child: SafeArea(child: MapTitleBar())),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: SafeArea(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(12, 0, 12, 4),
                    child: FloatingActionButton.extended(
                      onPressed: _write,
                      icon: const Icon(Icons.edit_note),
                      label: const Text('기억 남기기'),
                    ),
                  ),
                  const MapStatusBanner(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
