// ============================================================================
// dashboard.js — نمای داشبورد (هیرو، سنجه‌ها، روند، فعالیت، تمرین بعدی، ساختار، آخرین ثبت)
// ============================================================================

import { fmt, esc, localDate, dayNumber } from '../core/utils.js';
import { getState } from '../core/store.js';
import * as S from '../core/selectors.js';
import { STAGES } from '../content/meta.js';
import { progressRing } from '../components/ring.js';
import { lineChart, chartLegend } from '../charts.js';

const SERIES = [
  { name: 'صبر', color: 'var(--chart-patience)', field: 'patience' },
  { name: 'اراده', color: 'var(--chart-willpower)', field: 'willpower' },
  { name: 'پایبندی', color: 'var(--chart-adherence)', field: 'adherence' },
];

export function render(root) {
  const s = getState();
  const done = S.daysDone(s);
  const next = S.unlockedDay(s);
  const pct = S.completionPct(s);
  const finished = done >= 40;
  const active = finished ? null : S.dayObj(next);
  const last = S.lastActivity(s);

  // ---------- هیرو ----------
  let html = `
  <section class="hero">
    <div>
      <div class="eyebrow">TRADER HABIT COACH · برنامه صبر و اراده</div>
      <h2>${finished ? 'دوره اصلی تمام شد؛ حالا عادت را تثبیت کن.' : s.started ? 'مسیر انضباط را ادامه بده.' : 'انضباط با یک تصمیم ساخته نمی‌شود؛ با تکرار ساخته می‌شود.'}</h2>
      <p>یک تمرین کوچک، یک مشاهده صادقانه و یک تکرار آگاهانه. اینجا قرار نیست معامله‌هایت را ثبت کنی؛ فقط کیفیت عادت‌ها و اجرای فرآیند را دنبال می‌کنی.</p>
      <div class="hero-stats">
        <div class="hero-stat"><strong>${fmt(done)} / ۴۰</strong><span>روز تکمیل‌شده</span></div>
        <div class="hero-stat"><strong>${fmt(S.streak(s))}</strong><span>روز متوالی تکمیل</span></div>
        <div class="hero-stat"><strong>${S.averageScore(s, 'patience') ?? '—'}</strong><span>میانگین صبر از ۱۰</span></div>
      </div>
      <div style="margin-top:18px">
        <a class="btn" style="background:#f6ffff;color:#15314a" href="${finished ? '#/toolkit/maintenance' : '#/today'}">
          ${finished ? 'ورود به برنامه تثبیت ۹۰روزه' : s.started ? 'ادامه تمرین امروز' : 'شروع برنامه ۴۰ روزه'}
        </a>
      </div>
    </div>
    ${progressRing(pct)}
  </section>`;

  // ---------- سنجه‌ها ----------
  const selfAssessed = Object.keys(s.days).filter((k) => s.days[k].reflection && s.days[k].reflection.updatedAt).length;
  html += `
  <div class="grid metrics">
    <div class="card metric"><div class="metric-icon" aria-hidden="true">◷</div><div><small>روز فعلی</small><strong>${fmt(Math.min(next, 40))} <span class="unit">از ۴۰</span></strong></div></div>
    <div class="card metric"><div class="metric-icon" aria-hidden="true">◎</div><div><small>میانگین اراده</small><strong>${S.averageScore(s, 'willpower') ?? '—'} <span class="unit">از ۱۰</span></strong></div></div>
    <div class="card metric"><div class="metric-icon" aria-hidden="true">✓</div><div><small>پایبندی رفتاری ثبت‌شده</small><strong>${S.averageScore(s, 'adherence') ?? '—'} <span class="unit">از ۱۰</span></strong></div></div>
    <div class="card metric"><div class="metric-icon" aria-hidden="true">✦</div><div><small>خودارزیابی ثبت‌شده</small><strong>${fmt(selfAssessed)}</strong></div></div>
  </div>`;

  // ---------- روند و فعالیت (جدید در نسخه ۲) ----------
  html += trendSection(s);

  // ---------- تمرین بعدی ----------
  html += `
  <div class="section-head">
    <div><h2>تمرین بعدی</h2><p>بر اساس ترتیب برنامه کتاب</p></div>
    <a class="btn ghost small" href="#/path">مشاهده مسیر</a>
  </div>
  <div class="today-card">
    <div>
      <span class="tag">${finished ? 'مرحله تثبیت' : `فصل ${fmt(active.chapter)} · روز ${fmt(active.day)}`}</span>
      <h3>${finished ? 'برنامه ۹۰ روزه تثبیت عادت' : esc(active.title)}</h3>
      <p>${finished ? 'پس از ۴۰ روز، در سه ماه چک‌لیست‌ها را تثبیت، خطاهای احساسی را کاهش و فرآیند را بهینه کن.' : esc(active.desc)}</p>
      <div class="bar" style="max-width:400px"><span style="width:${pct}%"></span></div>
    </div>
    <a class="btn primary" href="${finished ? '#/toolkit/maintenance' : '#/today'}">${finished ? 'شروع تثبیت ←' : 'ورود به تمرین ←'}</a>
  </div>`;

  // ---------- ساختار برنامه ----------
  html += `<div class="section-head"><div><h2>ساختار برنامه</h2><p>۳ مرحله پیوسته از شناخت تا تثبیت عادت</p></div></div>
  <div class="stages">${STAGES.map((st) => stageCard(st, done)).join('')}</div>`;

  // ---------- آخرین ثبت ----------
  html += `<div class="section-head"><div><h2>آخرین ثبت</h2><p>فقط وضعیت تمرین و خودارزیابی؛ بدون اطلاعات معامله</p></div></div>
  <div class="card">${
    last
      ? `<div class="scoreline"><label>روز ${fmt(Number(last[0]))} · ${esc(S.dayObj(Number(last[0])).title)}</label><strong>${last[1].reflection.updatedAt}</strong></div>
         <p class="small-text muted">${esc(last[1].reflection.lesson || 'برای این روز یادداشتی ثبت نشده است.')}</p>`
      : '<div class="empty">هنوز تمرینی ثبت نشده است. با روز اول شروع کن.</div>'
  }</div>`;

  root.innerHTML = html;
}

