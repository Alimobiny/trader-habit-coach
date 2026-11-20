// ============================================================================
// dom.js — کمکی‌های DOM و مدیریت رویداد از طریق delegation
// فقط یک شنونده به ازای هر نوع رویداد روی document ثبت می‌شود؛
// رندر مجدد نیازی به bind مجدد ندارد (رفع مشکل v1).
// ============================================================================

export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

/** رویداد delegate شده: handler فقط زمانی صدا زده می‌شود که هدف داخل selector باشد */
export function onClick(selector, handler) {
  document.addEventListener('click', (e) => {
    const t = e.target.closest(selector);
    if (t && document.contains(t)) handler(t, e);
  });
}

export function onChange(selector, handler) {
  document.addEventListener('change', (e) => {
    const t = e.target.closest(selector);
    if (t && document.contains(t)) handler(t, e);
  });
}

export function onInput(selector, handler) {
  document.addEventListener('input', (e) => {
    const t = e.target.closest(selector);
    if (t && document.contains(t)) handler(t, e);
  });
}
