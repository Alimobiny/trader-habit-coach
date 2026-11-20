// ============================================================================
// main.js — نقطه ورود: ثبت مسیرها، سیم‌کشی رویدادهای عمومی، راه‌اندازی
// ============================================================================
import { addRoute, setBeforeEach, start, go } from './core/router.js';
import { onClick, onChange, onInput, qs } from './core/dom.js';
import { getState, subscribe } from './core/store.js';
import { dispatch } from './core/actions.js';
import * as S from './core/selectors.js';
import * as timer from './core/timer.js';
import { toast } from './components/toast.js';
import { confirmModal } from './components/modal.js';
import { patchGroup } from './components/rating.js';
import { patchRow } from './components/checklist.js';
import { downloadBackup, parseBackup } from './core/storage.js';
import { PAGE_META } from './content/meta.js';

// import نماها (ثبت delegate handlerهای خاص هر نما در بارگذاری ماژول انجام می‌شود)
import * as dashboard from './views/dashboard.js';
import * as pathView from './views/path.js';
import * as today from './views/today.js';
import * as toolkit from './views/toolkit/index.js';
import * as progress from './views/progress.js';
import * as settings from './views/settings.js';
import * as report from './views/report.js';

// ---------------------------------------------------------------------------
// مسیرها
// ---------------------------------------------------------------------------
const page = qs('#page');

const wrap = (view) => (params, path) => {
  view.render(page, params);
  afterRender(path);
};

addRoute('/', wrap(dashboard));
addRoute('/dashboard', wrap(dashboard));
addRoute('/path', wrap(pathView));
addRoute('/today', wrap(today));
addRoute('/day/:day', wrap(today));
addRoute('/toolkit', wrap(toolkit));
addRoute('/toolkit/:tab', wrap(toolkit));
addRoute('/progress', wrap(progress));
addRoute('/report', wrap(report));
addRoute('/settings', wrap(settings));

setBeforeEach(() => {
  timer.stop();                                // تایمر صفحه قبل نشت نکند
  qs('#sidebar').classList.remove('open');     // بستن منوی موبایل
});

/** به‌روزرسانی تاپ‌بار، حالت فعال ناوبری و مدیریت فوکوس پس از هر رندر */
function afterRender(path) {
  const key = pageKeyOf(path);
  const meta = PAGE_META[key] || PAGE_META.dashboard;
  qs('#pageTitle').textContent = meta[0];
  qs('#pageSubtitle').textContent = meta[1];
  for (const a of document.querySelectorAll('[data-nav]')) {
    a.classList.toggle('active', a.dataset.nav === key);
  }
  qs('#pageTitle').focus({ preventScroll: true });
}

function pageKeyOf(path) {
  const seg = path.split('/').filter(Boolean)[0] || 'dashboard';
  return seg === 'day' ? 'today' : seg;
}

// ---------------------------------------------------------------------------
// رویدادهای عمومی (delegation روی document — بدون bind مجدد بعد از رندر)
// ---------------------------------------------------------------------------
function dayOf(el) {
  const wrapEl = el.closest('[data-day]');
  return wrapEl ? Number(wrapEl.dataset.day) : null;
}

// آزمون خودارزیابی (۰..۵) — به‌روزرسانی درجا، بدون re-render و بدون از دست رفتن فوکوس
onClick('[data-quiz]', (btn) => {
  const day = dayOf(btn);
  if (day === null) return;
  dispatch('SET_QUIZ', { day, q: btn.dataset.quiz, value: Number(btn.dataset.value) });
  patchGroup(btn.closest('.rating'), btn);
});

// امتیاز سنجه‌ها (۰..۱۰)
onClick('[data-rate]', (btn) => {
  const day = dayOf(btn);
  if (day === null) return;
  dispatch('SET_RATING', { day, field: btn.dataset.rate, value: Number(btn.dataset.value) });
  patchGroup(btn.closest('.rating'), btn);
});