function stageCard(st, done) {
  const pctStage = Math.max(0, Math.min(100, ((done - (st.from - 1)) / st.count) * 100));
  return `<div class="stage">
    <div class="num">${st.num}</div>
    <strong>${st.title}</strong>
    <small>${st.desc}</small>
    <div class="bar"><span style="width:${pctStage}%"></span></div>
  </div>`;
}

/** نمودار کوچک روند + نوار فعالیت ۲۸ روزه + احساس‌های اخیر */
function trendSection(s) {
  const series = S.metricSeries(s);
  const hasData = series.some((d) => d.patience !== null || d.willpower !== null || d.adherence !== null);
  if (!hasData) return '';

  const chart = lineChart({
    compact: true,
    height: 96,
    series: SERIES.map((sr) => ({ ...sr, points: series.map((d) => d[sr.field]) })),
  });

  // نوار فعالیت: ۲۸ روز گذشته شامل امروز
  const doneDates = S.completedDateSet(s);
  const todayNum = dayNumber(localDate());
  const dots = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = localDate(d);
    const on = doneDates.has(ds);
    dots.push(`<span class="activity-dot ${on ? 'on' : ''} ${i === 0 ? 'today' : ''}" title="${ds}${on ? ' · تمرین تکمیل شد' : ''}"></span>`);
  }

  const emotions = S.recentEmotions(s, 8);
  const chips = emotions.length
    ? `<div class="emotion-chips">${emotions
        .map((e) => `<span class="emotion-chip">روز ${fmt(e.day)} · ${esc(e.emotion)}</span>`)
        .join('')}</div>`
    : '';

  return `
  <div class="two-col" style="margin-top:16px">
    <div class="card chart-box">
      <h3 style="font-size:14px;margin:0">روند امتیازها</h3>
      ${chart}
      ${chartLegend(SERIES)}
    </div>
    <div class="card">
      <h3 style="font-size:14px;margin:0">فعالیت ۲۸ روز اخیر</h3>
      <div class="activity-strip">${dots.join('')}</div>
      <div class="activity-legend"><span>■ سبز: روزِ تکمیل‌شده</span><span>■ خاکستری: بدون ثبت</span></div>
      ${chips ? `<h4 class="mini-title">احساس‌های ثبت‌شده اخیر</h4>${chips}` : ''}
    </div>
  </div>`;
}
