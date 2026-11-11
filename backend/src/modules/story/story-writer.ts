import { StorySource } from './story-source';

// 기록을 저장하는 주체. 컨트롤러(앱·관람객 웹·관리 웹)가 만들어 StoryCreateService 에 넘긴다.
// - userId: 저장한 계정 (관람객 웹은 수집가)
// - contributorId: 기록을 남긴 사람. 비우면 계정의 기록자로 정한다.
//   나중에 관람객이 닉네임·전화번호를 남기면 그 기록자를 여기에 넣는다.
export interface StoryWriter {
  userId: string;
  source: StorySource;
  contributorId?: string;
}
