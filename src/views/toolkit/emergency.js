// ============================================================================
// toolkit/emergency.js — چک‌لیست توقف اضطراری
// ============================================================================

import { esc } from '../../core/utils.js';
import { getState } from '../../core/store.js';
import { dispatch } from '../../core/actions.js';
import { onChange } from '../../core/dom.js';
import { checkRow } from '../../components/checklist.js';
import {
  EMERGENCY_ITEMS, EMERGENCY_HINT, EMERGENCY_DISCLAIMER, EMERGENCY_RESULT_OPTIONS,
} from '../../content/emotions.js';

export function render() {
  const s = getState();
  const rows = EMERGENCY_ITEMS.map((x, i) =>
    checkRow({ scope: 'tool', key: 'em' + i, label: x, checked: !!s.toolkit.checks['em' + i] })).join('');

  const opts = ['<option value="">انتخاب کن</option>']
    .concat(EMERGENCY_RESULT_OPTIONS.map((o) => `<option ${s.toolkit.emergencyResult === o ? 'selected' : ''}>${o}</option>`))
    .join('');

  return `
  <div class="card">
    <h3 style="font-size:16px;margin:0">چک‌لیست توقف اضطراری</h3>
    <p class="small-text muted">${EMERGENCY_HINT}</p>
    <div class="danger-box" style="margin:12px 0">${EMERGENCY_DISCLAIMER}</div>
    ${rows}
    <div class="field">
      <label>نتیجه بررسی</label>
      <select id="emergencyResult">${opts}</select>
    </div>
  </div>`;
}

// نتیجه بررسی بلافاصله ذخیره می‌شود
onChange('#emergencyResult', (el) => {
  dispatch('SET_EMERGENCY_RESULT', el.value);
});
