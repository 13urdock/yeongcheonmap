import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/models/story_model.dart';
import '../../../data/models/timeline_order.dart';
import '../../../providers/timeline_provider.dart';
import 'story_card.dart';
import 'timeline_footer.dart';
import 'timeline_grouping.dart';
import 'timeline_sort_toggle.dart';
import 'timeline_year_header.dart';

// 장소·축제 상세 공용 스크롤 화면: [머리 정보] + [정렬 전환] + [연도 묶음별 기록] + [바닥 상태].
// 위쪽 TimelineProvider 를 구독한다. 끝에 가까워지면 다음 페이지를 부른다.
class TimelineScrollView extends StatelessWidget {
  const TimelineScrollView({super.key, required this.header});

  final Widget header;

  static const double _loadMoreThresholdPx = 400;

  @override
  Widget build(BuildContext context) {
    final items = context.select<TimelineProvider, List<StoryModel>>((p) => p.items);
    final order = context.select<TimelineProvider, TimelineOrder>((p) => p.order);
    final totalCount = context.select<TimelineProvider, int>((p) => p.totalCount);
    final groups = groupStoriesByYear(items);

    return NotificationListener<ScrollNotification>(
      onNotification: (n) {
        if (n.metrics.extentAfter < _loadMoreThresholdPx) context.read<TimelineProvider>().loadMore();
        return false;
      },
      child: RefreshIndicator(
        onRefresh: () => context.read<TimelineProvider>().refresh(),
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(child: header),
            SliverToBoxAdapter(
              child: TimelineSortToggle(
                order: order,
                totalCount: totalCount,
                onChanged: (_) => context.read<TimelineProvider>().toggleOrder(),
              ),
            ),
            SliverList.builder(
              itemCount: groups.length,
              itemBuilder: (context, i) => Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TimelineYearHeader(group: groups[i]),
                  for (final story in groups[i].stories) StoryCard(key: ValueKey(story.storyId), story: story),
                ],
              ),
            ),
            const SliverToBoxAdapter(child: TimelineFooter()),
          ],
        ),
      ),
    );
  }
}
