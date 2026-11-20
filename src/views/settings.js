// ============================================================================
// settings.js — پشتیبان‌گیری، حریم خصوصی، بازنشانی و درباره برنامه
// import برخلاف v1 با مودال تایید انجام می‌شود (منطق آن در main.js است).
// ============================================================================

import { ABOUT_TEXT } from '../content/meta.js';

export function render(root) {
  root.innerHTML = `
  <div class="two-col">
    <section class="card">
      <h3 style="font-size:14px;margin:0">پشتیبان‌گیری</h3>
      <p class="small-text muted">تمام پیشرفت‌ها، تیک‌ها و خودارزیابی‌ها در فایل JSON ذخیره می‌شوند. فایل را در محل امن نگه دار.</p>
      <button class="btn primary" data-action="export">دانلود پشتیبان اطلاعات</button>
      <div class="field" style="margin-top:18px">
        <label>بازیابی از فایل پشتیبان</label>
        <input id="importFile" type="file" accept="application/json">
      </div>
      <button class="btn secondary" data-action="import">بازیابی اطلاعات</button>
    </section>
    <section class="card">
      <h3 style="font-size:14px;margin:0">حریم خصوصی و محل ذخیره‌سازی</h3>
      <div class="notice" style="margin:12px 0">این نسخه به هیچ سرور یا حساب کاربری متصل نیست. اطلاعات فقط در فضای ذخیره‌سازی مرورگر همین دستگاه نگهداری می‌شود.</div>
      <ul class="small-text muted" style="padding-inline-start:18px;line-height:2.2;margin:0">
        <li>هیچ معامله، قیمت، حجم یا سود و زیانی ذخیره نمی‌شود.</li>
        <li>هیچ اعلان یا هشدار زمان‌بندی‌شده‌ای وجود ندارد.</li>
        <li>پاک کردن داده‌های سایت در مرورگر ممکن است اطلاعات را حذف کند؛ پشتیبان بگیر.</li>
        <li>برای انتقال به دستگاه دیگر، فقط از فایل پشتیبان استفاده کن.</li>
        <li>داده‌ها رمزنگاری مستقل نمی‌شوند؛ امنیت حساب سیستم‌عامل و مرورگر خودت را حفظ کن.</li>
      </ul>
      <button class="btn danger" data-action="reset">حذف تمام اطلاعات محلی</button>
    </section>
  </div>
  <div class="card" style="margin-top:16px">
    <h3 style="font-size:14px;margin:0">درباره برنامه</h3>
    <p class="small-text muted" style="margin:8px 0 0">${ABOUT_TEXT}</p>
  </div>`;
}
