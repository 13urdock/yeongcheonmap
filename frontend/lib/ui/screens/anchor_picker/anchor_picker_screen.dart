import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/repositories/event_repository.dart';
import '../../../data/repositories/place_repository.dart';
import '../../../providers/anchor_search_provider.dart';
import 'widgets/anchor_result_list.dart';
import 'widgets/anchor_search_field.dart';

// 기록할 곳 고르기: 장소·축제를 검색하거나 목록에서 골라 AnchorTarget 을 돌려준다.
class AnchorPickerScreen extends StatelessWidget {
  const AnchorPickerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (c) => AnchorSearchProvider(
        placeRepository: c.read<PlaceRepository>(),
        eventRepository: c.read<EventRepository>(),
      )..search(),
      child: Scaffold(
        appBar: AppBar(title: const Text('어디의 기억인가요?')),
        body: const Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(padding: EdgeInsets.fromLTRB(16, 16, 16, 8), child: AnchorSearchField()),
            Expanded(child: AnchorResultList()),
          ],
        ),
      ),
    );
  }
}
