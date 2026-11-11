// 기록 목록(필터·검색·기간·정렬·페이지) + 기록마다 고치기·숨기기·휴지통. 휴지통 화면도 이 파일(status=trash).
import { api } from '../api.js';
import { clear, h } from '../dom.js';
import { SOURCE_LABEL, dateTime, number } from '../format.js';
import { openStoryEditor } from '../story-editor.js';
import { busy, confirmDialog, emptyState, pager, toast, toastError } from '../ui.js';

const PAGE_SIZE = 20;
const STATUS = { active: '공개+숨김', public: '공개만', hidden: '숨김만', all: '전부(휴지통 포함)' };
const SORT = { created_desc: '최근 등록순', created_asc: '오래된 등록순', memory_asc: '기억 날짜 오래된순', memory_desc: '기억 날짜 최근순' };
const FILTER_KEYS = ['q', 'status', 'source', 'from', 'to', 'sort', 'placeId', 'eventId', 'contributorId'];

export async function render(el, params, ctx) {
  const view = ctx.trash ? 'trash' : 'stories';
  const filters = Object.fromEntries(FILTER_KEYS.map((k) => [k, params[k] ?? '']));
  if (ctx.trash) filters.status = 'trash';
  const page = Math.max(1, Number(params.page) || 1);
  const go = (next) => ctx.navigate(view, { ...filters, ...(ctx.trash ? { status: '' } : {}), ...next });

  const query = { ...filters, page, size: PAGE_SIZE };
  const [list, { items: events }, people, place] = await Promise.all([
    api.stories(query),
    api.events().catch(() => ({ items: [] })),
    filters.contributorId ? api.contributors({}).then((d) => d.items).catch(() => []) : [],
    filters.placeId ? api.place(filters.placeId).catch(() => null) : null,
  ]);

  // --- 필터 줄 ---
  const qInput = h('input', { class: 'field', type: 'search', placeholder: '글·그때 이름·장소 이름', value: filters.q });
  const select = (key, options, all) =>
    h(
      'select',
      { class: 'field', onchange: (e) => go({ [key]: e.target.value }) },
      all ? h('option', { value: '' }, all) : null,
      Object.entries(options).map(([v, label]) => h('option', { value: v, selected: filters[key] === v }, label)),
    );
  const fromInput = h('input', { class: 'field', type: 'date', value: filters.from, onchange: (e) => go({ from: e.target.value }) });
  const toInput = h('input', { class: 'field', type: 'date', value: filters.to, onchange: (e) => go({ to: e.target.value }) });

  const filterBar = h(
    'form',
    { class: 'filters', onsubmit: (e) => (e.preventDefault(), go({ q: qInput.value.trim() })) },
    h('label', { class: 'field-label wide' }, '찾기 (Enter)', qInput),
    ctx.trash ? null : h('label', { class: 'field-label' }, '상태', select('status', STATUS, '공개+숨김 (기본)')),
    h('label', { class: 'field-label' }, '경로', select('source', SOURCE_LABEL, '모든 경로')),
    h('label', { class: 'field-label' }, '축제', select('eventId', Object.fromEntries(events.map((e) => [e.eventId, e.name])), '모든 축제·장소')),
    h('label', { class: 'field-label' }, '등록일 부터', fromInput),
    h('label', { class: 'field-label' }, '등록일 까지', toInput),
    h('label', { class: 'field-label' }, '정렬', select('sort', SORT)),
  );

  // --- 걸린 조건 칩 ---
  const chips = [];
  if (filters.placeId) chips.push(chip(`장소: ${place?.name ?? '…'}`, () => go({ placeId: '' })));
  if (filters.contributorId) {
    const p = people.find((x) => x.contributorId === filters.contributorId);
    chips.push(chip(`기록자: ${p?.nickname ?? '…'}`, () => go({ contributorId: '' })));
  }
  if (filters.q) chips.push(chip(`찾기: ${filters.q}`, () => go({ q: '' })));
  const anyFilter = FILTER_KEYS.some((k) => k !== 'sort' && k !== 'status' && filters[k]) || (!ctx.trash && filters.status);

  // --- 머리 ---
  const csvButton = h('button', { class: 'btn', type: 'button' }, 'CSV 내려받기');
  csvButton.addEventListener('click', () =>
    busy(csvButton, async () => {
      try {
        const { blob, name } = await api.exportStories(filters);
        const a = h('a', { href: URL.createObjectURL(blob), download: name });
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      } catch (e) {
        toastError(e);
      }
    }),
  );
  const newButton = ctx.trash
    ? null
    : h('button', { class: 'btn btn-ink', type: 'button', onclick: () => openStoryEditor({ onSaved: ctx.refresh, presetPlace: place }) }, '＋ 새 기록');

  const title = ctx.trash ? '휴지통' : '기록';
  clear(
    el,
    h(
      'div',
      { class: 'view-head' },
      h('div', {}, h('p', { class: 'label' }, ctx.trash ? 'TRASH' : 'STORIES'), h('h2', {}, `${title} · ${number(list.totalCount)}개`)),
      h('div', { class: 'actions' }, newButton, csvButton),
    ),
    ctx.trash ? h('p', { class: 'hint' }, '휴지통의 기록은 앱·관람객 웹에 보이지 않고 집계에서도 빠져요. 복구하면 원래대로 돌아가요.') : null,
    filterBar,
    chips.length || anyFilter
      ? h('div', { class: 'chips' }, chips, anyFilter ? h('button', { class: 'btn btn-small', type: 'button', onclick: () => ctx.navigate(view) }, '조건 모두 지우기') : null)
      : null,
    list.items.length === 0
      ? emptyState(ctx.trash ? '휴지통이 비어 있어요' : '조건에 맞는 기록이 없어요')
      : h('div', { class: 'story-list' }, list.items.map((s) => storyCard(s, { ...ctx, go }))),
    pager(list, (p) => go({ page: p })),
  );
}

