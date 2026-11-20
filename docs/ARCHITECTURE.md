# معماری «مربی عادت معامله‌گر» — نسخه ۲

> بازسازی ماژولارِ `Trader_Habit_Coach_FA.html` (v1) به‌صورت PWA کامل.
> محتوای کتاب کار «صبر و اراده در معامله‌گری» عیناً و بدون تغییر منتقل شده است.

## نمای کلی لایه‌ها

```
┌────────────────────────────────────────────────────────┐
│ index.html (پوسته ثابت: سایدبار/تاپ‌بار/نوار موبایل)      │
├────────────────────────────────────────────────────────┤
│ views/        یک ماژول به‌ازای هر مسیر (رندر + رویداد خاص)│
│ components/   rating, checklist, modal, toast, ring, …  │
│ charts.js     نمودارهای SVG بدون وابستگی                 │
├────────────────────────────────────────────────────────┤
│ core/                                                       │
│   router.js   مسیریابی hash (#/day/12، #/toolkit/emotions)│
│   store.js    ظرف متمرکز state (mutate/replaceAll/subscribe)│
│   actions.js  همه تغییرات state به شکل اکشن نام‌دار        │
│   selectors.js خواندن‌های مشتق (streak، میانگین، …)        │
│   storage.js  آداپتور localStorage + پشتیبان/بازیابی      │
│   dom.js      delegation رویداد (بدون bind مجدد)          │
│   timer.js    تایمر ۹۰ ثانیه با چرخه عمر مستقل            │
│   utils.js    esc/fmt/تاریخ DST-safe/debounce              │
├────────────────────────────────────────────────────────┤
│ content/      داده خالص کتاب کار — بدون هیچ منطقی         │
├────────────────────────────────────────────────────────┤
│ styles/       tokens → base → layout → components → pages │
│ sw.js         سرویس‌ورکر precache نسخه‌بندی‌شده             │
└────────────────────────────────────────────────────────┘
```

**قاعده وابستگی:** `views → components/charts/core/content` و `core → content`.
core هرگز views را نمی‌بیند؛ content هیچ‌چیز را غیر از هیچ نمی‌بیند.

## جریان داده

1. کاربر تعاملی می‌کند (کلیک/تیک/تایپ) → شنوندهٔ delegate شده در `main.js` یا ماژول view
2. → `dispatch('ACTION_NAME', payload)` در `actions.js` — تنها نقطه تغییر state
3. → `store.mutate()` : تغییر state + ذخیره debounce شده (۵۰۰ms) + انتشار رویداد
4. → **به‌روزرسانی هدفمند DOM** (مثلاً `patchGroup` برای دکمه‌های امتیاز) — بدون re-render کل صفحه

رندر کامل فقط هنگام تغییر مسیر انجام می‌شود (router → view.render → innerHTML یک‌بار).
دکمه Back مرورگر کار می‌کند؛ رفرش همان صفحه می‌ماند (hash routing).

## مدل داده (schema 2)

```
{
  schema: 2,
  started, startedAt,
  completed: { [روز ۱..۴۰]: true },
  days: { [روز]: { checks, reflection, quiz, completedAt } },
  weekly:   { [هفته ISO مثل 2026-W47]: { scores, dominantEmotion, strengths, improvements, total, savedAt } },
  monthly:  { [ماه مثل 2026-11]: { …فیلدها, savedAt } },
  emotionLogs: [ { before, after, affect, how, alternative, correction, date } ],
  toolkit: { checks, emergencyResult },          // ماندگار (در v1 با رفرش پاک می‌شد)
  maintenance: { days: { [۱..۹۰]: {…} }, contract: { checks, sign, date } },
  meta: { createdAt, updatedAt }
}
```

کلید ذخیره‌سازی: `trader_habit_coach_v2` (جدا از v1 — شروع تازه طبق تصمیم کاربر).

## رفع ایرادهای شناخته‌شده v1

