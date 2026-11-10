import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../data/models/anchor_target.dart';
import '../../../../providers/story_write_provider.dart';
import '../../../../routing/app_routes.dart';
import '../../../theme/retro_colors.dart';
import '../../../theme/retro_text_styles.dart';

// "어디의 기억인가요?" — 고른 장소/축제를 보여주고, 고르기·바꾸기는 검색 화면(anchor_picker)으로.
class StoryAnchorSection extends StatelessWidget {
  const StoryAnchorSection({super.key});

  Future<void> _pick(BuildContext context) async {
    final write = context.read<StoryWriteProvider>();
    final picked = await Navigator.of(context).pushNamed(AppRoutes.anchorPicker);
    if (picked is AnchorTarget) write.setTarget(picked);
  }

  @override
  Widget build(BuildContext context) {
    final target = context.select<StoryWriteProvider, AnchorTarget?>((p) => p.target);
    final isEditing = context.select<StoryWriteProvider, bool>((p) => p.isEditing);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text('어디의 기억인가요?', style: RetroTextStyles.title),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.fromLTRB(14, 8, 6, 8),
          decoration: BoxDecoration(
            color: RetroColors.paperDeep,
            border: Border.all(color: target == null ? RetroColors.paperLine : RetroColors.ink),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Row(
            children: [
              if (target != null) ...[_KindStamp(isPlace: target.isPlace), const SizedBox(width: 10)],
              Expanded(
                child: target == null
                    ? const Text('장소나 축제를 골라 주세요', style: RetroTextStyles.caption)
                    : _TargetName(target: target),
              ),
              // 수정할 땐 기록할 곳을 바꿀 수 없다
              if (!isEditing)
                TextButton.icon(
                  onPressed: () => _pick(context),
                  icon: const Icon(Icons.search, size: 18),
                  label: Text(target == null ? '고르기' : '바꾸기'),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

// 이름 + (아직 등록 안 된 실제 장소면) 주소 한 줄
class _TargetName extends StatelessWidget {
  const _TargetName({required this.target});

  final AnchorTarget target;

  @override
  Widget build(BuildContext context) {
    final address = target.newPlace?.address;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(target.name, style: RetroTextStyles.body),
        if (address != null) Text(address, style: RetroTextStyles.caption),
      ],
    );
  }
}

// 장소 / 축제 구분 도장 (지도 핀과 같은 색)
class _KindStamp extends StatelessWidget {
  const _KindStamp({required this.isPlace});

  final bool isPlace;

  @override
  Widget build(BuildContext context) {
    final (label, color) = isPlace ? ('장소', RetroColors.place) : ('축제', RetroColors.festival);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(border: Border.all(color: color, width: 1.5), borderRadius: BorderRadius.circular(2)),
      child: Text(label, style: RetroTextStyles.stamp.copyWith(color: color)),
    );
  }
}
