// ============================================================================
// progress.js — روند پیشرفت: نمودار خطی سه سنجه + میله‌ای پایبندی + مرور روزها
// (نمودارهای SVG واقعی به‌جای ستون‌های div در v1؛ گرید مرور واکنش‌گرا شد)
// ============================================================================

import { fmt, esc } from '../core/utils.js';
import { getState } from '../core/store.js';
import * as S from '../core/selectors.js';
import { lineChart, barChart, chartLegend } from '../charts.js';

const SERIES = [
  { name: 'صبر', color: 'var(--chart-patience)', field: 'patience' },
  { name: 'اراده', color: 'var(--chart-willpower)', field: 'willpower' },
  { name: 'پایبندی', color: 'var(--chart-adherence)', field: 'adherence' },
];

export function render(root) {
  const s = getState();
  const done = S.daysDone(s);
  const series = S.metricSeries(s);

  const lines = lineChart({
    series: SERIES.map((sr) => ({ ...sr, points: series.map((d) => d[sr.field]) })),
    yMax: 10,
    height: 240,
  });
  const bars = barChart({ values: series, yMax: 10, height: 150 });

  const avgRows = SERIES.map((sr) => {
    const avg = S.averageScore(s, sr.field);
    return `<div class="scoreline"><label>${sr.name}</label><strong>${avg ?? '—'} / ۱۰</strong></div>`;
  }).join('');

  const dayButtons = series
    .map(
      (d) => `<a class="btn ${d.completed ? 'secondary' : 'ghost'} small" href="#/day/${d.day}">
        روز ${fmt(d.day)} ${d.completed ? '✓' : ''}<br><span class="d-title">${esc(S.dayObj(d.day).title)}</span>
      </a>`,
    )
    .join('');

  root.innerHTML = `
  <div class="grid metrics">
    <div class="card metric"><div class="metric-icon" aria-hidden="true">✓</div><div><small>روزهای تکمیل‌شده</small><strong>${fmt(done)} / ۴۰</strong></div></div>
    <div class="card metric"><div class="metric-icon" aria-hidden="true">◷</div><div><small>نرخ تکمیل</small><strong>${fmt(S.completionPct(s))}٪</strong></div></div>
    <div class="card metric"><div class="metric-icon" aria-hidden="true">◎</div><div><small>میانگین صبر</small><strong>${S.averageScore(s, 'patience') ?? '—'}</strong></div></div>
    <div class="card metric"><div class="metric-icon" aria-hidden="true">✦</div><div><small>میانگین اراده</small><strong>${S.averageScore(s, 'willpower') ?? '—'}</strong></div></div>
  </div>

  <div class="two-col">
    <div class="card chart-box">
      <h3 style="font-size:14px;margin:0">روند سه سنجه در ۴۰ روز</h3>
      <p class="small-text muted">هر نقطه امتیاز ثبت‌شده همان روز است؛ شکست خط یعنی آن روز امتیازی ثبت نشده.</p>
      ${lines}
      ${chartLegend(SERIES)}
    </div>
    <div class="card chart-box">
      <h3 style="font-size:14px;margin:0">روند پایبندی روزانه</h3>
      <p class="small-text muted">ارتفاع هر ستون بر اساس امتیاز پایبندی از ۱۰ است؛ ستون خاکستری یعنی هنوز امتیازی ثبت نشده.</p>
      ${bars}
    </div>
  </div>

  <div class="two-col">
    <div class="card">
      <h3 style="font-size:14px;margin:0">میانگین امتیازها</h3>
      ${avgRows}
      <p class="small-text muted">این امتیازها خودارزیابی هستند و معیار عینی سودآوری یا کیفیت آماری استراتژی نیستند.</p>
    </div>
    <div class="card">
      <h3 style="font-size:14px;margin:0">آخرین احساس‌های ثبت‌شده</h3>
      ${emotionList(s)}
    </div>
  </div>

  <div class="section-head"><div><h2>مرور روزها</h2><p>برای دیدن ثبت‌های قبلی روی هر روز کلیک کن.</p></div></div>
  <div class="card"><div class="review-grid">${dayButtons}</div></div>`;
}

function emotionList(s) {
  const list = S.recentEmotions(s, 6);
  if (!list.length) return '<div class="empty">هنوز احساسی ثبت نشده است.</div>';
  return `<div class="emotion-chips">${list
    .map((e) => `<span class="emotion-chip">روز ${fmt(e.day)} · ${esc(e.emotion)}</span>`)
    .join('')}</div>`;
}
