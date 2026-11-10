import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/error/failure.dart';
import '../../../data/repositories/place_repository.dart';
import '../../../data/repositories/story_repository.dart';
import '../../../data/repositories/upload_repository.dart';
import '../../../providers/story_write_provider.dart';
import '../../../routing/route_args/story_write_args.dart';
import '../../theme/retro_colors.dart';
import '../../theme/retro_text_styles.dart';
import 'widgets/memory_date_section.dart';
import 'widgets/story_anchor_section.dart';
import 'widgets/story_delete_button.dart';
import 'widgets/story_photo_section.dart';
import 'widgets/story_submit_bar.dart';
import 'widgets/story_text_fields.dart';

// Story_02 기록 작성: 기록할 곳 + 숫자판 날짜 + 그때 이름 + 글 + 사진(최대 5장). 성공하면 true 를 돌려주며 닫힌다.
// 수정 모드(args.editingStory, 타임라인 카드 더블탭): 같은 화면을 값이 채워진 채로 열고, 오른쪽 위에서 삭제.
// 사진은 보관할 때 저장소에 올린다(Story_03). 글 없이 사진만도 보관 가능.
class StoryWriteScreen extends StatelessWidget {
  const StoryWriteScreen({super.key, required this.args});

  final StoryWriteArgs args;

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (c) => StoryWriteProvider(
        storyRepository: c.read<StoryRepository>(),
        placeRepository: c.read<PlaceRepository>(),
        uploadRepository: c.read<UploadRepository>(),
        initialTarget: args.initialTarget,
        editingStory: args.editingStory,
      ),
      child: Scaffold(
        appBar: AppBar(
          title: Text(args.editingStory == null ? '기억 남기기' : '기억 고치기'),
          actions: [if (args.editingStory != null) const StoryDeleteButton()],
        ),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
          children: const [
            StoryAnchorSection(),
            SizedBox(height: 12),
            Divider(),
            SizedBox(height: 12),
            MemoryDateSection(),
            SizedBox(height: 12),
            Divider(),
            SizedBox(height: 12),
            StoryTextFields(),
            SizedBox(height: 16),
            StoryPhotoSection(),
            SizedBox(height: 12),
            _SubmitFailure(),
          ],
        ),
        bottomNavigationBar: const StorySubmitBar(),
      ),
    );
  }
}

class _SubmitFailure extends StatelessWidget {
  const _SubmitFailure();

  @override
  Widget build(BuildContext context) {
    final failure = context.select<StoryWriteProvider, Failure?>((p) => p.failure);
    if (failure == null) return const SizedBox.shrink();
    return Text(failure.message, style: RetroTextStyles.body.copyWith(color: RetroColors.stamp));
  }
}