| ایراد v1 | راه‌حل در v2 |
|---|---|
| re-render کل صفحه در هر کلیک (از دست رفتن فوکوس) | delegation + patch درجا |
| ذخیره کل state در هر keystroke | debounce ۵۰۰ms + ذخیره فوری در pagehide |
| `handleAction` مونولیتیک ۱۸شاخه‌ای | اکشن‌های نام‌دار در `actions.js` |
| تیک جعبه‌ابزار با رفرش پاک می‌شد | `state.toolkit` ماندگار |
| رکورد تکراری مرور هفتگی/ماهانه | کلید ISO هفته/ماه |
| تداخل کلید `emotion` (امتیاز ۰-۲۰) با «احساس غالب هفته» | جدا شدن به `scores.emotion_mgmt` و `dominantEmotion` |
| import بدون تایید | مودال تایید با خلاصه داده ورودی |
| بدون مسیریابی؛Back از اپ خارج می‌شد | hash router |
| ارجاع PWA به فایل‌های ناموجود | manifest + sw واقعی و کامل |
| streak حساس به DST | `dayNumber` بر پایه Date.UTC |
| `border-right` هاردکد برای RTL | فقط ویژگی‌های منطقی (`border-inline-start`) |
| کد مرده (`state.settings` و …) | حذف |
| گرید ثابت ۴ ستونی مرور روزها | `repeat(auto-fill, minmax(120px,1fr))` |

## قابلیت‌های جدید

- **نمودارهای SVG واقعی**: خطی سه‌سنجه (صبر/اراده/پایبندی) + میله‌ای پایبندی، RTL (روز ۱ راست)
- **داشبورد غنی‌تر**: روند کوچک، نوار فعالیت ۲۸ روزه، تراشه احساس‌های اخیر
- **گزارش چاپی** `#/report` با استایل `@media print` → چاپ / ذخیره PDF
- **PWA کامل**: نصب‌پذیر روی موبایل، آفلاین کامل پس از اولین بازدید، فونت Vazirmatn لوکال

## قواعد توسعه

- **افزودن صفحه جدید:** ماژول در `src/views/` بساز (خروجی `render(root, params)`)، در `main.js` مسیر ثبت کن، عنوان را در `content/meta.js` (PAGE_META) اضافه کن، و اگر فایل جدیدی ساختی آن را به `PRECACHE` در `sw.js` اضافه کن و `VERSION` را بالا ببر.
- **تغییر محتوای کتاب کار:** فقط فایل‌های `src/content/` را دست بزن — نه core، نه views.
- **تغییر ساختار داده:** `schema` را در `storage.js` بالا ببر و در `normalize()` نگاشت بنویس.
- **تست منطق بدون مرورگر:** `node scripts/logic-test.mjs`
- **سرور توسعه:** `python scripts/serve.py` (سرویس‌ورکر روی `file:` کار نمی‌کند)

## تصمیم‌های کلید (Decision Log)

1. **Vanilla ES Modules بدون build** — بدون فریم‌ورک/باندلر؛ استقرار = کپی فایل‌ها. مرزهای ماژول تمیز، مسیر مهاجرت آینده به Vite را باز نگه می‌دارد.
2. **تک‌فایل بودن قربانی شد** — در ازای ماژولار بودن؛ کاربر PWA روی گوشی را انتخاب کرد و PWA ذاتاً چندفایلی و میزبانی‌شده است.
3. **localStorage (نه IndexedDB)** — داده کوچک و JSON-پذیر است؛ آداپتور `storage.js` تعویض آینده به IndexedDB را ممکن می‌کند.
4. **cache-first سرویس‌ورکر** — اپ ایستا است؛ precache کامل نسخه‌بندی‌شده ساده‌ترین مدل صحیح آفلاین است.
5. **محتوای ثابت در `content/` به‌صورت داده** — مرز روشن میان «کتاب کار» و «مهندسی»؛ محتوا بدون لمس کد تغییرپذیر است.
