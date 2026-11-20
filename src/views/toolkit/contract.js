// ============================================================================
// toolkit/contract.js — قرارداد تعهد معامله‌گر + نمای برنامه ۹۰ روزه
// تیک بندها بلافاصله ذخیره می‌شوند؛ امضا و تاریخ با دکمه ثبت.
// ============================================================================

import { esc } from '../../core/utils.js';
import { getState } from '../../core/store.js';
import { dispatch } from '../../core/actions.js';
import { onClick } from '../../core/dom.js';
import { toast } from '../../components/toast.js';
import { checkRow } from '../../components/checklist.js';
import { CONTRACT_ITEMS, CONTRACT_HINT, MAINTENANCE_PHASES } from '../../content/reviews.js';

export function render() {
  const contract = getState().maintenance.contract;
  const rows = CONTRACT_ITEMS.map(
    (x, i) => checkRow({ scope: 'contract', key: 'c' + i, label: x, checked: !!contract.checks[i] })).join('');

  const plan = MAINTENANCE_PHASES.map(
    (p) => `<div class="stage">
      <div class="num">${p.title}</div>
      <strong>${p.short}</strong>
      <small>روزهای ${p.from} تا ${p.to}</small>
    </div>`,
  ).join('');

  return `
  <div class="card">
    <h3 style="font-size:15px;margin:0">قرارداد تعهد معامله‌گر</h3>
    <p class="small-text muted">${CONTRACT_HINT}</p>
    ${rows}
    <div class="field"><label>نام / امضا (اختیاری)</label><input id="contractSign" value="${esc(contract.sign || '')}"></div>
    <div class="field"><label>تاریخ تعهد</label><input id="contractDate" type="date" value="${esc(contract.date || '')}"></div>
    <button class="btn primary" data-action="save-contract">ثبت قرارداد تعهد</button>
  </div>
  <div class="card" style="margin-top:15px">
    <h3 style="font-size:14px;margin:0">برنامه ۹۰ روزه پس از دوره</h3>
    <div class="stages" style="margin-top:12px">${plan}</div>
  </div>`;
}

onClick('[data-action="save-contract"]', () => {
  const sign = document.getElementById('contractSign');
  const date = document.getElementById('contractDate');
  dispatch('SAVE_CONTRACT', {
    sign: sign ? sign.value : '',
    date: date ? date.value : '',
  });
  toast('قرارداد تعهد ذخیره شد.');
});
