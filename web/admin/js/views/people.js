// 사람별 조회: 기록자마다 기록·사진 수, 마지막 기록. 누르면 그 사람의 기록 목록.
// 지금은 수집가·운영진뿐. 이벤트 때 관람객 닉네임이 생기면 같은 표에 그대로 늘어난다.
import { api } from '../api.js';
import { clear, h } from '../dom.js';
import { dateTime, number } from '../format.js';
import { emptyState } from '../ui.js';

export async function render(el, params, { navigate }) {
  const range = { from: params.from, to: params.to };
  const { items } = await api.contributors(range);
  const fromInput = h('input', { class: 'field', type: 'date', value: range.from ?? '' });
  const toInput = h('input', { class: 'field', type: 'date', value: range.to ?? '' });

  const total = items.reduce((s, p) => s + p.storyCount, 0);
  clear(
    el,
    h(
      'div',
      { class: 'view-head' },
      h('div', {}, h('p', { class: 'label' }, 'PEOPLE'), h('h2', {}, `사람별 기록 · ${number(items.length)}명`)),
      h(
        'form',
        { class: 'actions', onsubmit: (e) => (e.preventDefault(), navigate('people', { from: fromInput.value, to: toInput.value })) },
        fromInput,
        '~',
        toInput,
        h('button', { class: 'btn btn-small', type: 'submit' }, '기간 보기'),
        range.from || range.to ? h('button', { class: 'btn btn-small', type: 'button', onclick: () => navigate('people') }, '전체') : null,
      ),
    ),
    h('p', { class: 'hint' }, `등록일 기준 · 휴지통 제외 · 합계 ${number(total)}개`),
    items.length === 0
      ? emptyState('기록자가 없어요')
      : h(
          'table',
          { class: 'table' },
          h(
            'thead',
            {},
            h('tr', {}, h('th', {}, '닉네임'), h('th', {}, '계정'), h('th', {}, '이벤트 연락처'), h('th', { class: 'num' }, '기록'), h('th', { class: 'num' }, '사진'), h('th', {}, '마지막 기록')),
          ),
          h(
            'tbody',
            {},
            items.map((p) =>
              h(
                'tr',
                { class: 'clickable', onclick: () => navigate('stories', { contributorId: p.contributorId, ...range }) },
                h('td', {}, h('strong', {}, p.nickname)),
                h('td', { class: 'muted' }, p.accountName ?? '—'),
                h('td', { class: 'muted' }, p.hasContact ? '있음' : '—'),
                h('td', { class: 'num' }, number(p.storyCount)),
                h('td', { class: 'num' }, number(p.photoCount)),
                h('td', { class: 'mono muted' }, dateTime(p.lastStoryAt)),
              ),
            ),
          ),
        ),
  );
}
