// ============================================================================
// toolkit/reviews.js — امتیازدهی هفتگی (۱۰۰ امتیازی) + مرور ماهانه
// هر دوره با کلید ISO ذخیره می‌شود (هفته/ماه) → ذخیره مکرر رکورد تکراری
// نمی‌سازد و مقادیر قبلی همان دوره پیش‌فرض فرم می‌شوند.
// ============================================================================

import { fmt, esc, isoWeekKey, monthKey } from '../../core/utils.js';
import { getState } from '../../core/store.js';
import { dispatch } from '../../core/actions.js';
import { onClick, onInput } from '../../core/dom.js';
import { toast } from '../../components/toast.js';
import * as S from '../../core/selectors.js';
import {
  WEEKLY_CRITERIA, WEEKLY_TEXT_FIELDS, WEEKLY_HINT, MONTHLY_FIELDS, MONTHLY_HINT,
} from '../../content/reviews.js';

export function render() {
  const s = getState();
  const week = s.weekly[isoWeekKey()] || { scores: {}, dominantEmotion: '', strengths: '', improvements: '' };
  const month = s.monthly[monthKey()] || {};

  // ---------- فرم هفتگی ----------
  const scoreLines = WEEKLY_CRITERIA.map(
    (c) => `
    <div class="scoreline">
      <label>${c.label} · حداکثر ${fmt(c.max)}</label>
      <input type="number" min="0" max="${c.max}" value="${esc(week.scores[c.key] ?? '')}"
        data-weekscore="${c.key}" style="width:80px;padding:7px;border:1px solid var(--line);border-radius:8px">
    </div>`,
  ).join('');

  const textFields = WEEKLY_TEXT_FIELDS.map(
    (f) => `<div class="field">
      <label>${f.label}</label>
      ${f.key === 'dominantEmotion'
        ? `<input id="week_${f.key}" value="${esc(week[f.key] || '')}">`
        : `<textarea id="week_${f.key}">${esc(week[f.key] || '')}</textarea>`}
    </div>`,
  ).join('');

  // ---------- فرم ماهانه ----------
  const monthFields = MONTHLY_FIELDS.map((f) => {
    const val = esc(month[f.key] ?? '');
    const input = f.type === 'number'
      ? `<input id="month_${f.key}" type="number" min="${f.min}" max="${f.max}" value="${val}">`
      : `<textarea id="month_${f.key}">${val}</textarea>`;
    return `<div class="field"><label>${f.label}</label>${input}</div>`;
  }).join('');

  return `
  <div class="two-col">
    <section class="card">
      <h3 style="font-size:14px;margin:0">امتیازدهی هفتگی کتاب (۱۰۰ امتیاز)</h3>
      <p class="small-text muted">${WEEKLY_HINT}</p>
      ${scoreLines}
      <div class="total-score">
        <span>امتیاز کل</span>
        <strong id="weeklyTotal">${fmt(S.weeklyTotalOf(week.scores))} / ۱۰۰</strong>
      </div>
      ${textFields}
      <button class="btn primary" data-action="save-week">ذخیره ارزیابی هفتگی</button>
    </section>
    <section class="card">
      <h3 style="font-size:14px;margin:0">مرور ماهانه</h3>
      <p class="small-text muted">${MONTHLY_HINT}</p>
      ${monthFields}
      <button class="btn secondary" data-action="save-month">ذخیره مرور ماهانه</button>
    </section>
  </div>`;
}

// محدودسازی زنده امتیاز هفتگی به سقف معیار + به‌روزرسانی جمع
onInput('[data-weekscore]', (el) => {
  const key = el.dataset.weekscore;
  const capped = dispatch('SET_WEEKLY_SCORE', { key, value: el.value });
  if (capped !== null && capped !== undefined) el.value = capped;
  const s = getState();
  const week = s.weekly[isoWeekKey()] || { scores: {} };
  const totalEl = document.getElementById('weeklyTotal');
  if (totalEl) totalEl.textContent = `${fmt(S.weeklyTotalOf(week.scores))} / ۱۰۰`;
});

onClick('[data-action="save-week"]', () => {
  const val = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : '';
  };
  const scores = {};
  for (const c of WEEKLY_CRITERIA) {
    const el = document.querySelector(`[data-weekscore="${c.key}"]`);
    scores[c.key] = el ? Number(el.value) || 0 : 0;
  }
  dispatch('SAVE_WEEK', {
    scores,
    dominantEmotion: val('week_dominantEmotion'),
    strengths: val('week_strengths'),
    improvements: val('week_improvements'),
  });
  toast('ارزیابی هفتگی ذخیره شد.');
});

onClick('[data-action="save-month"]', () => {
  const fields = {};
  for (const f of MONTHLY_FIELDS) {
    const el = document.getElementById(`month_${f.key}`);
    fields[f.key] = el ? el.value : '';
  }
  dispatch('SAVE_MONTH', fields);
  toast('مرور ماهانه ذخیره شد.');
});
