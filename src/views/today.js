// ============================================================================
// today.js — نمای «تمرین امروز» (سه شاخه: فصل ۱، ۲، ۳ + پایان روز)
// رویدادهای این نمای خاص (تکمیل، ذخیره، تایمر) همین‌جا ثبت می‌شوند؛
// رویدادهای عمومی (quiz/rate/check/ref) در main.js با delegation مدیریت می‌شوند.
// ============================================================================

import { fmt, esc } from '../core/utils.js';
import { getState, persistNow } from '../core/store.js';
import { dispatch } from '../core/actions.js';
import * as S from '../core/selectors.js';
import { go } from '../core/router.js';
import { onClick } from '../core/dom.js';
import * as timer from '../core/timer.js';
import { ratingGroup } from '../components/rating.js';
import { checkRow } from '../components/checklist.js';
import { toast } from '../components/toast.js';
import { QUESTIONNAIRE, QUIZ_HINT, OBSERVATION_NOTICE, OBSERVATION_CHECKS } from '../content/chapter1.js';
import { CH2_TASKS, DAILY_HABITS, TIMER_RULE_TITLE, TIMER_RULE_TEXT, TIMER_BUTTON_LABEL, TIMER_DONE_MESSAGE } from '../content/chapter2.js';
import { DAILY_CORE, DAILY_CORE_HINT, DAILY_CORE_NOTICE } from '../content/chapter3.js';

export function render(root, params) {
  const s = getState();
  dispatch('START_PROGRAM'); // idempotent — اولین بازدید یعنی شروع برنامه

  // بدون پارامتر → روزِ باز شده فعلی؛ با پارامتر → همان روز (بازبینی)
  const day = params.day != null && params.day !== '' ? clampDay(params.day) : S.unlockedDay(s);
  const unlocked = S.unlockedDay(s);

  if (day > unlocked && !s.completed[day]) {
    root.innerHTML = `<div class="card empty">این روز هنوز باز نشده است.<br><br>
      <a class="btn secondary" href="#/path">بازگشت به مسیر</a></div>`;
    return;
  }

  const d = S.dayObj(day);
  const rec = S.dayRecord(s, day);
  const done = !!s.completed[day];

  let html = `<div data-day="${day}">`;

  // ---------- سربرگ روز ----------
  html += `
  <div class="card" style="margin-bottom:16px">
    <div class="section-head" style="margin:0">
      <div>
        <span class="tag">فصل ${fmt(d.chapter)} · روز ${fmt(day)} ${done ? '· تکمیل‌شده' : ''}</span>
        <h2 style="margin:8px 0 0;font-size:20px">${esc(d.title)}</h2>
        <p>${esc(d.desc)}</p>
      </div>
      <a class="btn ghost small" href="#/path">همه روزها</a>
    </div>
  </div>`;

  if (day <= 3) html += chapter1(rec);
  else if (day <= 10) html += chapter2(day, rec);
  else html += chapter3(rec);

  // ---------- پایان روز ----------
  const nextVisible = day < 40 && day < unlocked;
  html += `
  <div class="card" style="margin-top:16px">
    <div class="section-head" style="margin:0">
      <div>
        <h3 style="font-size:14px;margin:0">پایان تمرین روز ${fmt(day)}</h3>
        <p>برای تکمیل روز، حداقل یک اقدام تمرینی را علامت بزن؛ روز بعد سپس باز می‌شود.</p>
      </div>
      <span class="tag">${done ? 'ثبت شده' : 'در انتظار تکمیل'}</span>
    </div>
    <div class="field">
      <label>یادداشت تکمیلی / سه نکته بهبود</label>
      <textarea data-ref="notes" placeholder="۱. ...&#10;۲. ...&#10;۳. ...">${esc(rec.reflection.notes || '')}</textarea>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn primary" data-action="complete-day" data-day="${day}">${done ? 'ذخیره تغییرات روز' : 'تکمیل روز و باز کردن روز بعد'}</button>
      <button class="btn ghost" data-action="save-day">ذخیره موقت</button>
      ${day > 1 ? `<a class="btn ghost" href="#/day/${day - 1}">روز قبل</a>` : ''}
      ${nextVisible ? `<a class="btn ghost" href="#/day/${day + 1}">روز بعد</a>` : ''}
    </div>
  </div>`;

  html += '</div>';
  root.innerHTML = html;
}

