// 공항 숫자판 YYYY.MM.DD — 칸을 누르면 고를 수 있는 글자 목록이 열린다(모바일 기본 선택창).
import { UNKNOWN, allowedSymbolsAt, hasPossibleDate, normalizeDigits, seoulToday, toPattern } from './memory-date.js';

export class DateBoard {
  constructor({ rootEl, warningEl }) {
    this.rootEl = rootEl;
    this.warningEl = warningEl;
    this.today = seoulToday();
    this.digits = Array(8).fill(UNKNOWN);
    this.selects = [];
    this.build();
    this.render();
  }

  build() {
    const groups = [
      { label: 'YEAR', from: 0, to: 4 },
      { label: 'MONTH', from: 4, to: 6 },
      { label: 'DAY', from: 6, to: 8 },
    ];
    groups.forEach((g, gi) => {
      const group = document.createElement('div');
      group.className = 'flap-group';
      const row = document.createElement('div');
      row.className = 'flap-row';
      for (let i = g.from; i < g.to; i++) {
        const sel = document.createElement('select');
        sel.className = 'flap';
        sel.setAttribute('aria-label', `${g.label} ${i - g.from + 1}번째 자리`);
        sel.addEventListener('change', () => {
          this.digits[i] = sel.value;
          this.digits = normalizeDigits(this.digits, this.today.year);
          this.render();
        });
        this.selects[i] = sel;
        row.appendChild(sel);
      }
      const label = document.createElement('span');
      label.className = 'flap-label';
      label.textContent = g.label;
      group.append(row, label);
      this.rootEl.appendChild(group);
      if (gi < 2) {
        const dot = document.createElement('span');
        dot.className = 'flap-dot';
        dot.textContent = '.';
        this.rootEl.appendChild(dot);
      }
    });
  }

  render() {
    this.selects.forEach((sel, i) => {
      const allowed = allowedSymbolsAt(this.digits, i, this.today.year);
      sel.replaceChildren(...allowed.map((s) => new Option(s, s)));
      sel.value = this.digits[i];
      sel.classList.toggle('unknown', this.digits[i] === UNKNOWN);
    });
    this.warningEl.hidden = this.isValid();
  }

  isValid() {
    return hasPossibleDate(this.digits, this.today);
  }

  get pattern() {
    return toPattern(this.digits);
  }

  reset() {
    this.digits = Array(8).fill(UNKNOWN);
    this.render();
  }

  /** 'YYYY.MM.DD'(X 포함) 로 채우기 — 운영진 웹의 기록 고치기에서 쓴다 */
  setPattern(pattern) {
    const chars = String(pattern ?? '').replace(/\./g, '').toUpperCase().split('');
    this.digits = chars.length === 8 ? normalizeDigits(chars, this.today.year) : Array(8).fill(UNKNOWN);
    this.render();
  }
}
