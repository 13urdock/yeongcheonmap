// 타임라인·기록이 붙는 대상: 장소 또는 축제 하나.
sealed class TimelineAnchor {
  const TimelineAnchor();
}

class PlaceAnchor extends TimelineAnchor {
  const PlaceAnchor(this.placeId);

  final String placeId;
}

class EventAnchor extends TimelineAnchor {
  const EventAnchor(this.eventId);

  final String eventId;
}
