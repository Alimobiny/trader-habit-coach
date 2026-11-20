// ============================================================================
// toolkit/emotions.js — شش محرک رفتاری + فرم تحلیل احساسات
// ============================================================================

import { fmt, esc } from '../../core/utils.js';
import { getState } from '../../core/store.js';
import { dispatch } from '../../core/actions.js';
import { onClick } from '../../core/dom.js';
import { toast } from '../../components/toast.js';
import { EMOTIONS, EMOTION_FORM_LABELS, EMOTION_AFFECT_OPTIONS, EMOTION_FORM_NOTICE } from '../../content/emotions.js';

export function render() {
  const s = getState();
  const logCount = s.emotionLogs.length;

  const cards = EMOTIONS.map(
    (e) => `<div class="emotion-card">
      <h3>${e.name}</h3>
      <p><b>نشانه‌ها:</b> ${e.signs}</p>
      <p><b>راهکار:</b> ${e.solutions}</p>
      <p><b>تمرین کتاب:</b> ${e.practice}</p>
    </div>`,
  ).join('');

  // فرم: اندیس‌های متنی 0,1,3,4,5 و انتخابی 2
  const fields = EMOTION_FORM_LABELS.map((label, i) => {
    if (i === 2) {
      const opts = EMOTION_AFFECT_OPTIONS.map((o, j) => `<option ${j === 0 ? 'selected' : ''}>${o}</option>`).join('');
      return `<div class="field"><label>${label}</label><select id="emotionAffect">${opts}</select></div>`;
    }
    return `<div class="field"><label>${label}</label><textarea id="emotionField${i}"></textarea></div>`;
  }).join('');

  return `
  <div class="section-head" style="margin-top:0">
    <div><h2>شش محرک رفتاری کتاب</h2>
    <p>نشانه‌ها را بشناس؛ راهکار را پیش از قرار گرفتن در موقعیت مرور کن.</p></div>
    ${logCount ? `<span class="tag">${fmt(logCount)} یادداشت ثبت‌شده</span>` : ''}
  </div>
  <div class="emotion-grid">${cards}</div>
  <div class="card" style="margin-top:16px">
    <h3 style="font-size:14px;margin:0">فرم تحلیل احساسات</h3>
    <p class="small-text muted">${EMOTION_FORM_NOTICE}</p>
    ${fields}
    <button class="btn secondary" data-action="save-emotion">ذخیره در یادداشت رفتاری</button>
  </div>`;
}

onClick('[data-action="save-emotion"]', () => {
  const val = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };
  dispatch('SAVE_EMOTION_LOG', {
    before: val('emotionField0'),
    after: val('emotionField1'),
    affect: val('emotionAffect'),
    how: val('emotionField3'),
    alternative: val('emotionField4'),
    correction: val('emotionField5'),
  });
  // پاک‌سازی فرم برای ثبت بعدی
  [0, 1, 3, 4, 5].forEach((i) => {
    const el = document.getElementById(`emotionField${i}`);
    if (el) el.value = '';
  });
  const sel = document.getElementById('emotionAffect');
  if (sel) sel.selectedIndex = 0;
  toast('یادداشت رفتاری ذخیره شد.');
});
