// 서버 호출 한 곳. 같은 주소(map.burdocklab.com)의 /api/v1 을 부른다.
// 응답 envelope { success, data } / { success:false, error:{code,message} } 를 풀어 준다.

const BASE = '/api/v1';

export class ApiError extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

let visitorCode = '';
export function setVisitorCode(code) {
  visitorCode = code;
}

async function request(method, path, { body, query, write = false } = {}) {
  const url = new URL(BASE + path, location.origin);
  if (query) Object.entries(query).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (write) headers['X-Visitor-Code'] = visitorCode;

  let res;
  try {
    res = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError('NETWORK', '인터넷 연결을 확인해 주세요', 0);
  }
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new ApiError(json?.error?.code ?? 'UNKNOWN', json?.error?.message ?? '잠시 후 다시 시도해 주세요', res.status);
  }
  return json.data;
}

export const api = {
  config: () => request('GET', '/visitor/config'),
  events: () => request('GET', '/events'),
  places: () => request('GET', '/places', { query: { size: 500 } }),
  searchPlaces: (q) => request('GET', '/places', { query: { q, size: 20 } }),
  candidates: (q) => request('GET', '/places/candidates', { query: { q } }),
  resolvePlace: (place) => request('POST', '/visitor/places/resolve', { body: place, write: true }),
  presign: (files) => request('POST', '/visitor/uploads/presign', { body: { files }, write: true }),
  createStory: (story) => request('POST', '/visitor/stories', { body: story, write: true }),
};
