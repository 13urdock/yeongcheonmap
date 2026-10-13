import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/error/failure.dart';
import '../../../data/models/event_detail_model.dart';
import '../../../data/models/timeline_anchor.dart';
import '../../../data/repositories/event_repository.dart';
import '../../../data/repositories/story_repository.dart';
import '../../../providers/event_detail_provider.dart';
import '../../../providers/timeline_provider.dart';
import '../../../routing/app_routes.dart';
import '../../../routing/route_args/event_detail_args.dart';
import '../../../routing/route_args/story_write_args.dart';
import '../../widgets/retro/failure_notice.dart';
import '../../widgets/timeline/timeline_scroll_view.dart';
import 'widgets/event_header.dart';

// Event_01·02 축제 상세: 머리 정보 + 기억 날짜 순 타임라인 + "기억 남기기"
class EventDetailScreen extends StatelessWidget {
  const EventDetailScreen({super.key, required this.args});

  final EventDetailArgs args;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (c) => EventDetailProvider(eventRepository: c.read<EventRepository>(), eventId: args.eventId)..load(),
        ),
        ChangeNotifierProvider(
          create: (c) => TimelineProvider(storyRepository: c.read<StoryRepository>(), anchor: EventAnchor(args.eventId))
            ..refresh(),
        ),
      ],
      child: const _EventDetailView(),
    );
  }
}

class _EventDetailView extends StatelessWidget {
  const _EventDetailView();

  Future<void> _write(BuildContext context, EventDetailModel event) async {
    final timeline = context.read<TimelineProvider>();
    final result = await Navigator.of(context).pushNamed(
      AppRoutes.storyWrite,
      arguments: StoryWriteArgs(anchor: EventAnchor(event.eventId), anchorName: event.name),
    );
    if (result == true) await timeline.refresh();
  }

  @override
  Widget build(BuildContext context) {
    final event = context.select<EventDetailProvider, EventDetailModel?>((p) => p.event);
    final failure = context.select<EventDetailProvider, Failure?>((p) => p.failure);

    return Scaffold(
      appBar: AppBar(title: const Text('축제의 기억')),
      body: switch ((event, failure)) {
        (final EventDetailModel e, _) => TimelineScrollView(header: EventHeader(event: e)),
        (null, final Failure f) => Padding(
            padding: const EdgeInsets.all(16),
            child: FailureNotice(failure: f, onRetry: () => context.read<EventDetailProvider>().load()),
          ),
        _ => const Center(child: CircularProgressIndicator()),
      },
      floatingActionButton: event == null
          ? null
          : FloatingActionButton.extended(
              onPressed: () => _write(context, event),
              icon: const Icon(Icons.edit_note),
              label: const Text('기억 남기기'),
            ),
    );
  }
}
