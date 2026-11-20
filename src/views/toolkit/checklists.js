// ============================================================================
// toolkit/checklists.js — چک‌لیست‌های قبل از ورود / حین معامله / خروج
// تیک‌ها در state.toolkit.checks ذخیره می‌شوند و برخلاف v1 با رفرش پاک نمی‌شوند.
// ============================================================================

import { getState } from '../../core/store.js';
import { dispatch } from '../../core/actions.js';
import { onClick } from '../../core/dom.js';
import { renderRoute } from '../../core/router.js';
import { checkRow } from '../../components/checklist.js';
import { PRECHECK, DURINGCHECK, EXITCHECK, PRECHECK_HINT } from '../../content/checklists.js';

export function render() {
  const checks = getState().toolkit.checks;
  const rows = (arr, prefix) =>
    arr.map((x, i) => checkRow({ scope: 'tool', key: prefix + i, label: x, checked: !!checks[prefix + i] })).join('');

  return `
  <div class="two-col">
    <div class="card">
      <h3 style="font-size:14px;margin:0">چک‌لیست قبل از ورود</h3>
      <p class="small-text muted">${PRECHECK_HINT}</p>
      ${rows(PRECHECK, 'pre')}
    </div>
    <div class="card">
      <h3 style="font-size:14px;margin:0">چک‌لیست هنگام معامله</h3>
      ${rows(DURINGCHECK, 'during')}
      <hr class="divider">
      <h3 style="font-size:14px;margin:0">چک‌لیست خروج</h3>
      ${rows(EXITCHECK, 'exit')}
      <button class="btn ghost small" data-action="clear-tool-checks">پاک‌کردن تیک‌ها</button>
    </div>
  </div>`;
}

onClick('[data-action="clear-tool-checks"]', () => {
  dispatch('CLEAR_TOOL_CHECKS');
  renderRoute();
});
