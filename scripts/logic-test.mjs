// ============================================================================
// logic-test.mjs — تست منطق لایه core بدون مرورگر (با جایگزین localStorage)
// اجرا:  node scripts/logic-test.mjs
// ============================================================================
// خروجی: تعداد تست‌های موفق/ناموفق و کد خروج

// --- شبیه‌سازی محیط مرورگر (فقط چیزی که core در زمان import لمس می‌کند) ---
const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
};
globalThis.window = { addEventListener() {} };

const { getState } = await import('../src/core/store.js');
const { dispatch } = await import('../src/core/actions.js');
const S = await import('../src/core/selectors.js');
const { isoWeekKey, monthKey, dayNumber, localDate } = await import('../src/core/utils.js');
const { buildBackup, parseBackup } = await import('../src/core/storage.js');

let pass = 0, fail = 0;
const t = (name, cond) => {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.error(`  ✗ ${name}`); }
};

console.log('— state اولیه');
let s = getState();
t('schema = 2', s.schema === 2);
t('روزهای تکمیل‌شده = 0', S.daysDone(s) === 0);
t('روز باز شده = 1', S.unlockedDay(s) === 1);
t('کلید هفته ISO با قالب صحیح', /^\d{4}-W\d{2}$/.test(isoWeekKey()));
t('کلید ماه با قالب صحیح', /^\d{4}-\d{2}$/.test(monthKey()));

console.log('— جریان روز ۱ (فصل ۱)');
dispatch('SET_QUIZ', { day: 1, q: 0, value: 3 });
s = getState();
t('پاسخ آزمون ذخیره شد', s.days[1].quiz[0] === 3);
dispatch('SET_RATING', { day: 1, field: 'patience', value: 7 });
s = getState();
t('امتیاز صبر ذخیره شد', s.days[1].reflection.patience === 7);

const noCheck = dispatch('COMPLETE_DAY', { day: 1 });
t('تکمیل بدون تیک رد می‌شود', noCheck.ok === false);
dispatch('SET_DAY_CHECK', { day: 1, key: 'observe', checked: true });
const withCheck = dispatch('COMPLETE_DAY', { day: 1 });
t('تکمیل با تیک موفق است', withCheck.ok === true);
s = getState();
t('روز ۱ تکمیل و روز ۲ باز شد', s.completed[1] === true && S.unlockedDay(s) === 2);

console.log('— استریک (DST-safe)');
const yest = new Date(); yest.setDate(yest.getDate() - 1);
dispatch('SET_DAY_CHECK', { day: 2, key: 'main', checked: true });
dispatch('COMPLETE_DAY', { day: 2 });
// شبیه‌سازی: روز ۲ دیروز تکمیل شده باشد
getState().days[2].completedAt = localDate(yest);
t('استریک دو روزه = ۲', S.streak(getState()) === 2);
t('فاصله یک روزه بین دو تاریخ مجاور', dayNumber('2026-03-21') - dayNumber('2026-03-20') === 1);

console.log('— میانگین‌ها');
dispatch('SET_RATING', { day: 2, field: 'patience', value: 8 });
t('میانگین صبر ۷ و ۸ = ۷.۵', S.averageScore(getState(), 'patience') === 7.5);

console.log('— مرور هفتگی/ماهانه (بدون رکورد تکراری)');
dispatch('SAVE_WEEK', { scores: { checklist: 25, emotion_mgmt: 99, risk: 18, journal: 14, review: 13 }, dominantEmotion: 'عجله', strengths: 'a', improvements: 'b' });
dispatch('SAVE_WEEK', { scores: { checklist: 26, emotion_mgmt: 18, risk: 19, journal: 15, review: 14 }, dominantEmotion: 'آرامش', strengths: 'c', improvements: 'd' });
s = getState();
let weekKeys = Object.keys(s.weekly);
t('دو ذخیره در یک هفته → یک رکورد', weekKeys.length === 1);
t('امتیاز کل با سقف‌ها = ۹۲', s.weekly[weekKeys[0]].total === 26 + 18 + 19 + 15 + 14);
t('امتیاز عددی با متن احساس غالب قاطی نشد', s.weekly[weekKeys[0]].dominantEmotion === 'آرامش');
// سقف‌گذاری صریح: همه سقف‌ها + یکی فراتر از سقف → جمع باید دقیقاً ۱۰۰ شود
dispatch('SAVE_WEEK', { scores: { checklist: 40, emotion_mgmt: 99, risk: 20, journal: 15, review: 15 }, dominantEmotion: '', strengths: '', improvements: '' });
s = getState();
weekKeys = Object.keys(s.weekly);
t('امتیاز فراتر از سقف کلمه می‌شود → کل = ۱۰۰', s.weekly[weekKeys[0]].total === 100);
t('مدیریت احساسات روی سقف ۲۰ نشست', s.weekly[weekKeys[0]].scores.emotion_mgmt === 20);

dispatch('SAVE_MONTH', { patience: '7', willpower: '8', adherence: '90', win: 'w', barrier: 'b', goal: 'g' });
dispatch('SAVE_MONTH', { patience: '8', willpower: '9', adherence: '95', win: 'w2', barrier: 'b2', goal: 'g2' });
t('دو ذخیره در یک ماه → یک رکورد', Object.keys(getState().monthly).length === 1);

console.log('— جعبه‌ابزار و تثبیت');
dispatch('SET_TOOL_CHECK', { key: 'pre0', checked: true });
dispatch('SET_EMERGENCY_RESULT', 'فعلاً شرایط توقف ندارم.');
s = getState();
t('تیک چک‌لیست ماندگار شد', s.toolkit.checks.pre0 === true);
t('نتیجه توقف اضطراری ذخیره شد', s.toolkit.emergencyResult.includes('ندارم'));
dispatch('SET_CONTRACT_CHECK', { index: 3, checked: true });
t('تیک قرارداد ذخیره شد', getState().maintenance.contract.checks[3] === true);
dispatch('SAVE_MAINTENANCE', { day: 1, done: true, focus: 'صبر', note: '' });
t('روز تثبیت ثبت شد', S.maintenanceDone(getState()) === 1);
dispatch('SAVE_EMOTION_LOG', { before: 'ترس', after: 'آرامش', affect: 'بله', how: '', alternative: '', correction: '' });
dispatch('SAVE_EMOTION_LOG', { before: 'طمع', after: 'طمع', affect: 'خیر', how: '', alternative: '', correction: '' });
t('دو یادداشت احساسات ثبت شد', getState().emotionLogs.length === 2);

console.log('— پشتیبان');
const backup = buildBackup(getState());
const round = parseBackup(JSON.stringify(backup));
t('پشتیبان رفت‌وبرگشت سالم است', round.ok === true);
t('داده بازیابی‌شده هم‌ارز است', S.daysDone(round.data) === S.daysDone(getState()));
t('فایل خراب رد می‌شود', parseBackup('{garbage').ok === false);
t('نسخه ناسازگار رد می‌شود', parseBackup('{"schema":1,"days":{},"completed":{}}').ok === false);

console.log('— بازنشانی');
dispatch('RESET');
s = getState();
t('بازنشانی → روزهای تکمیل = ۰', S.daysDone(s) === 0);
t('بازنشانی → یک یادداشت هم نماند', s.emotionLogs.length === 0);

console.log(`\nنتیجه: ${pass} موفق، ${fail} ناموفق`);
process.exit(fail ? 1 : 0);
