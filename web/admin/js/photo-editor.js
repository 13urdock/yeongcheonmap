// 사진 고르기·빼기·순서 바꾸기 (최대 5장). 이미 올라간 사진(주소)과 새 사진(파일)을 섞어 다룬다.
// 저장할 때 새 사진만 올리고, 화면 순서대로 주소 목록을 돌려준다.
import { api } from './api.js';
import { clear, h } from './dom.js';
import { shrinkPhoto } from '../../visit/js/photos.js';

export const MAX_PHOTOS = 5;

export class PhotoEditor {
  constructor(existingUrls = []) {
    this.items = existingUrls.map((url) => ({ url, preview: url })); // { url } | { blob, preview }
    this.busyCount = 0;
    this.notice = ''; // 한도 초과·열 수 없는 사진 안내
    this.input = h('input', { type: 'file', accept: 'image/*', multiple: true, hidden: true });
    this.input.addEventListener('change', () => this.add([...this.input.files]));
    this.list = h('div', { class: 'photos' });
    this.status = h('p', { class: 'hint' });
    this.el = h('div', {}, this.list, this.status);
    this.render();
  }

  get isBusy() {
    return this.busyCount > 0;
  }

  async add(files) {
    this.input.value = '';
    const room = MAX_PHOTOS - this.items.length;
    this.notice = files.length > room ? `사진은 ${MAX_PHOTOS}장까지예요. 앞의 ${room}장만 넣었어요` : '';
    for (const file of files.slice(0, room)) {
      this.busyCount++;
      this.render();
      try {
        const blob = await shrinkPhoto(file);
        this.items.push({ blob, preview: URL.createObjectURL(blob) });
      } catch (e) {
        this.notice = e.message;
      } finally {
        this.busyCount--;
        this.render();
      }
    }
  }

  move(i, delta) {
    const j = i + delta;
    if (j < 0 || j >= this.items.length) return;
    [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
    this.render();
  }

  remove(i) {
    this.notice = '';
    const [removed] = this.items.splice(i, 1);
    if (removed.blob) URL.revokeObjectURL(removed.preview);
    this.render();
  }

  render() {
    const cards = this.items.map((item, i) =>
      h(
        'div',
        { class: 'photo' },
        h('img', { src: item.preview, alt: '' }),
        h('span', { class: 'order' }, i === 0 ? '대표' : String(i + 1)),
        h(
          'div',
          { class: 'tools' },
          h('button', { type: 'button', title: '앞으로', disabled: i === 0, onclick: () => this.move(i, -1) }, '◀'),
          h('button', { type: 'button', title: '빼기', onclick: () => this.remove(i) }, '빼기'),
          h('button', { type: 'button', title: '뒤로', disabled: i === this.items.length - 1, onclick: () => this.move(i, 1) }, '▶'),
        ),
      ),
    );
    const add = this.items.length < MAX_PHOTOS ? h('label', { class: 'photo-add' }, this.input, this.isBusy ? '준비 중…' : '＋ 사진 고르기') : null;
    clear(this.list, cards, add);
    this.status.textContent = this.notice || `${this.items.length} / ${MAX_PHOTOS}장 · 첫 사진이 대표 사진`;
  }

  /** 새 사진을 저장소에 올리고, 화면 순서대로 공개 주소 목록 */
  async upload() {
    const fresh = this.items.filter((it) => it.blob && !it.url);
    if (fresh.length) {
      const { items } = await api.presign(fresh.map((it) => ({ contentType: 'image/jpeg', size: it.blob.size })));
      await Promise.all(
        items.map(async (target, i) => {
          const res = await fetch(target.uploadUrl, { method: target.method, headers: target.headers, body: fresh[i].blob }).catch(() => null);
          if (!res || !res.ok) throw new Error('사진을 올리지 못했어요. 다시 시도해 주세요');
          fresh[i].url = target.publicUrl; // 다시 저장해도 두 번 올리지 않게
        }),
      );
    }
    return this.items.map((it) => it.url);
  }
}
