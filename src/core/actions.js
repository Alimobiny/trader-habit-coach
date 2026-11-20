// ============================================================================
// actions.js — تمام تغییرات state به شکل اکشن‌های نام‌دار
// جایگزین handleAction هجده‌شاخه‌ای v1؛ هر اکشن فقط state را تغییر می‌دهد و
// پاسخ مورد نیاز (پیام/ناوبری) را برمی‌گرداند تا لایه UI تصمیم بگیرد.
// قاعده: اکشن‌ها هرگز مستقیماً DOM را لمس نمی‌کنند.
// ============================================================================

import { getState, mutate, replaceAll } from './store.js';
import { freshState, normalize } from './storage.js';
import { localDate, isoWeekKey, monthKey, clamp } from './utils.js';
import { WEEKLY_CRITERIA } from '../content/reviews.js';

/** رکورد یک روز؛ در صورت نبود، در state ساخته می‌شود */
function dayRec(s, n) {
  if (!s.days[n]) s.days[n] = { checks: {}, reflection: {}, quiz: {} };
  return s.days[n];
}

const capOf = (key) => (WEEKLY_CRITERIA.find((c) => c.key === key) || {}).max || 100;

export const actions = {

  START_PROGRAM() {
    mutate((s) => {
      if (!s.started) {
        s.started = true;
        s.startedAt = localDate();
      }
    });
  },

  // ---------- تمرین روز ----------
  SET_QUIZ({ day, q, value }) {
    mutate((s) => { dayRec(s, day).quiz[q] = value; });
  },

  SET_RATING({ day, field, value }) {
    mutate((s) => {
      const r = dayRec(s, day).reflection;
      r[field] = value;
      r.updatedAt = localDate();
    });
  },

  SET_REFLECTION({ day, field, value }) {
    mutate((s) => {
      const r = dayRec(s, day).reflection;
      r[field] = value;
      r.updatedAt = localDate();
    });
  },

  SET_DAY_CHECK({ day, key, checked }) {
    mutate((s) => { dayRec(s, day).checks[key] = checked; });
  },

  /** تکمیل روز؛ خروجی {ok, message} — اعتبارسنجی حداقل یک اقدام تیک‌خورده */
  COMPLETE_DAY({ day }) {
    const s = getState();
    const checks = (s.days[day] && s.days[day].checks) || {};
    if (Object.values(checks).filter(Boolean).length === 0) {
      return { ok: false, message: 'برای تکمیل روز، حداقل یک اقدام تمرینی را علامت بزن.' };
    }
    mutate((st) => {
      st.completed[day] = true;
      dayRec(st, day).completedAt = localDate();
    });
    return {
      ok: true,
      message: day === 40
        ? 'برنامه ۴۰روزه تکمیل شد. مسیر تثبیت ۹۰روزه را آغاز کن.'
        : 'روز تکمیل شد؛ روز بعد باز شد.',
    };
  },

  // ---------- جعبه‌ابزار ----------
  SET_TOOL_CHECK({ key, checked }) {
    mutate((s) => { s.toolkit.checks[key] = checked; });
  },

  SET_EMERGENCY_RESULT(value) {
    mutate((s) => { s.toolkit.emergencyResult = value; });
  },

  CLEAR_TOOL_CHECKS() {
    mutate((s) => {
      s.toolkit.checks = {};
      s.toolkit.emergencyResult = '';
    });
  },

  // ---------- مرورها ----------
  /** امتیاز هفتگی درجا (با سقف معیار) */
  SET_WEEKLY_SCORE({ key, value }) {
    const capped = clamp(value, 0, capOf(key));
    mutate((s) => {
      const wk = s.weekly[isoWeekKey()] || (s.weekly[isoWeekKey()] = { scores: {} });
      if (!wk.scores) wk.scores = {};
      wk.scores[key] = capped;
    });
    return capped;
  },

  /** ذخیره ارزیابی هفتگی — کلید هفته ISO → بدون رکورد تکراری (رفع باگ v1) */
  SAVE_WEEK({ scores = {}, dominantEmotion = '', strengths = '', improvements = '' }) {
    const clean = {};
    for (const c of WEEKLY_CRITERIA) clean[c.key] = clamp(scores[c.key], 0, c.max);
    const total = WEEKLY_CRITERIA.reduce((sum, c) => sum + clean[c.key], 0);
    mutate((s) => {
      s.weekly[isoWeekKey()] = { scores: clean, dominantEmotion, strengths, improvements, total, savedAt: localDate() };
    });
  },

  /** ذخیره مرور ماهانه — کلید ماه → بدون رکورد تکراری */
  SAVE_MONTH(fields) {
    mutate((s) => {
      s.monthly[monthKey()] = { ...fields, savedAt: localDate() };
    });
  },

  /** ثبت یادداشت تحلیل احساسات */
  SAVE_EMOTION_LOG(entry) {
    mutate((s) => {
      s.emotionLogs.push({ ...entry, date: localDate() });
    });
  },

  // ---------- تثبیت ۹۰ روزه و قرارداد ----------
  SAVE_MAINTENANCE({ day, done, focus = '', note = '' }) {
    mutate((s) => {
      s.maintenance.days[day] = { done: !!done, focus, note, date: localDate() };
    });
  },

  SET_CONTRACT_CHECK({ index, checked }) {
    mutate((s) => { s.maintenance.contract.checks[index] = checked; });
  },

  SAVE_CONTRACT({ sign = '', date = '' }) {
    mutate((s) => {
      s.maintenance.contract.sign = sign;
      s.maintenance.contract.date = date;
    });
  },

  // ---------- داده‌ها ----------
  IMPORT(data) {
    replaceAll(normalize(data));
  },

  RESET() {
    replaceAll(freshState());
  },
};

/** فراخوانی اکشن با نام؛ اکشن ناشناخته هشدار می‌دهد نه خطای خام */
export function dispatch(name, payload) {
  const fn = actions[name];
  if (typeof fn !== 'function') {
    console.warn(`[actions] اکشن ناشناخته: ${name}`);
    return null;
  }
  return fn(payload);
}
