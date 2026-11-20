// ============================================================================
// sw.js — سرویس‌ورکر: precache نسخه‌بندی‌شده کل اپ + cache-first
// پس از اولین بازدید، اپ کاملاً آفلاین کار می‌کند.
// نکته مهم: با هر تغییر در فایل‌ها، VERSION را بالا ببرید تا کش تازه شود.
// ============================================================================

const VERSION = 'v2.0.1';

const PRECACHE = [
  './',
  'index.html',
  'manifest.webmanifest',
  // آیکون‌ها
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  // فونت (آفلاین کامل تایپوگرافی)
  'fonts/Vazirmatn-Regular.woff2',
  'fonts/Vazirmatn-Medium.woff2',
  'fonts/Vazirmatn-Bold.woff2',
  'fonts/Vazirmatn-ExtraBold.woff2',
  'fonts/OFL.txt',
  // استایل
  'styles/tokens.css',
  'styles/base.css',
  'styles/layout.css',
  'styles/components.css',
  'styles/pages.css',
  // هسته
  'src/main.js',
  'src/charts.js',
  'src/core/utils.js',
  'src/core/dom.js',
  'src/core/storage.js',
  'src/core/store.js',
  'src/core/actions.js',
  'src/core/selectors.js',
  'src/core/router.js',
  'src/core/timer.js',
  // محتوای کتاب کار
  'src/content/meta.js',
  'src/content/chapter1.js',
  'src/content/chapter2.js',
  'src/content/chapter3.js',
  'src/content/emotions.js',
  'src/content/checklists.js',
  'src/content/reviews.js',
  // کامپوننت‌ها
  'src/components/rating.js',
  'src/components/checklist.js',
  'src/components/toast.js',
  'src/components/modal.js',
  'src/components/ring.js',
  'src/components/day-tile.js',
  // نماها
  'src/views/dashboard.js',
  'src/views/path.js',
  'src/views/today.js',
  'src/views/progress.js',
  'src/views/settings.js',
  'src/views/report.js',
  'src/views/toolkit/index.js',
  'src/views/toolkit/emotions.js',
  'src/views/toolkit/checklists.js',
  'src/views/toolkit/emergency.js',
  'src/views/toolkit/reviews.js',
  'src/views/toolkit/contract.js',
  'src/views/toolkit/maintenance.js',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(PRECACHE)),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // حذف کش‌های نسخه‌های قبلی
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n !== VERSION).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  // cache-first با بازگشت به شبکه و ذخیره در حین اجرا
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(event.request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(event.request, copy));
          }
          return res;
        })
        .catch(() => {
          // آفلاین و در کش نبود: برای ناوبری، پوسته را برگردان
          if (event.request.mode === 'navigate') return caches.match('index.html');
          return undefined;
        });
    }),
  );
});
