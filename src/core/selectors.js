// ============================================================================
// selectors.js — خواندن‌های مشتق‌شده از state (توابع خالص)
// views هرگز خودشان روی state حساب نمی‌کنند؛ همیشه از اینجا می‌خوانند.
// ============================================================================

import { localDate, dayNumber } from './utils.js';
import { DAY_TITLES } from '../content/chapter3.js';
import { WEEKLY_CRITERIA } from '../content/reviews.js';

export const TOTAL_DAYS = 40;

/** آبجکت روز: شماره، فصل، عنوان، توضیح */
export function dayObj(n) {
  const [title, desc] = DAY_TITLES[n - 1] || ['', ''];
  return { day: n, chapter: n <= 3 ? 1 : n <= 10 ? 2 : 3, title, desc };
}

/** رکورد یک روز؛ اگر نباشد ساختار خالی برمی‌گرداند (بدون نوشتن در state) */
export function dayRecord(s, n) {
  return s.days[n] || { checks: {}, reflection: {}, quiz: {} };
}

export function daysDone(s) {
  return Object.keys(s.completed).filter((k) => s.completed[k]).length;
}

export function unlockedDay(s) {
  return Math.min(TOTAL_DAYS, daysDone(s) + 1);
}

export function completionPct(s) {
  return Math.round((daysDone(s) / TOTAL_DAYS) * 100);
}

/** روزهای متوالی تکمیل (DST-safe از طریق dayNumber مبتنی بر Date.UTC) */
export function streak(s) {
  const dates = [...new Set(
    Object.keys(s.completed)
      .filter((k) => s.completed[k])
      .map((k) => s.days[k] && s.days[k].completedAt)
      .filter(Boolean),
  )].sort().reverse();
  if (!dates.length) return 0;
  const gap = dayNumber(localDate()) - dayNumber(dates[0]);
  if (gap > 1) return 0;
  let n = 1;
  for (let i = 1; i < dates.length; i++) {
    if (dayNumber(dates[i - 1]) - dayNumber(dates[i]) === 1) n++;
    else break;
  }
  return n;
}

/** میانگین یک سنجه عددی reflection در همه روزها (گرد شده تا یک رقم اعشار) */
export function averageScore(s, field) {
  const vals = Object.values(s.days)
    .map((d) => d.reflection && d.reflection[field])
    .filter((v) => v !== undefined && v !== null && v !== '')
    .map(Number)
    .filter((v) => Number.isFinite(v) && v >= 0);
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

/** مجموع امتیازهای هفتگی از روی شی scores */
export function weeklyTotalOf(scores = {}) {
  return WEEKLY_CRITERIA.reduce((sum, c) => sum + (Number(scores[c.key]) || 0), 0);
}

/** تاریخ‌های تکمیل‌شده به شکل YYYY-MM-DD (برای نوار فعالیت) */
export function completedDateSet(s) {
  const set = new Set();
  for (const k of Object.keys(s.completed)) {
    if (!s.completed[k]) continue;
    const d = s.days[k] && s.days[k].completedAt;
    if (d) set.add(d);
  }
  return set;
}

/** آخرین فعالیت ثبت‌شده: [شماره روز، رکورد] بر اساس updatedAt */
export function lastActivity(s) {
  return Object.entries(s.days)
    .filter(([, v]) => v.reflection && v.reflection.updatedAt)
    .sort((a, b) => b[1].reflection.updatedAt.localeCompare(a[1].reflection.updatedAt))[0] || null;
}

/** سری داده نمودارها: مقدار سه سنجه برای هر روز ۱..۴۰ */
export function metricSeries(s) {
  const out = [];
  for (let n = 1; n <= TOTAL_DAYS; n++) {
    const r = (s.days[n] && s.days[n].reflection) || {};
    out.push({
      day: n,
      completed: !!s.completed[n],
      patience: num(r.patience),
      willpower: num(r.willpower),
      adherence: num(r.adherence),
    });
  }
  return out;
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) && v !== '' && v !== null && v !== undefined ? n : null;
}

/** احساس‌های ثبت‌شده اخیر در reflection روزها (برای تراشه‌های داشبورد) */
export function recentEmotions(s, limit = 8) {
  return Object.entries(s.days)
    .filter(([, d]) => d.reflection && d.reflection.emotion && d.reflection.emotion.trim())
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .slice(0, limit)
    .map(([day, d]) => ({ day: Number(day), emotion: d.reflection.emotion.trim() }));
}

/** تعداد روزهای تثبیت ۹۰روزه انجام‌شده */
export function maintenanceDone(s) {
  return Object.values(s.maintenance.days || {}).filter((x) => x && x.done).length;
}
