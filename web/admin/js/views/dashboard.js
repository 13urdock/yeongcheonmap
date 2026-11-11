// 한눈에: 기간별 총계(기록·사진·장소·축제·사람·숨김·휴지통), 경로별 수, 사람별 순위, 기록 많은 장소
import { api } from '../api.js';
import { clear, h } from '../dom.js';
import { SOURCE_LABEL, number, seoulDate } from '../format.js';

const PERIODS = {
  all: { label: '전체', range: () => ({}) },
  today: { label: '오늘', range: () => ({ from: seoulDate(), to: seoulDate() }) },
  week: { label: '최근 7일', range: () => ({ from: seoulDate(-6), to: seoulDate() }) },
  month: { label: '최근 30일', range: () => ({ from: seoulDate(-29), to: seoulDate() }) },
};

export async function render(el, params, { navigate }) {
  const periodKey = PERIODS[params.period] ? params.period : params.from || params.to ? 'custom' : 'all';
  const range = periodKey === 'custom' ? { from: params.from, to: params.to } : PERIODS[periodKey].range();

  const [stats, { items: people }, { items: topPlaces }] = await Promise.all([
    api.stats(range),
    api.contributors(range),
    api.places({ sort: 'count', size: 8 }),
  ]);

  const periodButtons = Object.entries(PERIODS).map(([key, p]) =>
    h('button', { class: key === periodKey ? 'btn btn-small btn-ink' : 'btn btn-small', type: 'button', onclick: () => navigate('dashboard', { period: key }) }, p.label),
  );
  const fromInput = h('input', { class: 'field', type: 'date', value: range.from ?? '' });
  const toInput = h('input', { class: 'field', type: 'date', value: range.to ?? '' });
  const custom = h(
    'form',
    { class: 'actions', onsubmit: (e) => (e.preventDefault(), navigate('dashboard', { from: fromInput.value, to: toInput.value })) },
    fromInput,
    '~',
    toInput,
    h('button', { class: 'btn btn-small', type: 'submit' }, '기간 보기'),
  );

  const storiesOf = (extra) => navigate('stories', { ...range, ...extra });
  const tile = (label, value, cls = '', onclick) =>
    h('div', { class: `tile ${cls}`, style: onclick ? 'cursor:pointer' : null, onclick }, h('span', { class: 'label' }, label), h('span', { class: 'num' }, number(value)));

  const maxSource = Math.max(1, ...Object.values(stats.bySource));
  const sourceBars = Object.entries(stats.bySource).map(([source, count]) =>
    h('div', { class: 'bar-row' }, h('span', {}, SOURCE_LABEL[source] ?? source), h('div', { class: 'bar' }, h('span', { style: `width:${(count / maxSource) * 100}%` })), h('span', { class: 'mono', style: 'text-align:right' }, number(count))),
  );

  clear(
    el,
    h('div', { class: 'view-head' }, h('div', {}, h('p', { class: 'label' }, 'OVERVIEW'), h('h2', {}, '한눈에 보기')), h('div', { class: 'actions' }, periodButtons, custom)),
    h('p', { class: 'hint' }, range.from || range.to ? `등록일 ${range.from ?? '처음'} ~ ${range.to ?? '오늘'} 기준 · 휴지통 제외(숨김 포함)` : '전체 기간 · 휴지통 제외(숨김 포함)'),
    h(
      'div',
      { class: 'tiles' },
      tile('기록', stats.storyCount, '', () => storiesOf({})),
      tile('사진', stats.photoCount),
      tile('기록이 있는 장소', stats.placeCount, 'place', () => navigate('places')),
      tile('기록이 있는 축제', stats.eventCount, 'festival'),
      tile('기록한 사람', stats.contributorCount, '', () => navigate('people', range)),
      tile('숨긴 기록', stats.hiddenCount, 'warn', () => storiesOf({ status: 'hidden' })),
      tile('휴지통', stats.trashCount, 'warn', () => navigate('trash', range)),
    ),
    h(
      'div',
      { class: 'grid-2' },
      h('section', { class: 'panel' }, h('h3', {}, '들어온 경로'), sourceBars),
      h(
        'section',
        { class: 'panel' },
        h('h3', {}, '사람별 기록 수'),
        people.length === 0
          ? h('p', { class: 'muted' }, '아직 없어요')
          : h(
              'table',
              { class: 'table' },
              h('thead', {}, h('tr', {}, h('th', {}, '기록자'), h('th', { class: 'num' }, '기록'), h('th', { class: 'num' }, '사진'))),
              h(
                'tbody',
                {},
                people.slice(0, 8).map((p) =>
                  h('tr', { class: 'clickable', onclick: () => storiesOf({ contributorId: p.contributorId }) }, h('td', {}, p.nickname), h('td', { class: 'num' }, number(p.storyCount)), h('td', { class: 'num' }, number(p.photoCount))),
                ),
              ),
            ),
      ),
      h(
        'section',
        { class: 'panel' },
        h('h3', {}, '기록이 많은 장소'),
        h('p', { class: 'hint' }, '전체 기간 기준'),
        topPlaces.filter((p) => p.storyCount > 0).length === 0
          ? h('p', { class: 'muted' }, '아직 없어요')
          : h(
              'table',
              { class: 'table' },
              h(
                'tbody',
                {},
                topPlaces
                  .filter((p) => p.storyCount > 0)
                  .map((p) => h('tr', { class: 'clickable', onclick: () => navigate('stories', { placeId: p.placeId }) }, h('td', {}, p.name), h('td', { class: 'num' }, number(p.storyCount)))),
              ),
            ),
      ),
    ),
  );
}
