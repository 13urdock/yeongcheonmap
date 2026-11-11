// 운영진 관리 웹 시작점: 로그인 확인 → 해시 주소(#/화면?조건)에 맞는 화면 그리기
import { api, ApiError, setSignedOutHandler } from './api.js';
import { session } from './session.js';
import { toastError } from './ui.js';
import * as dashboard from './views/dashboard.js';
import * as people from './views/people.js';
import * as places from './views/places.js';
import * as stories from './views/stories.js';

const VIEWS = {
  dashboard: (el, params, ctx) => dashboard.render(el, params, ctx),
  stories: (el, params, ctx) => stories.render(el, params, ctx),
  trash: (el, params, ctx) => stories.render(el, { ...params, status: 'trash' }, { ...ctx, trash: true }),
  places: (el, params, ctx) => places.render(el, params, ctx),
  people: (el, params, ctx) => people.render(el, params, ctx),
};

const $ = (id) => document.getElementById(id);
let me = null;

/** 화면 이동: navigate('stories', { placeId }) → #/stories?placeId=… */
export function navigate(view, params = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== '')).toString();
  const next = `#/${view}${qs ? `?${qs}` : ''}`;
  if (location.hash === next) route();
  else location.hash = next;
}

function parseHash() {
  const [path, qs] = location.hash.replace(/^#\/?/, '').split('?');
  const view = VIEWS[path] ? path : 'dashboard';
  return { view, params: Object.fromEntries(new URLSearchParams(qs ?? '')) };
}

async function route() {
  if (!me) return;
  const { view, params } = parseHash();
  document.querySelectorAll('#tabs a').forEach((a) => a.classList.toggle('active', a.dataset.tab === view));
  const el = $('view');
  try {
    await VIEWS[view](el, params, { me, navigate, refresh: route });
  } catch (e) {
    toastError(e);
  }
}

function showLogin(message) {
  me = null;
  $('app-view').hidden = true;
  $('login-view').hidden = false;
  $('login-error').hidden = !message;
  $('login-error').textContent = message ?? '';
}

async function enter() {
  try {
    me = await api.me();
  } catch (e) {
    if (e instanceof ApiError && e.code === 'FORBIDDEN') {
      session.clear();
      return showLogin('운영진 계정이 아니에요. 수집가·운영진 계정으로 들어와 주세요');
    }
    session.clear();
    return showLogin(e instanceof ApiError && e.status === 401 ? null : e.message);
  }
  $('login-view').hidden = true;
  $('app-view').hidden = false;
  $('whoami-name').textContent = me.name;
  $('whoami-name').title = `${me.email} · 올린 기록은 '${me.contributor.nickname}'(으)로 집계돼요`;
  route();
}

$('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const button = e.submitter;
  button.disabled = true;
  try {
    session.save(await api.login($('login-email').value.trim(), $('login-password').value));
    $('login-password').value = '';
    await enter();
  } catch (err) {
    showLogin(err.message);
  } finally {
    button.disabled = false;
  }
});

$('logout').addEventListener('click', () => {
  session.clear();
  showLogin();
});

setSignedOutHandler(() => showLogin('로그인이 만료됐어요. 다시 들어와 주세요'));
window.addEventListener('hashchange', route);

if (session.accessToken) enter();
else showLogin();
