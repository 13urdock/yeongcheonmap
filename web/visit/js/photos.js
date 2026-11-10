// 사진: 고르기 → 줄이기(긴 변 2000px, JPEG 85%) → presign → 저장소에 PUT. 앱과 같은 크기 기준(명세 §8).
// JPEG 로 다시 그려 보내므로 아이폰 HEIC 도 브라우저가 열 수만 있으면 올라간다.

import { api } from './api.js';

export const MAX_PHOTOS = 5;
const MAX_EDGE = 2000;
const QUALITY = 0.85;
const MAX_BYTES = 10 * 1024 * 1024;

/** File → 줄인 JPEG Blob */
export async function shrinkPhoto(file) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    bitmap = await loadViaImage(file);
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
  if (!blob) throw new Error('이 사진은 열 수 없어요. 다른 사진을 골라 주세요');
  if (blob.size > MAX_BYTES) throw new Error('사진이 너무 커요 (10MB 이하)');
  return blob;
}

function loadViaImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이 사진은 열 수 없어요. 다른 사진을 골라 주세요'));
    img.src = URL.createObjectURL(file);
  });
}

/** 줄인 Blob 들을 올리고 공개 주소를 고른 순서대로 돌려준다. 하나라도 실패하면 전체 실패 */
export async function uploadPhotos(blobs) {
  if (blobs.length === 0) return [];
  const { items } = await api.presign(blobs.map((b) => ({ contentType: 'image/jpeg', size: b.size })));
  await Promise.all(
    items.map(async (item, i) => {
      const res = await fetch(item.uploadUrl, { method: item.method, headers: item.headers, body: blobs[i] }).catch(() => null);
      if (!res || !res.ok) throw new Error('사진을 올리지 못했어요. 다시 시도해 주세요');
    }),
  );
  return items.map((item) => item.publicUrl);
}
