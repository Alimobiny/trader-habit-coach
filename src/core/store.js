// ============================================================================
// store.js — ظرف متمرکز state
// همه تغییرات از طریق mutate/replaceAll عبور می‌کنند: تغییر → ذخیره → انتشار.
// هیچ view مستقیماً state را دستکاری نمی‌کند.
// ============================================================================

import { load, save, saveDebounced } from './storage.js';

let state = load();
const subscribers = new Set();

export function getState() {
  return state;
}

/**
 * اجرای تغییرات روی state از طریق تابع recipe.
 * ذخیره debounce می‌شود (به‌جز موارد فوری که replaceAll/persistNow صدا زده می‌شوند).
 */
export function mutate(recipe) {
  recipe(state);
  state.meta.updatedAt = new Date().toISOString();
  const ok = saveDebounced(state);
  if (ok === false) {
    // save هرگز throw نمی‌کند؛ فقط در شکست toast می‌خواهیم — بدون وابستگی مستقیم
    // به UI، رویداد را منتشر می‌کنیم و main.js به toast ترجمه می‌کند.
    state.meta.lastSaveFailed = true;
  }
  emit();
}

/** جایگزینی کامل state (import/reset) — ذخیره فوری */
export function replaceAll(next) {
  state = next;
  save(state);
  emit();
}

/** ذخیره فوری (مثلاً قبل از بستن صفحه) */
export function persistNow() {
  save(state);
}

export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

function emit() {
  for (const fn of subscribers) fn(state);
}

// ذخیره فوری هنگام خروج از صفحه تا آخرین تایپ‌ها از دست نروند
window.addEventListener('pagehide', persistNow);