function chip(text, onRemove) {
  return h('span', { class: 'chip' }, text, h('button', { type: 'button', 'aria-label': '조건 지우기', onclick: onRemove }, '×'));
}

function storyCard(s, ctx) {
  const trashed = Boolean(s.deletedAt);
  const anchor = s.place
    ? h('button', { class: 'btn-link story-anchor', type: 'button', onclick: () => ctx.go({ placeId: s.place.placeId, page: '' }) }, s.place.name)
    : h('span', { class: 'story-anchor' }, s.event?.name ?? '—');
  const thumb = s.photos[0]
    ? h('a', { href: s.photos[0].imageUrl, target: '_blank', rel: 'noopener' }, h('img', { class: 'story-thumb', src: s.photos[0].imageUrl, alt: '', loading: 'lazy' }))
    : h('div', { class: 'story-thumb empty' }, '사진 없음');

  const run = (button, fn, done) =>
    busy(button, async () => {
      try {
        await fn();
        if (done) toast(done);
        ctx.refresh();
      } catch (e) {
        toastError(e);
      }
    });
  const action = (label, fn, { cls = 'btn btn-small', done, confirm } = {}) => {
    const b = h('button', { class: cls, type: 'button' }, label);
    b.addEventListener('click', async () => {
      if (confirm && !(await confirmDialog(confirm))) return;
      run(b, fn, done);
    });
    return b;
  };

  const side = trashed
    ? [
        action('복구', () => api.restoreStory(s.storyId), { cls: 'btn btn-small btn-ink', done: '복구했어요' }),
        action('영구 삭제', () => api.purgeStory(s.storyId), {
          cls: 'btn btn-small btn-danger',
          done: '영구 삭제했어요',
          confirm: { title: '영구 삭제할까요?', message: '되돌릴 수 없어요. 글과 사진 목록이 DB 에서 사라져요.', confirmLabel: '영구 삭제', danger: true },
        }),
      ]
    : [
        h('button', { class: 'btn btn-small btn-ink', type: 'button', onclick: () => openStoryEditor({ story: s, onSaved: ctx.refresh }) }, '고치기'),
        action(s.hidden ? '다시 보이기' : '숨기기', () => api.setHidden(s.storyId, !s.hidden), { done: s.hidden ? '앱에 다시 보여요' : '앱에서 숨겼어요' }),
        action('휴지통', () => api.trashStory(s.storyId), {
          cls: 'btn btn-small btn-danger',
          done: '휴지통으로 옮겼어요',
          confirm: { title: '휴지통으로 옮길까요?', message: '앱·관람객 웹에서 사라지고, 휴지통에서 복구할 수 있어요.', confirmLabel: '휴지통으로' },
        }),
      ];

  return h(
    'article',
    { class: ['story', s.event && !s.place ? 'is-event' : '', s.hidden ? 'is-hidden' : '', trashed ? 'is-trash' : ''].join(' ') },
    thumb,
    h(
      'div',
      {},
      h('div', { class: 'story-meta' }, anchor, h('span', { class: 'story-date' }, s.memoryDate.pattern), s.placeNameThen ? h('span', { class: 'muted' }, `그때 이름: ${s.placeNameThen}`) : null),
      h(
        'div',
        { class: 'story-meta' },
        h('button', { class: 'btn-link', type: 'button', onclick: () => ctx.go({ contributorId: s.contributor.contributorId, page: '' }) }, s.contributor.nickname),
        h('span', { class: 'badge source' }, SOURCE_LABEL[s.source] ?? s.source),
        s.hidden ? h('span', { class: 'badge hidden' }, '숨김') : null,
        trashed ? h('span', { class: 'badge trash' }, `휴지통 ${dateTime(s.deletedAt)}`) : null,
        h('span', { class: 'mono muted' }, `등록 ${dateTime(s.createdAt)}`),
        h('span', { class: 'mono muted' }, `사진 ${s.photos.length}`),
      ),
      s.content ? h('p', { class: 'story-content' }, s.content) : h('p', { class: 'muted' }, '(글 없음)'),
    ),
    h('div', { class: 'story-side' }, side),
  );
}
