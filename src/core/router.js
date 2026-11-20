// ============================================================================
// router.js — مسیریابی مبتنی بر hash
// مسیرها مثل #/dashboard، #/day/12، #/toolkit/emotions
// دکمه Back مرورگر کار می‌کند، رفرش همان صفحه می‌ماند، deep-link ممکن است.
// ============================================================================

const routes = [];
let beforeEach = null;

/**
 * ثبت یک مسیر؛ الگو می‌تواند پارامتر بگیرد: '/day/:day'
 * handler(params, path) مسئول رندر است (در main.js به viewها وصل می‌شود).
 */
export function addRoute(pattern, handler) {
  routes.push({ segments: pattern.split('/').filter(Boolean), pattern, handler });
}

export function setBeforeEach(fn) {
  beforeEach = fn;
}

function match(path) {
  const parts = path.split('/').filter(Boolean);
  for (const r of routes) {
    if (r.segments.length !== parts.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < parts.length; i++) {
      const seg = r.segments[i];
      if (seg.startsWith(':')) params[seg.slice(1)] = decodeURIComponent(parts[i]);
      else if (seg !== parts[i]) { ok = false; break; }
    }
    if (ok) return { handler: r.handler, params, pattern: r.pattern };
  }
  return null;
}

/** مسیر جاری از hash (بدون #) */
export function currentPath() {
  return location.hash.slice(1) || '/';
}

/** پارس و اجرای مسیر جاری */
export function renderRoute() {
  const path = currentPath();
  const m = match(path) || match('/');
  if (beforeEach) beforeEach(m, path);
  m.handler(m.params, path);
  window.scrollTo(0, 0);
}

/** ناوبری برنامه‌ای؛ اگر روی همان مسیر باشیم فقط re-render می‌شود */
export function go(path) {
  if (currentPath() === path) renderRoute();
  else location.hash = path;
}

/** راه‌اندازی: گوش دادن به تغییر hash + رندر اولیه */
export function start() {
  if (!location.hash) location.replace('#/');
  window.addEventListener('hashchange', renderRoute);
  renderRoute();
}
