// 로그인 토큰 보관 (이 브라우저에만). 관리 기기에서 "나가기"를 누르면 지운다.
const KEY = 'ycm-admin-session';

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? 'null');
  } catch {
    return null;
  }
}

export const session = {
  get() {
    return read();
  },
  save({ accessToken, refreshToken }) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ accessToken, refreshToken }));
    } catch {
      /* 저장소를 못 쓰는 브라우저면 이 탭에서만 유지 */
    }
    memory = { accessToken, refreshToken };
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* 무시 */
    }
    memory = null;
  },
  get accessToken() {
    return (memory ?? read())?.accessToken ?? null;
  },
  get refreshToken() {
    return (memory ?? read())?.refreshToken ?? null;
  },
};

let memory = null;
