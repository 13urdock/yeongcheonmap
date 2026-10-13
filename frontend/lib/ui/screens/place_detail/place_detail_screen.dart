import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/error/failure.dart';
import '../../../data/models/place_detail_model.dart';
import '../../../data/models/timeline_anchor.dart';
import '../../../data/repositories/place_repository.dart';
import '../../../data/repositories/story_repository.dart';
import '../../../providers/place_detail_provider.dart';
import '../../../providers/timeline_provider.dart';
import '../../../routing/app_routes.dart';
import '../../../routing/route_args/place_detail_args.dart';
import '../../../routing/route_args/story_write_args.dart';
import '../../widgets/retro/failure_notice.dart';
import '../../widgets/timeline/timeline_scroll_view.dart';
import 'widgets/place_header.dart';

// Place_01 장소 상세: 머리 정보 + 기억 날짜 순 타임라인 + "기억 남기기"
class PlaceDetailScreen extends StatelessWidget {
  const PlaceDetailScreen({super.key, required this.args});

  final PlaceDetailArgs args;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (c) => PlaceDetailProvider(placeRepository: c.read<PlaceRepository>(), placeId: args.placeId)..load(),
        ),
        ChangeNotifierProvider(
          create: (c) => TimelineProvider(storyRepository: c.read<StoryRepository>(), anchor: PlaceAnchor(args.placeId))
            ..refresh(),
        ),
      ],
      child: const _PlaceDetailView(),
    );
  }
}

class _PlaceDetailView extends StatelessWidget {
  const _PlaceDetailView();

  Future<void> _write(BuildContext context, PlaceDetailModel place) async {
    final timeline = context.read<TimelineProvider>();
    final result = await Navigator.of(context).pushNamed(
      AppRoutes.storyWrite,
      arguments: StoryWriteArgs(anchor: PlaceAnchor(place.placeId), anchorName: place.name),
    );
    if (result == true) await timeline.refresh();
  }

  @override
  Widget build(BuildContext context) {
    final place = context.select<PlaceDetailProvider, PlaceDetailModel?>((p) => p.place);
    final failure = context.select<PlaceDetailProvider, Failure?>((p) => p.failure);

    return Scaffold(
      appBar: AppBar(title: const Text('기억의 자리')),
      body: switch ((place, failure)) {
        (final PlaceDetailModel p, _) => TimelineScrollView(header: PlaceHeader(place: p)),
        (null, final Failure f) => Padding(
            padding: const EdgeInsets.all(16),
            child: FailureNotice(failure: f, onRetry: () => context.read<PlaceDetailProvider>().load()),
          ),
        _ => const Center(child: CircularProgressIndicator()),
      },
      floatingActionButton: place == null
          ? null
          : FloatingActionButton.extended(
              onPressed: () => _write(context, place),
              icon: const Icon(Icons.edit_note),
              label: const Text('기억 남기기'),
            ),
    );
  }
}
