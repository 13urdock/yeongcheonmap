// 장소별 조회: 장소마다 기록 수(휴지통 제외). 기록 보기 · 고치기 · 지우기(기록 없는 장소만) · 추가
import { api } from '../api.js';
import { clear, h } from '../dom.js';
import { dateTime, number } from '../format.js';
import { openPlaceEditor } from '../place-editor.js';
import { busy, confirmDialog, emptyState, pager, toast, toastError } from '../ui.js';

const PAGE_SIZE = 30;
const SORT = { count: '기록 많은 순', name: '이름순', recent: '최근 등록순' };

export async function render(el, params, { navigate, refresh }) {
  const filters = { q: params.q ?? '', sort: params.sort || 'count' };
  const page = Math.max(1, Number(params.page) || 1);
  const go = (next) => navigate('places', { ...filters, ...next });
  const list = await api.places({ ...filters, page, size: PAGE_SIZE });

  const q = h('input', { class: 'field', type: 'search', placeholder: '이름·주소', value: filters.q });
  const sort = h(
    'select',
    { class: 'field', onchange: (e) => go({ sort: e.target.value }) },
    Object.entries(SORT).map(([v, label]) => h('option', { value: v, selected: filters.sort === v }, label)),
  );

  const remove = (p) => async (e) => {
    const ok = await confirmDialog({ title: `'${p.name}' 을(를) 지울까요?`, message: '기록이 하나라도 달린 장소(휴지통 포함)는 지울 수 없어요.', confirmLabel: '지우기', danger: true });
    if (!ok) return;
    busy(e.target, async () => {
      try {
        await api.deletePlace(p.placeId);
        toast('장소를 지웠어요');
        refresh();
      } catch (err) {
        toastError(err);
      }
    });
  };

  clear(
    el,
    h(
      'div',
      { class: 'view-head' },
      h('div', {}, h('p', { class: 'label' }, 'PLACES'), h('h2', {}, `장소 · ${number(list.totalCount)}곳`)),
      h('div', { class: 'actions' }, h('button', { class: 'btn btn-ink', type: 'button', onclick: () => openPlaceEditor({ onSaved: refresh }) }, '＋ 장소 추가')),
    ),
    h(
      'form',
      { class: 'filters', onsubmit: (e) => (e.preventDefault(), go({ q: q.value.trim() })) },
      h('label', { class: 'field-label wide' }, '찾기 (Enter)', q),
      h('label', { class: 'field-label' }, '정렬', sort),
    ),
    list.items.length === 0
      ? emptyState('장소가 없어요')
      : h(
          'table',
          { class: 'table' },
          h('thead', {}, h('tr', {}, h('th', {}, '지금 이름'), h('th', {}, '용도'), h('th', {}, '주소'), h('th', { class: 'num' }, '기록'), h('th', {}, '등록'), h('th', {}, ''))),
          h(
            'tbody',
            {},
            list.items.map((p) =>
              h(
                'tr',
                {},
                h('td', {}, h('button', { class: 'btn-link', type: 'button', onclick: () => navigate('stories', { placeId: p.placeId }) }, p.name), p.sinceYear ? h('div', { class: 'hint' }, `since ${p.sinceYear}`) : null),
                h('td', { class: 'muted' }, p.usageType ?? '—'),
                h('td', { class: 'muted' }, p.address ?? '—'),
                h('td', { class: 'num' }, number(p.storyCount)),
                h('td', { class: 'mono muted' }, dateTime(p.createdAt).slice(0, 10)),
                h(
                  'td',
                  {},
                  h(
                    'div',
                    { class: 'actions' },
                    h('button', { class: 'btn btn-small', type: 'button', onclick: () => navigate('stories', { placeId: p.placeId }) }, '기록 보기'),
                    h('button', { class: 'btn btn-small', type: 'button', onclick: () => openPlaceEditor({ place: p, onSaved: refresh }) }, '고치기'),
                    h('button', { class: 'btn btn-small btn-danger', type: 'button', disabled: p.storyCount > 0, title: p.storyCount > 0 ? '기록이 있는 장소는 지울 수 없어요' : null, onclick: remove(p) }, '지우기'),
                  ),
                ),
              ),
            ),
          ),
        ),
    pager(list, (n) => go({ page: n })),
  );
}
