// ============================================================================
// reviews.js — امتیازدهی هفتگی، مرور ماهانه، قرارداد تعهد و برنامه ۹۰ روزه
// محتوا عیناً از نسخه ۱؛ فقط کلیدهای داده‌سازی اصلاح شده است
// (در v1 کلید امتیاز «مدیریت احساسات» و فیلد متنی «احساس غالب هفته» هر دو
//  emotion بودند و ذخیره فرم، امتیاز عددی را بازنویسی می‌کرد — اینجا جدا شدند).
// ============================================================================

/** معیارهای امتیازدهی هفتگی کتاب (مجموع ۱۰۰) */
export const WEEKLY_CRITERIA = [
  { key: 'checklist', label: 'پایبندی به چک‌لیست', max: 30 },
  { key: 'emotion_mgmt', label: 'مدیریت احساسات', max: 20 },
  { key: 'risk', label: 'مدیریت سرمایه', max: 20 },
  { key: 'journal', label: 'ثبت/مرور ژورنال کاغذی', max: 15 },
  { key: 'review', label: 'بازبینی و یادگیری', max: 15 },
];

/** فیلدهای متنی مرور هفتگی */
export const WEEKLY_TEXT_FIELDS = [
  { key: 'dominantEmotion', label: 'احساس غالب هفته' },
  { key: 'strengths', label: 'سه نقطه قوت' },
  { key: 'improvements', label: 'سه مورد نیازمند بهبود' },
];

export const WEEKLY_HINT = 'امتیازها را بر مبنای اجرای فرآیند بده؛ لازم نیست داده معاملات را وارد کنی.';

/** فیلدهای مرور ماهانه */
export const MONTHLY_FIELDS = [
  { key: 'patience', label: 'میانگین امتیاز صبر', type: 'number', min: 0, max: 10 },
  { key: 'willpower', label: 'میانگین امتیاز اراده', type: 'number', min: 0, max: 10 },
  { key: 'adherence', label: 'درصد پایبندی به استراتژی', type: 'number', min: 0, max: 100 },
  { key: 'win', label: 'بزرگ‌ترین پیشرفت', type: 'textarea' },
  { key: 'barrier', label: 'بزرگ‌ترین مانع', type: 'textarea' },
  { key: 'goal', label: 'هدف ماه آینده', type: 'textarea' },
];

export const MONTHLY_HINT = 'این فرم در پایان هر ماه تکمیل می‌شود.';

/** بندهای قرارداد تعهد معامله‌گر */
export const CONTRACT_ITEMS = [
  'من فقط ستاپ‌های معتبر را معامله می‌کنم.',
  'نتیجه یک معامله ارزش من را تعیین نمی‌کند.',
  'حد ضرر بخشی از برنامه من است.',
  'هیچ‌گاه برای جبران ضرر معامله نمی‌کنم.',
  'کیفیت معاملات از تعداد آن‌ها مهم‌تر است.',
  'نتیجه معاملات را از کیفیت اجرای قوانین جدا می‌دانم.',
  'من مسئول اجرای فرآیند هستم، نه کنترل نتیجه بازار.',
];

export const CONTRACT_HINT = 'تعهد به اجرای فرآیند، نه کنترل نتیجه بازار.';

/** برنامه تثبیت ۹۰ روزه: سه ماه */
export const MAINTENANCE_PHASES = [
  { from: 1, to: 30, title: 'ماه اول', focus: 'تثبیت چک‌لیست‌ها و مرور کامل ژورنال کاغذی', short: 'تثبیت چک‌لیست‌ها و مرور ژورنال' },
  { from: 31, to: 60, title: 'ماه دوم', focus: 'کاهش خطاهای احساسی و افزایش کیفیت اجرا', short: 'کاهش خطاهای احساسی و بهبود اجرا' },
  { from: 61, to: 90, title: 'ماه سوم', focus: 'بهینه‌سازی فرآیند و مرور عملکرد برای ساخت عادت پایدار', short: 'بهینه‌سازی و مرور عملکرد' },
];

export const MAINTENANCE_HINT =
  'ادامه مسیر پس از پایان دوره اصلی؛ روزها با ثبت تداوم عادت جلو می‌روند.';

export const MAINTENANCE_CHECK_LABEL =
  'امروز عادت اصلی‌ام را اجرا کردم: مرور قوانین، اجرای چک‌لیست و تقدم فرآیند بر نتیجه.';

export const MAINTENANCE_FOCUS_PLACEHOLDER = 'فقط یک مهارت رفتاری';

/** روز تثبیت بعدی بر اساس تعداد روزهای انجام‌شده */
export function nextMaintenanceDay(days) {
  const done = Object.values(days || {}).filter((x) => x && x.done).length;
  return Math.min(90, done + 1);
}

export function phaseOfDay(n) {
  return MAINTENANCE_PHASES.find((p) => n >= p.from && n <= p.to) || MAINTENANCE_PHASES[2];
}