// ---------------------------------------------------------------------------
// فصل ۱ (روزهای ۱ تا ۳): آزمون خودارزیابی + تمرین مشاهده
// ---------------------------------------------------------------------------
function chapter1(rec) {
  let quiz = '';
  QUESTIONNAIRE.forEach((q, i) => {
    quiz += `
    <div class="field">
      <label>${fmt(i + 1)}. ${q}</label>
      ${ratingGroup({ kind: 'quiz', field: String(i), value: rec.quiz[i], max: 5, label: `سؤال ${i + 1} — امتیاز ۰ تا ۵` })}
    </div>`;
  });

  return `
  <div class="two-col">
    <section class="card">
      <h3 style="margin:0;font-size:14px">آزمون خودارزیابی</h3>
      <p class="small-text muted">${QUIZ_HINT}</p>
      ${quiz}
      <div class="field"><label>احساس غالب امروز</label><input data-ref="emotion" value="${esc(rec.reflection.emotion || '')}" placeholder="مثلاً عجله، ترس، آرامش یا FOMO"></div>
      <div class="field"><label>فکر غالب</label><textarea data-ref="thought" placeholder="قبل از تصمیم چه فکری تکرار می‌شد؟">${esc(rec.reflection.thought || '')}</textarea></div>
      <div class="field"><label>شدت احساس (از ۵- تا ۵+)</label><input type="number" min="-5" max="5" data-ref="intensity" value="${esc(rec.reflection.intensity ?? '')}" placeholder="مثلاً ۳-"></div>
      <div class="field"><label>اگر طبق برنامه عمل نکردم، چرا؟</label><textarea data-ref="reason">${esc(rec.reflection.reason || '')}</textarea></div>
    </section>
    <section class="card">
      <h3 style="margin:0;font-size:14px">تمرین مشاهده</h3>
      <div class="notice" style="margin:12px 0">${OBSERVATION_NOTICE}</div>
      ${OBSERVATION_CHECKS.map((c) => checkRow({ scope: 'day', key: c.key, label: c.label, checked: !!rec.checks[c.key] })).join('')}
      ${followedField(rec)}
      <div class="field"><label>چه چیزی باعث وسوسه شد؟</label><textarea data-ref="trigger">${esc(rec.reflection.trigger || '')}</textarea></div>
    </section>
  </div>`;
}

// ---------------------------------------------------------------------------
// فصل ۲ (روزهای ۴ تا ۱۰): تمرین اصلی + عادت‌های روزانه + قانون ۹۰ ثانیه
// ---------------------------------------------------------------------------
function chapter2(day, rec) {
  const task = CH2_TASKS[day - 4] || '';
  return `
  <div class="two-col">
    <section class="card">
      <h3 style="font-size:14px;margin:0">تمرین اصلی روز</h3>
      <div class="notice" style="margin:12px 0">${esc(task)}</div>
      ${checkRow({ scope: 'day', key: 'main', label: task, checked: !!rec.checks.main })}
      <h4 class="mini-title">تمرین‌های روزانه کتاب</h4>
      ${DAILY_HABITS.map((t, i) => checkRow({ scope: 'day', key: 'habit' + i, label: t, checked: !!rec.checks['habit' + i] })).join('')}
    </section>
    <section class="card">
      <h3 style="font-size:14px;margin:0">${TIMER_RULE_TITLE}</h3>
      <p class="small-text muted">${TIMER_RULE_TEXT}</p>
      <div class="timer-row">
        <button class="btn secondary" data-action="timer-start">${TIMER_BUTTON_LABEL}</button>
        <strong id="timerDisplay" class="timer-display">۰۱:۳۰</strong>
      </div>
      <div class="field"><label>امتیاز اراده (۰ تا ۱۰)</label>${ratingGroup({ kind: 'rate', field: 'willpower', value: rec.reflection.willpower, label: 'امتیاز اراده از ۰ تا ۱۰' })}</div>
      <div class="field"><label>امتیاز صبر (۰ تا ۱۰)</label>${ratingGroup({ kind: 'rate', field: 'patience', value: rec.reflection.patience, label: 'امتیاز صبر از ۰ تا ۱۰' })}</div>
      <div class="field"><label>چند بار وسوسه شدم؟</label><input type="number" min="0" data-ref="temptations" value="${esc(rec.reflection.temptations ?? '')}" placeholder="تعداد"></div>
      <div class="field"><label>چند بار مقاومت کردم؟</label><input type="number" min="0" data-ref="resisted" value="${esc(rec.reflection.resisted ?? '')}" placeholder="تعداد"></div>
      <div class="field"><label>مهم‌ترین درس امروز</label><textarea data-ref="lesson">${esc(rec.reflection.lesson || '')}</textarea></div>
    </section>
  </div>`;
}

