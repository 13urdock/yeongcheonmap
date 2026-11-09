// 사진 업로드 끝까지 확인 (POST /uploads/presign → 저장소 PUT → 공개 주소 GET)
// 실행 (backend 폴더, 서버를 다른 창에서 npm run start:dev 로 띄운 뒤):
//   node scripts/upload-e2e-test.mjs
// 배포 서버로: API_URL=https://map.burdocklab.com/api/v1 을 앞에 붙이거나 .env 에 넣는다
// 로그인: 시드 수집가(seed@yeongcheonmap.local + SEED_USER_PASSWORD). 다른 계정은 TEST_EMAIL / TEST_PASSWORD.
// 올린 시험 사진(1x1 PNG)은 저장소 stories/ 에 남는다 — 콘솔에서 지워도 된다(스토리에는 안 붙음).
import 'dotenv/config'; // backend/.env 읽기 (node --env-file 이 없는 Node 버전에서도 동작). 이미 설정된 환경변수는 덮어쓰지 않음

const API = (process.env.API_URL ?? `http://localhost:${process.env.PORT ?? 8080}/api/v1`).replace(/\/$/, '');
const email = process.env.TEST_EMAIL ?? 'seed@yeongcheonmap.local';
const password = process.env.TEST_PASSWORD ?? process.env.SEED_USER_PASSWORD;
if (!password) {
  console.error('비밀번호가 없습니다: .env 의 SEED_USER_PASSWORD 또는 TEST_PASSWORD');
  process.exit(1);
}
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

let failed = false;
const check = (ok, label, detail = '') => {
  console.log(`${ok ? '통과' : '실패'}  ${label}${detail ? '  ' + detail : ''}`);
  if (!ok) failed = true;
  return ok;
};
async function api(path, body, token) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => null) };
}

console.log(`API = ${API}\n`);

// 0) 로그인 없이 → 401
const noAuth = await api('/uploads/presign', { files: [{ contentType: 'image/png', size: png.length }] });
check(noAuth.status === 401, '인증 없으면 401', `(${noAuth.status})`);

// 1) 로그인
const login = await api('/auth/login', { email, password });
const token = login.json?.data?.accessToken;
if (!check(!!token, `로그인 ${email}`, `(${login.status} ${login.json?.error?.code ?? ''})`)) process.exit(1);

// 2) 잘못된 요청 → 400
const badType = await api('/uploads/presign', { files: [{ contentType: 'image/gif', size: 10 }] }, token);
check(badType.status === 400, 'gif 는 400', `(${badType.status})`);
const tooBig = await api('/uploads/presign', { files: [{ contentType: 'image/jpeg', size: 10485761 }] }, token);
check(tooBig.status === 400, '10MB 초과는 400', `(${tooBig.status})`);
const six = await api('/uploads/presign', { files: Array(6).fill({ contentType: 'image/jpeg', size: 1 }) }, token);
check(six.status === 400, '6장은 400', `(${six.status})`);

// 3) 프리사인 발급
const presign = await api('/uploads/presign', { files: [{ contentType: 'image/png', size: png.length }] }, token);
const item = presign.json?.data?.items?.[0];
if (!check(presign.status === 200 && !!item, '프리사인 발급', `(${presign.status} ${presign.json?.error?.code ?? ''})`)) {
  if (presign.json?.error?.code === 'STORAGE_UNAVAILABLE') console.log('   → 서버 .env 의 STORAGE_* 값 확인');
  process.exit(1);
}
console.log(`   publicUrl = ${item.publicUrl}\n   expiresAt = ${item.expiresAt}`);
check(/\/stories\/\d{4}-\d{2}\/[0-9a-f-]{36}\.png$/.test(item.publicUrl), '키 형식 stories/YYYY-MM/uuid.png');

// 4) 다른 Content-Type 으로 올리면 서명 불일치로 거절돼야 함
const wrong = await fetch(item.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: png });
check(wrong.status === 403, '다른 Content-Type PUT 은 거절', `(${wrong.status})`);

// 5) 받은 그대로 PUT
const put = await fetch(item.uploadUrl, { method: item.method, headers: item.headers, body: png });
check(put.ok, '저장소 PUT', `(${put.status}${put.ok ? '' : ' ' + (await put.text()).slice(0, 300)})`);

// 6) 공개 주소 익명 GET
const get = await fetch(item.publicUrl);
check(get.ok && get.headers.get('content-type') === 'image/png', '공개 주소 읽기', `(${get.status} ${get.headers.get('content-type')})`);

console.log(failed ? '\n결과: 실패 항목이 있어요 — 위 출력을 그대로 전달해 주세요.' : '\n결과: 전부 통과 — 앱 쪽 작업으로 넘어가도 됩니다.');
process.exit(failed ? 1 : 0);
