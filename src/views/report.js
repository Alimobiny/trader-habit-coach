// ============================================================================
// report.js — گزارش چاپی پیشرفت (قابلیت جدید نسخه ۲)
// خلاصه وضعیت + آخرین مرورها + درس‌های اخیر؛ با دکمه چاپ / ذخیره PDF.
// استایل چاپ در pages.css (@media print) پوسته اپ را حذف می‌کند.
// ============================================================================

import { fmt, esc, localDate } from '../core/utils.js';
import { getState } from '../core/store.js';
import * as S from '../core/selectors.js';
import { progressRing } from '../components/ring.js';
import { STAGES, APP } from '../content/meta.js';
import { WEEKLY_CRITERIA, MONTHLY_FIELDS } from '../content/reviews.js';

export function render(root) {
  const s = getState();
  const done = S.daysDone(s);

  const avg = (f) => S.averageScore(s, f);

  // آخرین رکوردهای هفتگی/ماهانه بر اساس کلید ISO (نزولی)
  const lastWeekly = Object.entries(s.weekly).sort((a, b) => b[0].localeCompare(a[0]))[0] || null;
  const lastMonthly = Object.entries(s.monthly).sort((a, b) => b[0].localeCompare(a[0]))[0] || null;

  // درس‌های ۵ روز تکمیل‌شده اخیر که درس ثبت شده دارند
  const lessons = Object.keys(s.completed)
    .filter((k) => s.completed[k])
    .map(Number)
    .sort((a, b) => b - a)
    .map((n) => ({ n, lesson: s.days[n] && s.days[n].reflection && s.days[n].reflection.lesson }))
    .filter((x) => x.lesson && x.lesson.trim())
    .slice(0, 5);

  const maintDone = S.maintenanceDone(s);

  root.innerHTML = `
  <div class="report-head">
    <div>
      <h2 style="margin:0">گزارش پیشرفت — ${APP.faName}</h2>
      <p class="small-text muted" style="margin:4px 0 0">تاریخ گزارش: ${localDate()} · بر اساس کتاب کار «صبر و اراده در معامله‌گری»</p>
    </div>
    <div class="report-actions">
      <button class="btn primary" data-action="print">چاپ / ذخیره PDF</button>
      <a class="btn ghost" href="#/progress">نمودارهای کامل</a>
    </div>
  </div>

  <div class="two-col" style="margin-top:14px">
    <div class="card report-block">
      <div style="display:flex;gap:22px;align-items:center;flex-wrap:wrap">
        ${progressRing(S.completionPct(s))}
        <div style="flex:1;min-width:200px">
          <div class="scoreline"><label>روزهای تکمیل‌شده</label><strong>${fmt(done)} / ۴۰</strong></div>
          <div class="scoreline"><label>روزهای متوالی (استریک فعلی)</label><strong>${fmt(S.streak(s))}</strong></div>
          <div class="scoreline"><label>روزهای تثبیت ۹۰روزه</label><strong>${fmt(maintDone)} / ۹۰</strong></div>
          <div class="scoreline"><label>شروع برنامه</label><strong>${s.startedAt || '—'}</strong></div>
        </div>
      </div>
    </div>
    <div class="card report-block">
      <h3 style="font-size:14px;margin:0 0 6px">میانگین خودارزیابی‌ها</h3>
      <div class="scoreline"><label>صبر</label><strong>${avg('patience') ?? '—'} / ۱۰</strong></div>
      <div class="scoreline"><label>اراده</label><strong>${avg('willpower') ?? '—'} / ۱۰</strong></div>
      <div class="scoreline"><label>پایبندی به استراتژی</label><strong>${avg('adherence') ?? '—'} / ۱۰</strong></div>
    </div>
  </div>

  <div class="card report-block" style="margin-top:14px">
    <h3 style="font-size:14px;margin:0 0 8px">پیشرفت مراحل</h3>
    <div class="stages" style="margin-top:4px">${STAGES.map((st) => {
      const pct = Math.max(0, Math.min(100, ((done - (st.from - 1)) / st.count) * 100));
      return `<div class="stage">
        <div class="num">${st.num}</div>
        <strong>${st.title}</strong>
        <small>${st.desc}</small>
        <div class="bar"><span style="width:${pct}%"></span></div>
      </div>`;
    }).join('')}</div>
  </div>

  <div class="two-col" style="margin-top:14px">
    <div class="card report-block">
      <h3 style="font-size:14px;margin:0 0 6px">آخرین ارزیابی هفتگی ${lastWeekly ? `(${esc(lastWeekly[0])})` : ''}</h3>
      ${lastWeekly
        ? `${WEEKLY_CRITERIA.map(
            (c) => `<div class="scoreline"><label>${c.label}</label><strong>${fmt(lastWeekly[1].scores[c.key] || 0)} / ${fmt(c.max)}</strong></div>`,
          ).join('')}
           <div class="total-score" style="margin-top:10px"><span>امتیاز کل</span><strong>${fmt(lastWeekly[1].total || 0)} / ۱۰۰</strong></div>
           ${lastWeekly[1].dominantEmotion ? `<p class="small-text muted" style="margin:10px 0 0"><b>احساس غالب:</b> ${esc(lastWeekly[1].dominantEmotion)}</p>` : ''}`
        : '<div class="empty">هنوز ارزیابی هفتگی ثبت نشده است.</div>'}
    </div>
    <div class="card report-block">
      <h3 style="font-size:14px;margin:0 0 6px">آخرین مرور ماهانه ${lastMonthly ? `(${esc(lastMonthly[0])})` : ''}</h3>
      ${lastMonthly
        ? MONTHLY_FIELDS.map(
            (f) => `<div class="scoreline"><label>${f.label}</label><strong>${esc(lastMonthly[1][f.key] ?? '—')}</strong></div>`,
          ).join('')
        : '<div class="empty">هنوز مرور ماهانه ثبت نشده است.</div>'}
    </div>
  </div>

  <div class="card report-block" style="margin-top:14px">
    <h3 style="font-size:14px;margin:0 0 8px">درس‌های ثبت‌شده روزهای اخیر</h3>
    ${lessons.length
      ? lessons.map(
          (l) => `<div class="scoreline" style="align-items:flex-start">
            <label>روز ${fmt(l.n)} · ${esc(S.dayObj(l.n).title)}</label>
            <strong style="max-width:60%;font-weight:400;font-size:12px">${esc(l.lesson)}</strong></div>`,
        ).join('')
      : '<div class="empty">هنوز درسی ثبت نشده است.</div>'}
  </div>

  <p class="small-text muted" style="margin-top:14px">
    این گزارش فقط عادت‌ها و خودارزیابی‌ها را نشان می‌دهد؛ هیچ داده معاملاتی (قیمت، حجم، سود/زیان) در این برنامه ذخیره نمی‌شود.
  </p>`;
}