// ---------------------------------------------------------------------------
// فصل ۳ (روزهای ۱۱ تا ۴۰): روتین روزانه + خودمربیگری
// ---------------------------------------------------------------------------
function chapter3(rec) {
  let routine = '';
  DAILY_CORE.forEach((g, gi) => {
    routine += `<h4 class="mini-title">${g.group}</h4>`;
    routine += g.items.map((t, i) => checkRow({ scope: 'day', key: `c${gi}_${i}`, label: t, checked: !!rec.checks[`c${gi}_${i}`] })).join('');
  });

  return `
  <div class="two-col">
    <section class="card">
      <h3 style="font-size:14px;margin:0">روال روزانه</h3>
      <p class="small-text muted">${DAILY_CORE_HINT}</p>
      ${routine}
      <div class="notice" style="margin-top:12px">${DAILY_CORE_NOTICE}</div>
    </section>
    <section class="card">
      <h3 style="font-size:14px;margin:0">خودمربیگری روزانه</h3>
      ${followedField(rec)}
      <div class="field"><label>چه چیزی باعث وسوسه شد؟</label><textarea data-ref="trigger">${esc(rec.reflection.trigger || '')}</textarea></div>
      <div class="field"><label>فردا چه رفتاری را بهتر انجام می‌دهم؟</label><textarea data-ref="improve">${esc(rec.reflection.improve || '')}</textarea></div>
      <div class="field"><label>احساس غالب امروز</label><input data-ref="emotion" value="${esc(rec.reflection.emotion || '')}" placeholder="مثلاً آرامش، عجله، خشم، ترس"></div>
      <div class="field"><label>مهم‌ترین درس امروز</label><textarea data-ref="lesson">${esc(rec.reflection.lesson || '')}</textarea></div>
      <div class="field"><label>امتیاز صبر (۰ تا ۱۰)</label>${ratingGroup({ kind: 'rate', field: 'patience', value: rec.reflection.patience, label: 'امتیاز صبر از ۰ تا ۱۰' })}</div>
      <div class="field"><label>امتیاز اراده (۰ تا ۱۰)</label>${ratingGroup({ kind: 'rate', field: 'willpower', value: rec.reflection.willpower, label: 'امتیاز اراده از ۰ تا ۱۰' })}</div>
      <div class="field"><label>پایبندی به استراتژی (۰ تا ۱۰)</label>${ratingGroup({ kind: 'rate', field: 'adherence', value: rec.reflection.adherence, label: 'پایبندی به استراتژی از ۰ تا ۱۰' })}</div>
    </section>
  </div>`;
}

/** فیلد «آیا امروز طبق برنامه عمل کردم؟» مشترک فصل ۱ و ۳ */
function followedField(rec) {
  const v = rec.reflection.followed || '';
  return `<div class="field">
    <label>آیا امروز طبق برنامه عمل کردم؟</label>
    <select data-ref="followed">
      <option value="">انتخاب کن</option>
      <option value="yes" ${v === 'yes' ? 'selected' : ''}>بله</option>
      <option value="no" ${v === 'no' ? 'selected' : ''}>خیر</option>
      <option value="partial" ${v === 'partial' ? 'selected' : ''}>تا حدی</option>
    </select>
  </div>`;
}

function clampDay(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.max(1, Math.min(40, Math.round(n)));
}

// ---------------------------------------------------------------------------
// رویدادهای خاص این نما (یک بار در بارگذاری ماژول ثبت می‌شوند)
// ---------------------------------------------------------------------------
function dayOf(el) {
  return Number(el.closest('[data-day]').dataset.day);
}

onClick('[data-action="complete-day"]', (btn) => {
  const day = dayOf(btn);
  const res = dispatch('COMPLETE_DAY', { day });
  if (!res || !res.ok) {
    if (res && res.message) toast(res.message);
    return;
  }
  toast(res.message);
  if (day < 40) go(`#/day/${day + 1}`);
  else go('#/toolkit/maintenance');
});

onClick('[data-action="save-day"]', () => {
  persistNow();
  toast('اطلاعات این روز ذخیره شد.');
});

onClick('[data-action="timer-start"]', () => {
  const el = document.getElementById('timerDisplay');
  if (!el) return;
  timer.start(90, {
    onTick: (r) => {
      el.textContent = fmt(Math.floor(r / 60)).padStart(2, '۰') + ':' + fmt(r % 60).padStart(2, '۰');
    },
    onEnd: () => toast(TIMER_DONE_MESSAGE),
  });
});
