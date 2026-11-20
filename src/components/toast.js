// ============================================================================
// toast.js — پیام گذرا (تک‌نمونه با مدیریت زمان)
// ============================================================================

let hideTimer = null;

export function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => el.classList.remove('show'), 2300);
}
