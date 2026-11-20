// ============================================================================
// utils.js — ابزارهای عمومی بدون وابستگی (تاریخ، اعداد، متن، debounce)
// ============================================================================

/** گریختن کاراکترهای خطرناک HTML برای هر داده کاربر */
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/** قالب‌بندی عدد با ارقام فارسی */
export function fmt(n) {
  return new Intl.NumberFormat('fa-IR').format(n);
}

/** تاریخ محلی به شکل YYYY-MM-DD (بدون آثار منطقه زمانی UTC) */
export function localDate(d = new Date()) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}

/**
 * شماره روز تقویمی از یک رشته YYYY-MM-DD — بر پایه Date.UTC مستقل از DST؛
 * در v1 از تقسیم میلی‌ثانیه محلی استفاده می‌شد که در تغییر ساعت فصلی می‌شکست.
 */
export function dayNumber(dateStr) {
  const [y, m, d] = String(dateStr).slice(0, 10).split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
}

/** کلید هفته ISO مثل 2026-W47 — برای یکتا کردن ارزیابی هفتگی */
export function isoWeekKey(d = new Date()) {
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = dt.getUTCDay() || 7;                 // دوشنبه=۱ ... یکشنبه=۷
  dt.setUTCDate(dt.getUTCDate() + 4 - day);        // پنجشنبهٔ همین هفته ISO
  const year = dt.getUTCFullYear();
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((dt - jan1) / 86400000 + 1) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/** کلید ماه مثل 2026-11 — برای یکتا کردن مرور ماهانه */
export function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function clamp(v, min, max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

/** debounce ساده با امکان لغو */
export function debounce(fn, ms) {
  let t = null;
  const wrapped = (...args) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => { t = null; fn(...args); }, ms);
  };
  wrapped.cancel = () => { if (t) clearTimeout(t); t = null; };
  return wrapped;
}
