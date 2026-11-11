// 서버 호출 한 곳. 같은 주소의 /api/v1 을 부른다 (API 명세 v4.8 §12 /admin/*).
// - 응답 envelope { success, data } / { success:false, error } 를 풀어 준다
// - access 토큰이 만료(401)되면 refresh 로 한 번 갱신하고 다시 부른다
import { session } from './session.js';

const BASE = '/api/v1';

export class ApiError extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

let onSignedOut = () => {};
export function setSignedOutHandler(fn) {
  onSignedOut = fn;
}

function buildUrl(path, query) {
  const url = new URL(BASE + path, location.origin);
  if (query) Object.entries(query).forEach(([k, v]) => v != null && v !== '' && url.searchParams.set(k, v));
  return url;
}

async function send(method, path, { body, query, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && session.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;
  try {
    return await fetch(buildUrl(path, query), { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError('NETWORK', '인터넷 연결을 확인해 주세요', 0);
  }
}

let refreshing = null;
async function refreshTokens() {
  const refreshToken = session.refreshToken;
  if (!refreshToken) return false;
  refreshing ??= send('POST', '/auth/refresh', { body: { refreshToken }, auth: false })
    .then(async (res) => {
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) return false;
      session.save(json.data);
      return true;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function raw(method, path, options = {}) {
  let res = await send(method, path, options);
  if (res.status === 401 && options.auth !== false && (await refreshTokens())) {
    res = await send(method, path, options);
  }
  if (res.status === 401 && options.auth !== false) {
    session.clear();
    onSignedOut();
  }
  return res;
}

async function request(method, path, options) {
  const res = await raw(method, path, options);
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new ApiError(json?.error?.code ?? 'UNKNOWN', json?.error?.message ?? '잠시 후 다시 시도해 주세요', res.status);
  }
  return json.data;
}

export const api = {
  login: (email, password) => request('POST', '/auth/login', { body: { email, password }, auth: false }),
  me: () => request('GET', '/admin/me'),

  stats: (period) => request('GET', '/admin/stats', { query: period }),
  contributors: (period) => request('GET', '/admin/contributors', { query: period }),

  stories: (query) => request('GET', '/admin/stories', { query }),
  story: (id) => request('GET', `/admin/stories/${id}`),
  createStory: (body) => request('POST', '/admin/stories', { body }),
  updateStory: (id, body) => request('PATCH', `/admin/stories/${id}`, { body }),
  setHidden: (id, hidden) => request('PATCH', `/admin/stories/${id}/visibility`, { body: { hidden } }),
  trashStory: (id) => request('DELETE', `/admin/stories/${id}`),
  restoreStory: (id) => request('POST', `/admin/stories/${id}/restore`),
  purgeStory: (id) => request('DELETE', `/admin/stories/${id}/permanent`),

  places: (query) => request('GET', '/admin/places', { query }),
  place: (id) => request('GET', `/admin/places/${id}`),
  createPlace: (body) => request('POST', '/admin/places', { body }),
  updatePlace: (id, body) => request('PATCH', `/admin/places/${id}`, { body }),
  deletePlace: (id) => request('DELETE', `/admin/places/${id}`),
  resolvePlace: (body) => request('POST', '/places/resolve', { body }),
  candidates: (q) => request('GET', '/places/candidates', { query: { q } }),
  events: () => request('GET', '/events'),

  presign: (files) => request('POST', '/uploads/presign', { body: { files } }),

  // CSV 는 envelope 없이 파일로 온다 → Blob
  async exportStories(query) {
    const res = await raw('GET', '/admin/stories/export', { query });
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      throw new ApiError(json?.error?.code ?? 'UNKNOWN', json?.error?.message ?? '내보내지 못했어요', res.status);
    }
    const name = /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') ?? '')?.[1] ?? 'stories.csv';
    return { blob: await res.blob(), name };
  },
};
