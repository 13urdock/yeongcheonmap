// 장소 추가·고치기 모달.
// - 추가: 영천의 장소(네이버)에서 고르면 이름·주소·좌표가 채워진다. 같은 자리 장소가 이미 있으면 그 장소로 이어진다(resolve).
//         좌표를 직접 넣어 만들 수도 있다(POST /admin/places).
// - 고치기: 이름·용도·소개·주소·개업연도·좌표 (PATCH /admin/places/:id)
import { api } from './api.js';
import { clear, h } from './dom.js';
import { busy, openModal, toast, toastError } from './ui.js';

export function openPlaceEditor({ place = null, onSaved } = {}) {
  const editing = Boolean(place);
  const f = {
    name: input({ value: place?.name, maxlength: 150, required: true }),
    usageType: input({ value: place?.usageType, maxlength: 100, placeholder: '예: 카페, 시장' }),
    address: input({ value: place?.address, maxlength: 255 }),
    sinceYear: input({ value: place?.sinceYear, type: 'number', min: 1800, max: 2100, placeholder: '예: 1978' }),
    latitude: input({ value: place?.latitude, type: 'number', step: 'any', required: true }),
    longitude: input({ value: place?.longitude, type: 'number', step: 'any', required: true }),
  };
  const intro = h('textarea', { class: 'field', rows: 3 });
  intro.value = place?.intro ?? '';

  // 영천의 장소 검색 (추가할 때만)
  let picked = null;
  const search = h('input', { class: 'field', type: 'search', placeholder: '영천의 실제 장소 찾기 (네이버)' });
  const results = h('div', { class: 'results' });
  const searchButton = h('button', { class: 'btn', type: 'button' }, '찾기');
  const runSearch = () =>
    busy(searchButton, async () => {
      const q = search.value.trim();
      if (!q) return;
      try {
        const { items } = await api.candidates(q);
        clear(
          results,
          items.length
            ? items.map((c) =>
                h(
                  'button',
                  { class: 'result candidate', type: 'button', onclick: () => pick(c) },
                  h('span', {}, c.name),
                  h('small', {}, [c.category, c.address, c.placeId ? '이미 등록된 장소' : null].filter(Boolean).join(' · ')),
                ),
              )
            : h('p', { class: 'hint' }, '찾는 곳이 없어요'),
        );
      } catch (e) {
        toastError(e);
      }
    });
  searchButton.addEventListener('click', runSearch);
  search.addEventListener('keydown', (e) => e.key === 'Enter' && (e.preventDefault(), runSearch()));

  function pick(c) {
    picked = c;
    f.name.value = c.name;
    f.address.value = c.address ?? '';
    f.latitude.value = c.latitude;
    f.longitude.value = c.longitude;
    if (c.category && !f.usageType.value) f.usageType.value = c.category.split('>').pop().trim();
    clear(results, h('p', { class: 'hint' }, c.placeId ? '이미 등록된 장소예요. 보관하면 그 장소로 이어져요' : '아래 내용을 확인하고 보관하세요'));
  }

  const error = h('p', { class: 'warning', hidden: true });
  const submit = h('button', { class: 'btn btn-ink', type: 'button' }, editing ? '고친 장소 보관하기' : '장소 보관하기');
  const cancel = h('button', { class: 'btn', type: 'button' }, '닫기');

  const text = (el) => el.value.trim();
  const num = (el) => (el.value === '' ? null : Number(el.value));

  async function save() {
    error.hidden = true;
    if (!text(f.name)) return fail('장소 이름을 적어 주세요');
    if (num(f.latitude) == null || num(f.longitude) == null) return fail('좌표(위도·경도)가 필요해요. 영천의 장소에서 고르면 채워져요');
    try {
      if (editing) {
        await api.updatePlace(place.placeId, {
          name: text(f.name),
          usageType: text(f.usageType) || null,
          intro: intro.value.trim() || null,
          address: text(f.address) || null,
          sinceYear: num(f.sinceYear),
          latitude: num(f.latitude),
          longitude: num(f.longitude),
        });
      } else {
        // 같은 자리 장소 중복을 막기 위해 먼저 resolve(찾거나 만들기) → 나머지 정보는 PATCH
        const { placeId, created } = await api.resolvePlace({
          name: text(f.name),
          latitude: num(f.latitude),
          longitude: num(f.longitude),
          address: text(f.address) || undefined,
        });
        const extra = {
          ...(text(f.usageType) ? { usageType: text(f.usageType) } : {}),
          ...(intro.value.trim() ? { intro: intro.value.trim() } : {}),
          ...(num(f.sinceYear) != null ? { sinceYear: num(f.sinceYear) } : {}),
        };
        if (Object.keys(extra).length) await api.updatePlace(placeId, extra);
        if (!created) toast('같은 자리에 이미 있던 장소로 이어졌어요');
      }
      if (editing || picked?.placeId == null) toast(editing ? '장소를 고쳤어요' : '장소를 보관했어요');
      close();
      onSaved?.();
    } catch (e) {
      fail(e.message);
    }
  }

  function fail(message) {
    error.textContent = message;
    error.hidden = false;
  }

  submit.addEventListener('click', () => busy(submit, save));
  const close = openModal(
    h(
      'div',
      {},
      h('p', { class: 'label' }, editing ? 'EDIT PLACE' : 'NEW PLACE'),
      h('h2', {}, editing ? '장소 고치기' : '장소 추가'),
      editing ? null : h('div', { class: 'modal-section' }, h('div', { class: 'actions' }, h('div', { style: 'flex:1' }, search), searchButton), results),
      h(
        'div',
        { class: 'modal-section form-grid' },
        label('지금 이름', f.name, 'full'),
        label('용도', f.usageType),
        label('개업 연도', f.sinceYear),
        label('주소', f.address, 'full'),
        label('위도', f.latitude),
        label('경도', f.longitude),
        label('소개', intro, 'full'),
      ),
      error,
      h('div', { class: 'modal-foot' }, cancel, submit),
    ),
  );
  cancel.addEventListener('click', close);
}

function input({ value, ...attrs }) {
  const el = h('input', { class: 'field', ...attrs });
  el.value = value ?? '';
  return el;
}

function label(text, el, cls) {
  return h('label', { class: `field-label ${cls ?? ''}` }, text, el);
}
