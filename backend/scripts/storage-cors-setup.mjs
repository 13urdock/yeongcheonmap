// 사진 저장소(Ncloud Storage) 버킷 CORS 설정 — 관람객 웹(브라우저)이 프리사인 주소로 사진을 PUT 할 수 있게.
// (앱은 브라우저가 아니라 CORS 가 필요 없었다. 웹은 다른 주소(map.burdocklab.com)에서 저장소로 올리므로 필요)
// 실행 (backend 폴더, .env 에 STORAGE_* 가 있어야 함):
//   node scripts/storage-cors-setup.mjs            → 설정 + 확인
//   node scripts/storage-cors-setup.mjs --check    → 지금 설정만 보기
// 허용 주소를 바꾸려면: CORS_ORIGINS=https://map.burdocklab.com,http://localhost:8080 node scripts/storage-cors-setup.mjs
// 주의: PutBucketCors 는 버킷의 CORS 설정 전체를 덮어쓴다.
import 'dotenv/config';
import { GetBucketCorsCommand, PutBucketCorsCommand, S3Client } from '@aws-sdk/client-s3';

const need = ['STORAGE_ENDPOINT', 'STORAGE_REGION', 'STORAGE_BUCKET', 'STORAGE_ACCESS_KEY', 'STORAGE_SECRET_KEY'];
const missing = need.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`.env 에 없는 값: ${missing.join(', ')}`);
  process.exit(1);
}

const bucket = process.env.STORAGE_BUCKET;
const origins = (process.env.CORS_ORIGINS ?? 'https://map.burdocklab.com')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const client = new S3Client({
  region: process.env.STORAGE_REGION,
  endpoint: process.env.STORAGE_ENDPOINT,
  credentials: { accessKeyId: process.env.STORAGE_ACCESS_KEY, secretAccessKey: process.env.STORAGE_SECRET_KEY },
  // storage-presigner 와 같은 설정 (S3 호환 저장소가 최신 SDK 기본 체크섬을 거부할 수 있음)
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

const corsConfiguration = {
  CORSRules: [
    {
      ID: 'visitor-web-upload',
      AllowedOrigins: origins,
      AllowedMethods: ['PUT', 'GET'], // PUT = 프리사인 업로드, GET = 사진 보기
      AllowedHeaders: ['content-type'], // 웹이 보내는 헤더는 Content-Type 하나 (프리사인 서명에 포함된 값)
      MaxAgeSeconds: 3600, // 미리 확인(OPTIONS) 결과를 브라우저가 1시간 기억
    },
  ],
};

async function show() {
  try {
    const res = await client.send(new GetBucketCorsCommand({ Bucket: bucket }));
    console.log('지금 CORS 설정:');
    console.log(JSON.stringify(res.CORSRules, null, 2));
  } catch (e) {
    if (e.name === 'NoSuchCORSConfiguration') console.log('지금 CORS 설정: 없음');
    else throw e;
  }
}

// 브라우저가 업로드 전에 보내는 미리 확인 요청(OPTIONS)을 흉내 내서 허용되는지 본다
async function preflight(origin) {
  const url = `${process.env.STORAGE_PUBLIC_BASE_URL ?? `https://${bucket}.${new URL(process.env.STORAGE_ENDPOINT).host}`}/stories/cors-check.jpg`;
  const res = await fetch(url, {
    method: 'OPTIONS',
    headers: { Origin: origin, 'Access-Control-Request-Method': 'PUT', 'Access-Control-Request-Headers': 'content-type' },
  });
  const allowOrigin = res.headers.get('access-control-allow-origin');
  const ok = res.ok && (allowOrigin === origin || allowOrigin === '*');
  console.log(`${ok ? '통과' : '실패'}  미리 확인(OPTIONS) ${origin} → ${res.status}, allow-origin=${allowOrigin ?? '(없음)'}`);
  return ok;
}

try {
  if (!process.argv.includes('--check')) {
    await client.send(
      new PutBucketCorsCommand({
        Bucket: bucket,
        CORSConfiguration: corsConfiguration,
        ChecksumAlgorithm: 'SHA256', // Ncloud Storage 는 이 요청에 Content-MD5 또는 x-amz-checksum-sha256 을 요구
      }),
    );
    console.log(`설정 완료: 버킷 ${bucket}, 허용 주소 ${origins.join(', ')}`);
  }
  await show();
  let allOk = true;
  for (const o of origins) allOk = (await preflight(o)) && allOk;
  process.exit(allOk ? 0 : 1);
} catch (e) {
  console.error(`실패: ${e.name ?? ''} ${e.message}`);
  if (e.$metadata?.httpStatusCode === 403) console.error('→ 키에 버킷 CORS 변경 권한이 없을 수 있어요 (Sub Account 권한 확인)');
  process.exit(1);
}
