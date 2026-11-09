// Ncloud Storage 프리사인 업로드 시험 (upload 모듈 만들기 전 1회 확인용)
// 실행 (backend 폴더에서): node --env-file=.env scripts/storage-presign-test.mjs
// 확인하는 것: ① 서버 키로 프리사인 PUT 주소 만들기 ② 그 주소로 업로드 ③ 공개 주소로 익명 읽기 ④ 시험 파일 삭제
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const need = ['STORAGE_ENDPOINT', 'STORAGE_REGION', 'STORAGE_BUCKET', 'STORAGE_PUBLIC_BASE_URL', 'STORAGE_ACCESS_KEY', 'STORAGE_SECRET_KEY'];
const missing = need.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('backend/.env 에 비어 있는 값:', missing.join(', '));
  process.exit(1);
}
const env = process.env;

// 1x1 PNG
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const key = `test/presign-${Date.now()}.png`;

// 서명 리전이 문서에 없어서 STORAGE_REGION 먼저, 실패하면 후보를 차례로 시도
const regions = [...new Set([env.STORAGE_REGION, 'kr', 'kr-standard', 'us-east-1'])];

async function tryRegion(region) {
  const client = new S3Client({
    region,
    endpoint: env.STORAGE_ENDPOINT,
    credentials: { accessKeyId: env.STORAGE_ACCESS_KEY, secretAccessKey: env.STORAGE_SECRET_KEY },
    // 최신 SDK 가 기본으로 붙이는 체크섬 파라미터는 S3 호환 스토리지에서 거부될 수 있어 꺼 둔다
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
  const url = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: env.STORAGE_BUCKET, Key: key, ContentType: 'image/png' }),
    { expiresIn: 600 },
  );
  const put = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: png });
  const body = put.ok ? '' : (await put.text()).slice(0, 400);
  return { client, url, status: put.status, body };
}

let ok = null;
for (const region of regions) {
  try {
    const r = await tryRegion(region);
    console.log(`[region=${region}] PUT ${r.status}${r.body ? '\n  ' + r.body : ''}`);
    if (r.status >= 200 && r.status < 300) { ok = { region, ...r }; break; }
  } catch (e) {
    console.log(`[region=${region}] 오류: ${e.message}`);
  }
}
if (!ok) {
  console.log('\n결과: 프리사인 업로드 실패 — 위 응답을 그대로 전달해 주세요.');
  process.exit(1);
}
console.log(`\n① ② 통과: 서명 리전 = ${ok.region}`);
console.log('   업로드 주소 호스트:', new URL(ok.url).host);

const publicUrl = `${env.STORAGE_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`;
const get = await fetch(publicUrl);
console.log(`③ 익명 읽기 ${get.status} ${get.headers.get('content-type') ?? ''}  ${publicUrl}`);
if (!get.ok) console.log('   → 공개 읽기 실패: Block public access 두 항목 해제·Bucket policy 를 확인');

try {
  await ok.client.send(new DeleteObjectCommand({ Bucket: env.STORAGE_BUCKET, Key: key }));
  console.log('④ 시험 파일 삭제 완료');
} catch (e) {
  console.log('④ 시험 파일 삭제 실패(콘솔에서 test/ 폴더 지워 주세요):', e.message);
}
console.log(get.ok ? '\n결과: 전부 통과 — upload 모듈 구현 가능' : '\n결과: 업로드는 되지만 공개 읽기 설정 필요');
