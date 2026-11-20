// ============================================================================
// toolkit/maintenance.js — برنامه تثبیت ۹۰ روزه (پس از روز چهلم)
// ============================================================================

import { fmt, esc } from '../../core/utils.js';
import { getState } from '../../core/store.js';
import { dispatch } from '../../core/actions.js';
import { onClick } from '../../core/dom.js';
import { renderRoute } from '../../core/router.js';
import { toast } from '../../components/toast.js';
import * as S from '../../core/selectors.js';
import {
  MAINTENANCE_PHASES, MAINTENANCE_HINT, MAINTENANCE_CHECK_LABEL, MAINTENANCE_FOCUS_PLACEHOLDER,
  nextMaintenanceDay, phaseOfDay,
} from '../../content/reviews.js';

export function render() {
  const s = getState();
  const days = s.maintenance.days;
  const done = S.maintenanceDone(s);
  const next = nextMaintenanceDay(days);
  const phase = phaseOfDay(next);
  const record = days[next] || {};

  const stages = MAINTENANCE_PHASES.map(
    (p) => `<div class="stage">
      <div class="num">روزهای ${fmt(p.from)} تا ${fmt(p.to)}</div>
      <strong>${p.title}</strong>
      <small>${p.short}</small>
    </div>`,
  ).join('');

  return `
  <div class="card">
    <div class="section-head" style="margin:0">
      <div><h2>برنامه تثبیت ۹۰ روزه</h2><p>${MAINTENANCE_HINT}</p></div>
      <span class="tag">${fmt(done)} / ۹۰ روز</span>
    </div>
    <div class="bar"><span style="width:${(done / 90) * 100}%"></span></div>
    <div class="stages" style="margin-top:15px">${stages}</div>
  </div>
  <div class="card" style="margin-top:15px">
    <span class="tag">${phase.title} · روز ${fmt(next)}</span>
    <h3 style="font-size:16px;margin:8px 0">${phase.focus}</h3>
    <label class="check-row ${record.done ? 'done' : ''}">
      <input type="checkbox" id="maintDone" ${record.done ? 'checked' : ''}>
      <span>${MAINTENANCE_CHECK_LABEL}</span>
    </label>
    <div class="field"><label>مهارت کلیدی مورد تمرکز</label><input id="maintFocus" value="${esc(record.focus || '')}" placeholder="${MAINTENANCE_FOCUS_PLACEHOLDER}"></div>
    <div class="field"><label>یادداشت کوتاه (اختیاری)</label><textarea id="maintNote">${esc(record.note || '')}</textarea></div>
    <button class="btn primary" data-action="save-maintenance" data-maintday="${next}">ثبت روز تثبیت</button>
  </div>`;
}

onClick('[data-action="save-maintenance"]', (btn) => {
  const day = Number(btn.dataset.maintday);
  const doneEl = document.getElementById('maintDone');
  const focusEl = document.getElementById('maintFocus');
  const noteEl = document.getElementById('maintNote');
  dispatch('SAVE_MAINTENANCE', {
    day,
    done: doneEl ? doneEl.checked : false,
    focus: focusEl ? focusEl.value : '',
    note: noteEl ? noteEl.value : '',
  });
  toast('روز تثبیت ثبت شد.');
  renderRoute(); // روز بعدی تثبیت نمایش داده شود
});
