// 기억 날짜(부분 날짜) 규칙의 고정값.
// 백엔드 src/common/memory-date/memory-date.constants.ts 와 반드시 같은 값. 원문: docs/ERD_v5.md §2

/// 모르는 자리 문자
const String unknownDigit = 'X';

/// 숫자판 한 칸이 돌아가는 순서: 0 → 1 → … → 9 → X → 0
const List<String> flapSymbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', unknownDigit];

/// 표기 형식: YYYY.MM.DD, 각 자리는 숫자 또는 X
final RegExp memoryDateRegex = RegExp(r'^[0-9X]{4}\.[0-9X]{2}\.[0-9X]{2}$');

/// X 를 채울 때 고려하는 가장 이른 해
const int memoryDateMinYear = 1800;

/// 패턴 자리 수 (YYYYMMDD)
const int memoryDateDigitCount = 8;
