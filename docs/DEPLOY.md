# راهنمای استقرار (GitHub Pages)

اپ کاملاً ایستا (static) است — هر میزبانی فایل با HTTPS کار می‌کند.
GitHub Pages انتخاب پیش‌فرض ماست: رایگان، دائمی، HTTPS خودکار.

## ۱. پیش‌نیازها

- نصب [Git](https://git-scm.com) و [GitHub CLI](https://cli.github.com)
- یک حساب GitHub

## ۲. راه‌اندازی ریپو و انتشار

از داخل پوشه `Trader_Habit_Coach_v2`:

```bash
git init
git add .
git commit -m "نسخه ۲: معماری ماژولار PWA"
gh auth login          # فقط بار اول — احراز در مرورگر
gh repo create trader-habit-coach --public --source=. --push
```

فعال‌سازی Pages (منبع: شاخه main، پوشه root):

```bash
gh api repos/{owner}/trader-habit-coach/pages -X POST \
   -f "source[branch]=main" -f "source[path]=/"
```

آدرس نهایی: `https://<username>.github.io/trader-habit-coach/`

> نکته: چون همه مسیرها relative هستند (`.`, `#/...`)، اپ زیر مسیر فرعی هم درست کار می‌کند.

## ۳. به‌روزرسانی‌های بعدی

```bash
git add . && git commit -m "توضیح تغییر" && git push
```

**مهم:** اگر فایل اضافه/حذف کردی، `PRECACHE` در `sw.js` را هم‌زمان کن و `VERSION`
را بالا ببر (مثلاً `v2.0.1`) — وگرنه کاربرانِ نصب‌شده نسخه قدیمیِ کش‌شده را می‌بینند.

## ۴. نصب روی گوشی

- **اندروید (Chrome):** باز کردن آدرس → منوی ⋮ → «Add to Home screen / نصب برنامه»
- **iOS (Safari):** اشتراک‌گذاری → «Add to Home Screen»

داده‌ها فقط روی همان دستگاه (localStorage) می‌مانند؛ برای جابه‌جایی بین دستگاه‌ها
از «پشتیبان و تنظیمات → دانلود پشتیبان» استفاده کن و در دستگاه دیگر بازیابی کن.

## ۵. تست محلی قبل از انتشار

```bash
python scripts/serve.py        # http://localhost:8000
node scripts/logic-test.mjs    # تست منطق core
```

چک‌لیست PWA در DevTools: Application → Manifest (بدون خطا) و Service Workers (activated).
حالت آفلاین: DevTools → Network → Offline → رفرش باید اپ را کامل بیاورد.

## گزینه‌های جایگزین میزبانی

- **Cloudflare Pages / Netlify:** پوشه را drag&drop کن (بدون build command، خروجی همان پوشه است).
- **میزبان شخصی:** کل محتوای پوشه را در روت وب‌سرور کپی کن.
