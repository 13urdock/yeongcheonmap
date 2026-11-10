// 관람객 웹 시작점: QR 코드 확인 → 장소 고르기 · 사진 · 기억 날짜 · 글 → 보관하기.
// 관람객은 올리기만 한다(수정·삭제는 전시 기기의 운영진).
import { api, setVisitorCode } from './api.js';
import { DateBoard } from './date-board.js';
import { MAX_PHOTOS, shrinkPhoto, uploadPhotos } from './photos.js';
import { PlacePicker, escapeHtml } from './place-picker.js';

const $ = (id) => document.getElementById(id);
const CODE_KEY = 'yc-visitor-code';

const state = { target: null, photos: [], submitting: false, writable: false };

function readVisitorCode() {
  const params = new URLSearchParams(location.search);
  const fromUrl = params.get('c');
  if (fromUrl) {
    sessionStorage.setItem(CODE_KEY, fromUrl);
    history.replaceState(null, '', location.pathname); // 주소창에서 코드 숨기기
    return fromUrl;
  }
  return sessionStorage.getItem(CODE_KEY) ?? '';
}

// ---- 장소 ----
function showTarget(item) {
  state.target = item;
  const label = item.kind === 'event' ? '축제' : '장소';
  $('target').innerHTML = `<span class="stamp">${label}</span><strong>${escapeHtml(item.name)}</strong><span class="result-addr">${escapeHtml(item.address ?? '')}</span>`;
  $('target').hidden = false;
  $('name-then-section').hidden = item.kind === 'event'; // 축제엔 '그때 이름' 없음
  updateSubmit();
}

// ---- 사진 ----
async function addPhotos(files) {
  const room = MAX_PHOTOS - state.photos.length;
  const picked = [...files].slice(0, room);
  if (files.length > room) toast(`사진은 ${MAX_PHOTOS}장까지예요`);
  $('photo-busy').hidden = false;
  for (const file of picked) {
    try {
      const blob = await shrinkPhoto(file);
      state.photos.push({ blob, url: URL.createObjectURL(blob) });
    } catch (e) {
      toast(e.message);
    }
  }
  $('photo-busy').hidden = true;
  renderPhotos();
}

function renderPhotos() {
  const list = $('photo-list');
  list.replaceChildren();
  state.photos.forEach((p, i) => {
    const cell = document.createElement('div');
    cell.className = 'photo';
    cell.innerHTML = `<img src="${p.url}" alt="고른 사진 ${i + 1}"><button type="button" class="photo-remove" aria-label="사진 빼기">×</button>`;
    cell.querySelector('button').addEventListener('click', () => {
      if (state.submitting) return;
      URL.revokeObjectURL(p.url);
      state.photos.splice(i, 1);
      renderPhotos();
    });
    list.appendChild(cell);
  });
  $('photo-add').hidden = state.photos.length >= MAX_PHOTOS;
  $('photo-count').textContent = `${state.photos.length} / ${MAX_PHOTOS}`;
  updateSubmit();
}

// ---- 보관하기 ----
function canSubmit() {
  const hasContent = $('content').value.trim().length > 0 || state.photos.length > 0;
  return state.writable && !state.submitting && state.target && hasContent && dateBoard.isValid();
}

function updateSubmit() {
  const btn = $('submit');
  btn.disabled = !canSubmit();
  if (!state.writable) btn.textContent = '전시장 QR 코드로 들어와 주세요';
  else if (state.submitting) return;
  else btn.textContent = '이 기억을 보관하기';
}

async function anchorOf(target) {
  if (target.kind === 'event') return { eventId: target.eventId };
  if (target.kind === 'place') return { placeId: target.placeId };
  const { placeId } = await api.resolvePlace({
    name: target.name,
    latitude: target.latitude,
    longitude: target.longitude,
    ...(target.address ? { address: target.address } : {}),
  });
  state.target = { ...target, kind: 'place', placeId }; // 재시도 때 다시 확정하지 않게
  return { placeId };
}

async function submit() {
  if (!canSubmit()) return;
  state.submitting = true;
  const btn = $('submit');
  btn.disabled = true;
  try {
    btn.textContent = '보관하는 중…';
    const anchor = await anchorOf(state.target);
    if (state.photos.length) btn.textContent = '사진 올리는 중…';
    const pending = state.photos.filter((p) => !p.publicUrl);
    const urls = await uploadPhotos(pending.map((p) => p.blob));
    pending.forEach((p, i) => (p.publicUrl = urls[i])); // 재시도 때 다시 올리지 않게
    btn.textContent = '보관하는 중…';

    const content = $('content').value.trim();
    const nameThen = $('name-then').value.trim();
    await api.createStory({
      ...anchor,
      memoryDate: dateBoard.pattern,
      ...(content ? { content } : {}),
      ...(nameThen && !anchor.eventId ? { placeNameThen: nameThen } : {}),
      ...(state.photos.length ? { photoUrls: state.photos.map((p) => p.publicUrl) } : {}),
    });
    showDone();
  } catch (e) {
    toast(e.message || '보관하지 못했어요. 다시 시도해 주세요');
  } finally {
    state.submitting = false;
    updateSubmit();
  }
}

function showDone() {
  $('done-place').textContent = state.target.name;
  $('form').hidden = true;
  $('done').hidden = false;
  window.scrollTo(0, 0);
}

function resetForm() {
  state.photos.forEach((p) => URL.revokeObjectURL(p.url));
  state.photos = [];
  state.target = null;
  $('target').hidden = true;
  $('content').value = '';
  $('name-then').value = '';
  $('search').value = '';
  $('name-then-section').hidden = false;
  dateBoard.reset();
  picker.renderDefaultList();
  renderPhotos();
  $('done').hidden = true;
  $('form').hidden = false;
  window.scrollTo(0, 0);
}

let toastTimer = null;
function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 3500);
}

// ---- 시작 ----
const dateBoard = new DateBoard({ rootEl: $('date-board'), warningEl: $('date-warning') });
const picker = new PlacePicker({ mapEl: $('map'), searchInput: $('search'), resultsEl: $('results'), onSelect: showTarget });

async function start() {
  const code = readVisitorCode();
  setVisitorCode(code);
  $('date-board').addEventListener('change', updateSubmit);
  $('content').addEventListener('input', updateSubmit);
  $('photo-input').addEventListener('change', (e) => {
    addPhotos(e.target.files);
    e.target.value = '';
  });
  $('submit').addEventListener('click', submit);
  $('again').addEventListener('click', resetForm);

  let config = { naverMapClientId: null, writable: false };
  try {
    config = await api.config();
  } catch {
    toast('서버에 연결하지 못했어요');
  }
  state.writable = config.writable && Boolean(code);
  if (config.writable && !code) $('no-code').hidden = false;
  if (!config.writable) $('closed').hidden = false;
  renderPhotos();
  updateSubmit();
  await picker.init(config.naverMapClientId);
}

start();
