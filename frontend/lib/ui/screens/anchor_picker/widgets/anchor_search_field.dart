import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../providers/anchor_search_provider.dart';

// 장소·축제 검색창 (이름 또는 주소)
class AnchorSearchField extends StatelessWidget {
  const AnchorSearchField({super.key});

  @override
  Widget build(BuildContext context) {
    final search = context.read<AnchorSearchProvider>();
    return TextField(
      autofocus: true,
      textInputAction: TextInputAction.search,
      onChanged: search.setQuery,
      onSubmitted: (_) => search.search(),
      decoration: const InputDecoration(
        hintText: '이름이나 주소로 찾기 (예: 카페, 완산동)',
        prefixIcon: Icon(Icons.search),
      ),
    );
  }
}
