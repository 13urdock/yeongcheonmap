import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/models/story_model.dart';
import '../../../data/models/timeline_order.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/timeline_provider.dart';
import 'story_card.dart';
import 'story_date_header.dart';
import 'timeline_footer.dart';
import 'timeline_sort_toggle.dart';

// 장소·축제 상세 공용 스크롤 화면: [머리 정보] + [정렬 전환] + [기록마다 날짜 숫자판 + 카드] + [바닥 상태].
// 서버가 정렬해 준 순서 그대로 그린다. 위쪽 TimelineProvider 를 구독하고, 끝에 가까워지면 다음 페이지를 부른다.
// 로그인한 수집가 본인의 기록은 카드를 두 번 눌러 고칠 수 있다(onEditStory). 전시 기기 = 운영진 계정.
class TimelineScrollView extends StatelessWidget {
  const TimelineScrollView({super.key, required this.header, this.currentName, this.onEditStory});

  final Widget header;

  /// 장소/축제의 지금 이름 — 기록의 그때 이름과 같으면 카드에서 생략
  final String? currentName;

  /// 본인 기록 카드를 두 번 눌렀을 때 (수정 화면 열기)
  final ValueChanged<StoryModel>? onEditStory;

  static const double _loadMoreThresholdPx = 400;

  @override
  Widget build(BuildContext context) {
    final items = context.select<TimelineProvider, List<StoryModel>>((p) => p.items);
    final order = context.select<TimelineProvider, TimelineOrder>((p) => p.order);
    final totalCount = context.select<TimelineProvider, int>((p) => p.totalCount);
    final myUserId = context.select<AuthProvider, String?>((p) => p.user?.userId);
    final onEdit = onEditStory;

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
              itemCount: items.length,
              itemBuilder: (context, i) => Column(
                key: ValueKey(items[i].storyId),
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  StoryDateHeader(pattern: items[i].memoryDate.pattern),
                  StoryCard(
                    story: items[i],
                    currentName: currentName,
                    onDoubleTap: onEdit != null && myUserId != null && items[i].user.userId == myUserId
                        ? () => onEdit(items[i])
                        : null,
                  ),
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
