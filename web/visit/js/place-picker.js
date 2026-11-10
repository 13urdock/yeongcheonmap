// "어디의 기억인가요?" — 지도(장소·축제 핀) + 검색(축제 · 기록이 있는 장소 · 영천의 장소).
// 고른 결과 형태:
//   { kind: 'event', eventId, name, address }
//   { kind: 'place', placeId, name, address }
//   { kind: 'candidate', name, address, latitude, longitude }  ← 보관할 때 /visitor/places/resolve 로 확정

import { api } from './api.js';

const YEONGCHEON_CENTER = { lat: 35.9733, lng: 128.9386 };

export class PlacePicker {
  constructor({ mapEl, searchInput, resultsEl, onSelect }) {
    this.mapEl = mapEl;
    this.searchInput = searchInput;
    this.resultsEl = resultsEl;
    this.onSelect = onSelect;
    this.map = null;
    this.selectedMarker = null;
    this.events = [];
    this.places = [];
  }

  async init(naverMapClientId) {
    [this.events, this.places] = await Promise.all([
      api.events().then((d) => d.items).catch(() => []),
      api.places().then((d) => d.items).catch(() => []),
    ]);
    this.bindSearch();
    this.renderDefaultList();
    if (naverMapClientId) {
      await this.loadMap(naverMapClientId).catch(() => this.hideMap());
    } else {
      this.hideMap();
    }
  }

  // ---- 지도 ----
  loadMap(clientId) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`;
      script.onload = () => {
        if (!window.naver?.maps) return reject(new Error('map'));
        this.createMap();
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  createMap() {
    const { maps } = window.naver;
    this.map = new maps.Map(this.mapEl, {
      center: new maps.LatLng(YEONGCHEON_CENTER.lat, YEONGCHEON_CENTER.lng),
      zoom: 13,
      scaleControl: false,
      mapDataControl: false,
    });
    for (const p of this.places) {
      this.addPin(p.latitude, p.longitude, 'pin pin-place', p.name, () => this.select(placeItem(p)));
    }
    for (const e of this.events) {
      if (e.latitude == null) continue;
      this.addPin(e.latitude, e.longitude, 'pin pin-event', e.name, () => this.select(eventItem(e)));
    }
  }

  addPin(lat, lng, className, title, onClick) {
    const { maps } = window.naver;
    const marker = new maps.Marker({
      position: new maps.LatLng(lat, lng),
      map: this.map,
      title,
      icon: { content: `<div class="${className}" aria-label="${escapeHtml(title)}"></div>`, anchor: new maps.Point(9, 9) },
    });
    maps.Event.addListener(marker, 'click', onClick);
    return marker;
  }

  focus(lat, lng) {
    if (!this.map || lat == null) return;
    const { maps } = window.naver;
    const pos = new maps.LatLng(lat, lng);
    this.map.morph(pos, 16);
    if (this.selectedMarker) this.selectedMarker.setMap(null);
    this.selectedMarker = new maps.Marker({
      position: pos,
      map: this.map,
      icon: { content: '<div class="pin pin-selected"></div>', anchor: new maps.Point(12, 12) },
      zIndex: 1000,
    });
  }

  hideMap() {
    this.mapEl.hidden = true;
  }

  // ---- 검색 ----
  bindSearch() {
    let timer = null;
    this.searchInput.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => this.search(this.searchInput.value.trim()), 350);
    });
  }

  renderDefaultList() {
    this.renderGroups([{ title: '축제', items: this.events.map(eventItem) }]);
  }

  async search(q) {
    if (!q) return this.renderDefaultList();
    const lower = q.toLowerCase();
    const events = this.events.filter((e) => `${e.name} ${e.address ?? ''}`.toLowerCase().includes(lower)).map(eventItem);
    this.renderGroups([{ title: '축제', items: events }, { title: '찾는 중…', items: [] }]);

    const [mine, outside] = await Promise.all([
      api.searchPlaces(q).then((d) => d.items).catch(() => []),
      api.candidates(q).then((d) => d.items).catch(() => null),
    ]);
    if (this.searchInput.value.trim() !== q) return; // 그새 검색어가 바뀜
    const mineIds = new Set(mine.map((p) => p.placeId));
    const outsideItems = (outside ?? [])
      .filter((c) => !c.placeId || !mineIds.has(c.placeId))
      .map((c) => (c.placeId ? { kind: 'place', placeId: c.placeId, name: c.name, address: c.address, latitude: c.latitude, longitude: c.longitude } : candidateItem(c)));
    this.renderGroups([
      { title: '축제', items: events },
      { title: '기억이 쌓인 장소', items: mine.map(placeItem) },
      { title: '영천의 장소', items: outsideItems, note: outside === null ? '지금은 영천 장소 검색을 쓸 수 없어요' : null },
    ]);
  }

  renderGroups(groups) {
    this.resultsEl.replaceChildren();
    for (const g of groups) {
      if (g.items.length === 0 && !g.note && g.title !== '찾는 중…') continue;
      const h = document.createElement('p');
      h.className = 'label';
      h.textContent = g.title;
      this.resultsEl.appendChild(h);
      if (g.note) {
        const n = document.createElement('p');
        n.className = 'hint';
        n.textContent = g.note;
        this.resultsEl.appendChild(n);
      }
      for (const item of g.items) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `result result-${item.kind}`;
        b.innerHTML = `<span class="result-name">${escapeHtml(item.name)}</span><span class="result-addr">${escapeHtml(item.address ?? '')}</span>`;
        b.addEventListener('click', () => this.select(item));
        this.resultsEl.appendChild(b);
      }
    }
  }

  select(item) {
    this.focus(item.latitude, item.longitude);
    this.searchInput.value = '';
    this.resultsEl.replaceChildren(); // 고른 뒤엔 목록을 접는다 (다시 찾으면 다시 열림)
    this.onSelect(item);
  }
}

function eventItem(e) {
  return { kind: 'event', eventId: e.eventId, name: e.name, address: e.address, latitude: e.latitude, longitude: e.longitude };
}
function placeItem(p) {
  return { kind: 'place', placeId: p.placeId, name: p.name, address: p.address, latitude: p.latitude, longitude: p.longitude };
}
function candidateItem(c) {
  return { kind: 'candidate', name: c.name, address: c.address, latitude: c.latitude, longitude: c.longitude };
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}
