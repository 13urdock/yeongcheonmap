// 응답 속 기억 날짜 (API 명세 v4 §2). 서버가 계산한 범위를 그대로 담는다.
class MemoryDateModel {
  const MemoryDateModel({
    required this.pattern,
    required this.from,
    required this.to,
    required this.yearFrom,
    required this.yearTo,
  });

  factory MemoryDateModel.fromJson(Map<String, dynamic> json) {
    return MemoryDateModel(
      pattern: json['pattern'] as String,
      from: json['from'] as String,
      to: json['to'] as String,
      yearFrom: json['yearFrom'] as int,
      yearTo: json['yearTo'] as int,
    );
  }

  final String pattern; // "199X.XX.XX"
  final String from; // "1990-01-01"
  final String to;
  final int yearFrom; // 연도 묶음 기준
  final int yearTo;

  Map<String, dynamic> toJson() => {
        'pattern': pattern,
        'from': from,
        'to': to,
        'yearFrom': yearFrom,
        'yearTo': yearTo,
      };
}