// تیک‌ها — مقصد ذخیره از data-scope مشخص می‌شود (نه از روی صفحه جاری مثل v1)
onChange('[data-check]', (input) => {
  const scope = input.dataset.scope;
  const key = input.dataset.check;
  const checked = input.checked;
  if (scope === 'day') {
    const day = dayOf(input);
    if (day !== null) dispatch('SET_DAY_CHECK', { day, key, checked });
  } else if (scope === 'tool') {
    dispatch('SET_TOOL_CHECK', { key, checked });
  } else if (scope === 'contract') {
    dispatch('SET_CONTRACT_CHECK', { index: Number(key.slice(1)), checked });
  }
  patchRow(input);
});

// ورودی‌های متنی روز — فقط state به‌روز می‌شود؛ ذخیره debounce شده است
onInput('[data-ref]', (el) => {
  const day = dayOf(el);
  if (day === null) return;
  dispatch('SET_REFLECTION', { day, field: el.dataset.ref, value: el.value });
});

// ---------------------------------------------------------------------------
// اکشن‌های عمومی (خروجی/بازیابی/بازنشانی/چاپ)
// ---------------------------------------------------------------------------
onClick('[data-action="export"]', () => {
  downloadBackup(getState());
  toast('فایل پشتیبان آماده شد.');
});

onClick('[data-action="import"]', () => {
  const input = document.getElementById('importFile');
  const file = input && input.files ? input.files[0] : null;
  if (!file) {
    toast('ابتدا فایل پشتیبان را انتخاب کن.');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const parsed = parseBackup(String(reader.result));
    if (!parsed.ok) {
      toast(parsed.error);
      return;
    }
    const currentDone = S.daysDone(getState());
    const incomingDone = Object.keys(parsed.data.completed).filter((k) => parsed.data.completed[k]).length;
    // برخلاف v1، جایگزینی کل داده با تایید صریح انجام می‌شود
    confirmModal({
      title: 'بازیابی اطلاعات از فایل؟',
      body: `داده فعلی (${currentDone} روز تکمیل‌شده) با محتوای فایل (${incomingDone} روز تکمیل‌شده) جایگزین می‌شود. این کار قابل بازگشت نیست؛ اگر لازم است ابتدا پشتیبان بگیر.`,
      confirmLabel: 'بله، بازیابی کن',
      danger: true,
      onConfirm() {
        dispatch('IMPORT', parsed.data);
        go('#/dashboard');
        toast('اطلاعات بازیابی شد.');
      },
    });
  };
  reader.readAsText(file);
});

onClick('[data-action="reset"]', () => {
  confirmModal({
    title: 'حذف تمام اطلاعات؟',
    body: 'این کار همه روزهای تکمیل‌شده، تیک‌ها و خودارزیابی‌های ذخیره‌شده روی همین مرورگر را حذف می‌کند. قبل از ادامه، فایل پشتیبان بگیر.',
    confirmLabel: 'بله، حذف کن',
    danger: true,
    onConfirm() {
      dispatch('RESET');
      go('#/dashboard');
      toast('اطلاعات محلی پاک شد.');
    },
  });
});

onClick('[data-action="print"]', () => window.print());

// منوی موبایل
document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// اطلاع‌رسانی شکست ذخیره‌سازی (از طریق پرچم meta.lastSaveFailed)
subscribe((s) => {
  if (s.meta && s.meta.lastSaveFailed) {
    s.meta.lastSaveFailed = false;
    toast('ذخیره‌سازی انجام نشد؛ فضای مرورگر را بررسی کن.');
  }
});

// ---------------------------------------------------------------------------
// راه‌اندازی
// ---------------------------------------------------------------------------
start();

// ثبت سرویس‌ورکر (فقط روی http/https — محیط توسعه لوکال و هاست تولید)
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => console.warn('SW register failed:', err));
  });
}
