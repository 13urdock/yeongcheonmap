// "어디의 기억인가요?" — 이미 있는 장소 · 축제 · 영천의 장소(네이버 검색)에서 고르기.
// 고른 결과:
//   { kind: 'place', placeId, name, address }
//   { kind: 'event', eventId, name, address }
//   { kind: 'candidate', name, address, latitude, longitude } ← 저장할 때 resolve() 로 장소 확정
import { api } from './api.js';
import { clear, h } from './dom.js';

export class AnchorPicker {
  constructor({ onChange }) {
    this.onChange = onChange;
    this.selected = null;
    this.events = [];
    this.seq = 0;
    this.input = h('input', { class: 'field', type: 'search', placeholder: '장소·축제 이름 (예: 영천시장, 별빛)', autocomplete: 'off' });
    this.results = h('div', { class: 'results' });
    this.target = h('div');
    this.el = h('div', {}, this.input, this.results, this.target);
    let timer;
    this.input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => this.search(this.input.value.trim()), 300);
    });
    api.events().then((d) => (this.events = d.items)).catch(() => {});
  }

  select(choice) {
    this.selected = choice;
    clear(this.results);
    this.input.hidden = Boolean(choice);
    clear(
      this.target,
      choice
        ? h(
            'div',
            { class: 'target' },
            h('div', {}, h('strong', {}, choice.name), h('div', { class: 'hint' }, [kindLabel(choice), choice.address].filter(Boolean).join(' · '))),
            h('button', { class: 'btn btn-small', type: 'button', onclick: () => this.select(null) }, '다시 고르기'),
          )
        : null,
    );
    if (!choice) this.input.focus();
    this.onChange?.(choice);
  }

  async search(q) {
    const seq = ++this.seq;
    if (!q) return clear(this.results);
    const events = this.events.filter((e) => e.name.includes(q)).map((e) => ({ kind: 'event', eventId: e.eventId, name: e.name, address: e.address }));
    const [places, candidates] = await Promise.all([
      api.places({ q, size: 8, sort: 'count' }).then((d) => d.items).catch(() => []),
      api.candidates(q).then((d) => d.items).catch(() => []),
    ]);
    if (seq !== this.seq) return; // 더 최근 검색이 있으면 버린다
    const placeChoices = places.map((p) => ({ kind: 'place', placeId: p.placeId, name: p.name, address: p.address, storyCount: p.storyCount }));
    const known = new Set(places.map((p) => p.placeId));
    const candidateChoices = candidates
      .filter((c) => !c.placeId || !known.has(c.placeId))
      .map((c) => (c.placeId ? { kind: 'place', placeId: c.placeId, name: c.name, address: c.address } : { kind: 'candidate', name: c.name, address: c.address, latitude: c.latitude, longitude: c.longitude }));

    const button = (c) =>
      h(
        'button',
        { class: `result ${c.kind}`, type: 'button', onclick: () => this.select(c) },
        h('span', {}, c.name),
        h('small', {}, [kindLabel(c), c.address, c.storyCount != null ? `기록 ${c.storyCount}` : null].filter(Boolean).join(' · ')),
      );
    const all = [...events, ...placeChoices, ...candidateChoices];
    clear(this.results, all.length ? all.map(button) : h('p', { class: 'hint' }, '찾는 곳이 없어요. 다른 이름으로 찾아보세요'));
  }

  /** 저장 직전: 후보(네이버)를 우리 장소로 확정해 { placeId } 또는 { eventId } 를 돌려준다 */
  async resolve() {
    const c = this.selected;
    if (!c) return null;
    if (c.kind === 'event') return { eventId: c.eventId };
    if (c.kind === 'place') return { placeId: c.placeId };
    const { placeId } = await api.resolvePlace({ name: c.name, latitude: c.latitude, longitude: c.longitude, address: c.address ?? undefined });
    return { placeId };
  }
}

function kindLabel(c) {
  return { place: '장소', event: '축제', candidate: '영천의 장소 (새로 등록)' }[c.kind];
}
