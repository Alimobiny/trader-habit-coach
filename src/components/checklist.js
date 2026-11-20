// ============================================================================
// checklist.js — ردیف تیک با scope ذخیره‌سازی
// scope مشخص می‌کند تیک کجا ذخیره شود: 'day' | 'tool' | 'contract'
// (در v1 مقصد ذخیره از روی صفحه‌ی جاری حدس زده می‌شد و تیک جعبه‌ابزار
//  با رفرش پاک می‌شد؛ اینجا صریح و ماندگار است.)
// ============================================================================

import { esc } from '../core/utils.js';

/**
 * @param {object} opts
 * @param {string} opts.scope   مقصد ذخیره
 * @param {string} opts.key     کلید تیک در آن مقصد
 * @param {string} opts.label   متن آیتم
 * @param {boolean} opts.checked وضعیت فعلی
 */
export function checkRow({ scope, key, label, checked }) {
  return `<label class="check-row ${checked ? 'done' : ''}">
    <input type="checkbox" data-check="${esc(key)}" data-scope="${esc(scope)}" ${checked ? 'checked' : ''}>
    <span>${esc(label)}</span>
  </label>`;
}

/** به‌روزرسانی درجای ظاهر ردیف بعد از تغییر تیک */
export function patchRow(input) {
  const row = input.closest('.check-row');
  if (row) row.classList.toggle('done', input.checked);
}
