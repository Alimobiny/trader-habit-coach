// ============================================================================
// rating.js — گروه دکمه‌های امتیازدهی با الگوی radiogroup (دسترس‌پذیر)
// دو حالت: quiz (۰..۵) و rate (۰..۱۰)
// ============================================================================

import { fmt, esc } from '../core/utils.js';

/**
 * @param {object} opts
 * @param {'quiz'|'rate'} opts.kind  نوع: quiz برای خودارزیابی، rate برای سنجه‌ها
 * @param {string} opts.field        نام فیلد (rate) یا اندیس سؤال (quiz)
 * @param {number|undefined} opts.value  مقدار فعلی ذخیره‌شده
 * @param {number} opts.max          بیشینه امتیاز
 * @param {string} opts.label        برچسب دسترس‌پذیری
 */
export function ratingGroup({ kind, field, value, max = 10, label }) {
  const attr = kind === 'quiz' ? 'data-quiz' : 'data-rate';
  const buttons = [];
  for (let v = 0; v <= max; v++) {
    const selected = value !== undefined && value !== null && value !== '' && Number(value) === v;
    buttons.push(
      `<button type="button" ${attr}="${field}" data-value="${v}" role="radio"
        aria-checked="${selected}" class="${selected ? 'selected' : ''}">${fmt(v)}</button>`,
    );
  }
  return `<div class="rating" role="radiogroup" aria-label="${esc(label)}">${buttons.join('')}</div>`;
}

/** به‌روزرسانی درجای گروه امتیاز بعد از کلیک (بدون re-render) */
export function patchGroup(groupEl, clickedBtn) {
  for (const b of groupEl.querySelectorAll('button')) {
    const on = b === clickedBtn;
    b.classList.toggle('selected', on);
    b.setAttribute('aria-checked', String(on));
  }
}
