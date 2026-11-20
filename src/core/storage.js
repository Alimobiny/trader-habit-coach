// ============================================================================
// storage.js — لایه ماندگاری داده (آداپتور localStorage)
// آینده: با پیاده‌سازی همین واسط روی IndexedDB می‌توان موتور ذخیره‌سازی را
// بدون دسترسی بقیه لایه‌ها تعویض کرد.
// ============================================================================

import { debounce } from './utils.js';
import { APP } from '../content/meta.js';

export const STORAGE_KEY = 'trader_habit_coach_v2';
export const SCHEMA_VERSION = 2;

/** ساختار کامل state نسخه ۲ */
export function freshState() {
  const now = new Date().toISOString();
  return {
    schema: SCHEMA_VERSION,
    started: false,
    startedAt: null,
    completed: {},            // { [روز ۱..۴۰]: true }
    days: {},                 // { [روز]: { checks:{}, reflection:{}, quiz:{}, completedAt } }
    weekly: {},               // { [هفته ISO مثل 2026-W47]: { scores, dominantEmotion, strengths, improvements, total, savedAt } }
    monthly: {},              // { [ماه مثل 2026-11]: { ...فیلدها, savedAt } }
    emotionLogs: [],          // [{ before, after, affect, how, alternative, correction, date }]
    toolkit: { checks: {}, emergencyResult: '' },   // تیک‌های جعبه‌ابزار — برخلاف v1 ماندگارند
    maintenance: {
      days: {},               // { [روز ۱..۹۰]: { done, focus, note, date } }
      contract: { checks: {}, sign: '', date: '' },
    },
    meta: { createdAt: now, updatedAt: now },
  };
}

/** تضمین وجود همه زیرساختارها (پایایی داده در به‌روزرسانی‌های آینده) */
export function normalize(state) {
  const base = freshState();
  const merged = { ...base, ...state, meta: { ...base.meta, ...(state.meta || {}) } };
  merged.toolkit = { ...base.toolkit, ...(state.toolkit || {}) };
  merged.maintenance = { ...base.maintenance, ...(state.maintenance || {}) };
  merged.maintenance.contract = { ...base.maintenance.contract, ...(merged.maintenance.contract || {}) };
  merged.schema = SCHEMA_VERSION;
  return merged;
}

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.schema !== SCHEMA_VERSION) return freshState();
    return normalize(parsed);
  } catch {
    return freshState();
  }
}

/** ذخیره فوری؛ در شکست (مثلاً پر بودن فضا) false برمی‌گرداند */
export function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export const saveDebounced = debounce(save, 500);

/** ساخت بدنه فایل پشتیبان */
export function buildBackup(state) {
  return {
    app: APP.enName,
    schema: SCHEMA_VERSION,
    appVersion: APP.version,
    exportedAt: new Date().toISOString(),
    data: state,
  };
}

/** اعتبارسنجی فایل پشتیبان؛ خروجی {ok, data} یا {ok:false, error} */
export function parseBackup(text) {
  try {
    const parsed = JSON.parse(text);
    const candidate = parsed && typeof parsed === 'object' && parsed.data ? parsed.data : parsed;
    if (!candidate || candidate.schema !== SCHEMA_VERSION || !candidate.days || !candidate.completed) {
      return { ok: false, error: 'ساختار فایل معتبر نیست یا با این نسخه سازگار نیست.' };
    }
    return { ok: true, data: normalize(candidate) };
  } catch {
    return { ok: false, error: 'فایل JSON قابل خواندن نیست.' };
  }
}

/** دانلود فایل پشتیبان */
export function downloadBackup(state) {
  const blob = new Blob([JSON.stringify(buildBackup(state), null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  const today = new Date();
  const stamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  a.href = URL.createObjectURL(blob);
  a.download = `trader-habit-coach-backup-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
