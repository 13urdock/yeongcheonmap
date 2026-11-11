// 기록 쓰기·고치기 모달. 앱의 기억 남기기와 같은 순서: 어디 → 사진 → 언제 → 그때 이름 → 글.
// - 새 기록: POST /admin/stories (기록자 = 로그인한 운영 계정, 경로 = 관리 웹)
// - 고치기: PATCH /admin/stories/:id (장소·축제는 바꿀 수 없음 — 앱과 같은 규칙)
import { AnchorPicker } from './anchor-picker.js';
import { api } from './api.js';
import { h } from './dom.js';
import { PhotoEditor } from './photo-editor.js';
import { busy, openModal, toast, toastError } from './ui.js';
import { DateBoard } from '../../visit/js/date-board.js';

export function openStoryEditor({ story = null, presetPlace = null, onSaved } = {}) {
  const editing = Boolean(story);
  const photos = new PhotoEditor(story?.photos.map((p) => p.imageUrl) ?? []);

  // 어디
  let anchorSection;
  let picker = null;
  let anchorIsPlace = editing ? Boolean(story.place) : true;
  const nameThenSection = h('label', { class: 'field-label' }, '그때 이 자리의 이름 (선택)');
  if (editing) {
    const name = story.place?.name ?? story.event?.name ?? '—';
    anchorSection = h('div', { class: 'target' }, h('div', {}, h('strong', {}, name), h('div', { class: 'hint' }, story.place ? '장소 · 고칠 수 없음' : '축제 · 고칠 수 없음')));
  } else {
    picker = new AnchorPicker({
      onChange: (c) => {
        anchorIsPlace = c?.kind !== 'event';
        nameThenSection.hidden = !anchorIsPlace;
        refreshSubmit();
      },
    });
    if (presetPlace) picker.select({ kind: 'place', placeId: presetPlace.placeId, name: presetPlace.name, address: presetPlace.address });
    anchorSection = picker.el;
  }

  // 언제
  const dateRoot = h('div', { class: 'date-board' });
  const dateWarning = h('p', { class: 'warning', hidden: true }, '이 조합으로는 가능한 날짜가 없어요. (예: 2월 30일, 미래의 날짜)');
  const board = new DateBoard({ rootEl: dateRoot, warningEl: dateWarning });
  if (editing) board.setPattern(story.memoryDate.pattern);
  dateRoot.addEventListener('change', () => refreshSubmit());

  const nameThen = h('input', { class: 'field', maxlength: 150, placeholder: '예: 중앙분식', value: story?.placeNameThen ?? '' });
  nameThenSection.append(nameThen);
  nameThenSection.hidden = !anchorIsPlace;
  const content = h('textarea', { class: 'field', rows: 6, maxlength: 5000, placeholder: '그때의 추억' });
  content.value = story?.content ?? '';
  content.addEventListener('input', () => refreshSubmit());
  photos.list.addEventListener('click', () => setTimeout(refreshSubmit));
  photos.input.addEventListener('change', () => setTimeout(refreshSubmit, 50));

  const error = h('p', { class: 'warning', hidden: true });
  const submit = h('button', { class: 'btn btn-ink', type: 'button' }, editing ? '고친 기억 보관하기' : '이 기억을 보관하기');
  const cancel = h('button', { class: 'btn', type: 'button' }, '닫기');

  function refreshSubmit() {
    const hasAnchor = editing || Boolean(picker?.selected);
    submit.disabled = !hasAnchor || !board.isValid();
  }

  async function save() {
    error.hidden = true;
    if (photos.isBusy) return showError('사진을 준비하는 중이에요. 잠시 후 다시 눌러 주세요');
    if (!content.value.trim() && photos.items.length === 0) return showError('글 또는 사진 중 하나는 필요해요');
    try {
      const photoUrls = await photos.upload();
      const body = {
        memoryDate: board.pattern,
        content: content.value.trim(),
        photoUrls,
        ...(anchorIsPlace ? { placeNameThen: nameThen.value.trim() } : {}),
      };
      if (editing) {
        await api.updateStory(story.storyId, body);
      } else {
        const anchor = await picker.resolve();
        await api.createStory({ ...anchor, ...body, content: body.content || undefined, placeNameThen: body.placeNameThen || undefined });
      }
      toast(editing ? '고친 기억을 보관했어요' : '기억을 보관했어요');
      close();
      onSaved?.();
    } catch (e) {
      showError(e.message);
      toastError(e);
    }
  }

  function showError(message) {
    error.textContent = message;
    error.hidden = false;
  }

  submit.addEventListener('click', () => busy(submit, save).then(refreshSubmit));
  const close = openModal(
    h(
      'div',
      {},
      h('p', { class: 'label' }, editing ? 'EDIT MEMORY' : 'NEW MEMORY'),
      h('h2', {}, editing ? '기억 고치기' : '새 기억 남기기'),
      editing ? h('p', { class: 'hint' }, `기록자 ${story.contributor.nickname} · 고쳐도 기록자는 그대로예요`) : null,
      h('div', { class: 'modal-section' }, h('p', { class: 'label' }, '01 · 어디의 기억인가요?'), anchorSection),
      h('div', { class: 'modal-section' }, h('p', { class: 'label' }, '02 · 사진'), photos.el),
      h('div', { class: 'modal-section' }, h('p', { class: 'label' }, '03 · 언제의 기억인가요?'), h('p', { class: 'hint' }, '모르는 자리는 X 로 두세요'), dateRoot, dateWarning),
      h('div', { class: 'modal-section' }, nameThenSection, h('label', { class: 'field-label', style: 'margin-top:12px' }, '그때의 추억', content)),
      error,
      h('div', { class: 'modal-foot' }, cancel, submit),
    ),
  );
  cancel.addEventListener('click', close);
  refreshSubmit();
}
