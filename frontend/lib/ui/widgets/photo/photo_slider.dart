import 'package:flutter/material.dart';

import '../../theme/retro_colors.dart';
import '../../theme/retro_text_styles.dart';

// 사진 여러 장을 옆으로 넘겨 보는 슬라이더 — 흰 테두리 인화지 느낌 + "2 / 5" 쪽수.
// 이미지 출처(네트워크/로컬 파일)는 부르는 쪽이 ImageProvider 로 넘긴다.
// onRemove 를 주면 보고 있는 사진 오른쪽 위에 빼기 버튼이 뜬다(작성 화면용).
class PhotoSlider extends StatefulWidget {
  const PhotoSlider({super.key, required this.images, this.onRemove, this.aspectRatio = 4 / 3});

  final List<ImageProvider> images;
  final ValueChanged<int>? onRemove;
  final double aspectRatio;

  @override
  State<PhotoSlider> createState() => _PhotoSliderState();
}

class _PhotoSliderState extends State<PhotoSlider> {
  final PageController _controller = PageController();
  int _page = 0;

  @override
  void didUpdateWidget(covariant PhotoSlider oldWidget) {
    super.didUpdateWidget(oldWidget);
    // 사진이 빠져 지금 쪽이 없어지면 마지막 쪽으로
    final last = widget.images.length - 1;
    if (_page > last && last >= 0) {
      _page = last;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_controller.hasClients) _controller.jumpToPage(last);
      });
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final count = widget.images.length;
    return AspectRatio(
      aspectRatio: widget.aspectRatio,
      child: Container(
        padding: const EdgeInsets.all(5),
        color: Colors.white,
        child: Stack(
          fit: StackFit.expand,
          children: [
            PageView.builder(
              controller: _controller,
              itemCount: count,
              onPageChanged: (i) => setState(() => _page = i),
              itemBuilder: (context, i) => Image(
                image: widget.images[i],
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const ColoredBox(
                  color: RetroColors.paperDeep,
                  child: Icon(Icons.image_not_supported_outlined, color: RetroColors.inkMuted),
                ),
              ),
            ),
            if (count > 1) Positioned(right: 8, bottom: 8, child: _pageBadge(count)),
            if (widget.onRemove != null && count > 0)
              Positioned(top: 6, right: 6, child: _removeButton()),
          ],
        ),
      ),
    );
  }

  Widget _pageBadge(int count) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(color: RetroColors.photoScrim, borderRadius: BorderRadius.circular(10)),
        child: Text('${_page + 1} / $count', style: RetroTextStyles.caption.copyWith(color: RetroColors.paper)),
      );

  Widget _removeButton() => Material(
        color: RetroColors.photoScrim,
        shape: const CircleBorder(),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: () => widget.onRemove!(_page),
          child: const Padding(
            padding: EdgeInsets.all(6),
            child: Icon(Icons.close, size: 18, color: RetroColors.paper),
          ),
        ),
      );
}
