import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/error/failure.dart';
import '../../../data/repositories/story_repository.dart';
import '../../../providers/story_write_provider.dart';
import '../../../routing/route_args/story_write_args.dart';
import '../../theme/retro_colors.dart';
import '../../theme/retro_text_styles.dart';
import 'widgets/memory_date_section.dart';
import 'widgets/story_text_fields.dart';

// Story_02 기록 작성: 숫자판 날짜 + 그때 이름 + 글. 성공하면 true 를 돌려주며 닫힌다.
// (사진 첨부는 Story_03 업로드가 붙은 뒤에)
class StoryWriteScreen extends StatelessWidget {
  const StoryWriteScreen({super.key, required this.args});

  final StoryWriteArgs args;

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (c) => StoryWriteProvider(storyRepository: c.read<StoryRepository>(), anchor: args.anchor),
      child: Scaffold(
        appBar: AppBar(title: Text(args.anchorName)),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
          children: const [
            MemoryDateSection(),
            SizedBox(height: 12),
            Divider(),
            SizedBox(height: 12),
            StoryTextFields(),
            SizedBox(height: 12),
            _SubmitFailure(),
          ],
        ),
        bottomNavigationBar: const _SubmitBar(),
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

class _SubmitBar extends StatelessWidget {
  const _SubmitBar();

  Future<void> _submit(BuildContext context) async {
    final navigator = Navigator.of(context);
    final created = await context.read<StoryWriteProvider>().submit();
    if (created != null) navigator.pop(true);
  }

  @override
  Widget build(BuildContext context) {
    final canSubmit = context.select<StoryWriteProvider, bool>((p) => p.canSubmit);
    final isSubmitting = context.select<StoryWriteProvider, bool>((p) => p.isSubmitting);
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
        child: FilledButton(
          onPressed: canSubmit ? () => _submit(context) : null,
          style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(52)),
          child: Text(isSubmitting ? '보관하는 중…' : '이 기억을 보관하기'),
        ),
      ),
    );
  }
}
