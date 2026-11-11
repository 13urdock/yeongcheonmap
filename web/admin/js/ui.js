// 알림(토스트)·모달·확인창. 브라우저 기본 confirm/alert 은 쓰지 않는다.
import { clear, h } from './dom.js';

let toastTimer;
export function toast(message, { error = false } = {}) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.toggle('error', error);
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), error ? 4500 : 2500);
}

export function toastError(e) {
  toast(e?.message ?? '잠시 후 다시 시도해 주세요', { error: true });
}

/** 모달 열기. content 는 Node. 닫기 함수를 돌려준다 */
export function openModal(content, { small = false, onClose } = {}) {
  const root = document.getElementById('modal-root');
  const modal = h('div', { class: small ? 'modal small' : 'modal', role: 'dialog', 'aria-modal': 'true' }, content);
  const backdrop = h('div', { class: 'modal-backdrop' }, modal);
  const close = () => {
    backdrop.remove();
    document.removeEventListener('keydown', onKey);
    onClose?.();
  };
  const onKey = (e) => e.key === 'Escape' && close();
  backdrop.addEventListener('mousedown', (e) => e.target === backdrop && close());
  document.addEventListener('keydown', onKey);
  root.append(backdrop);
  return close;
}

/** 확인창 → Promise<boolean> */
export function confirmDialog({ title, message, confirmLabel = '확인', danger = false }) {
  return new Promise((resolve) => {
    let answered = false;
    const done = (v) => {
      answered = true;
      close();
      resolve(v);
    };
    const body = h(
      'div',
      {},
      h('h3', {}, title),
      message ? h('p', { class: 'muted' }, message) : null,
      h(
        'div',
        { class: 'modal-foot' },
        h('button', { class: 'btn', type: 'button', onclick: () => done(false) }, '그만두기'),
        h('button', { class: danger ? 'btn btn-danger' : 'btn btn-ink', type: 'button', onclick: () => done(true) }, confirmLabel),
      ),
    );
    const close = openModal(body, { small: true, onClose: () => !answered && resolve(false) });
  });
}

/** 버튼을 누르는 동안 막고, 끝나면 풀기 */
export async function busy(button, fn) {
  button.disabled = true;
  try {
    return await fn();
  } finally {
    button.disabled = false;
  }
}

export function emptyState(text) {
  return h('div', { class: 'empty-state' }, text);
}

export function pager({ page, size, totalCount }, onPage) {
  const last = Math.max(1, Math.ceil(totalCount / size));
  if (last <= 1) return null;
  return h(
    'div',
    { class: 'pager' },
    h('button', { class: 'btn btn-small', type: 'button', disabled: page <= 1, onclick: () => onPage(page - 1) }, '◀ 이전'),
    h('span', {}, `${page} / ${last}`),
    h('button', { class: 'btn btn-small', type: 'button', disabled: page >= last, onclick: () => onPage(page + 1) }, '다음 ▶'),
  );
}

export { clear };
