// ============================================================================
// path.js — نمای «مسیر ۴۰ روزه»
// ============================================================================

import { fmt } from '../core/utils.js';
import { getState } from '../core/store.js';
import * as S from '../core/selectors.js';
import { CHAPTERS } from '../content/meta.js';
import { dayTile } from '../components/day-tile.js';

export function render(root) {
  const s = getState();
  const done = S.daysDone(s);
  const unlocked = S.unlockedDay(s);

  let html = `
    <div class="card" style="margin-bottom:16px">
      <div class="section-head" style="margin:0">
        <div>
          <h2>برنامه ۴۰ روزه</h2>
          <p>روزها به ترتیب باز می‌شوند؛ روزهای انجام‌نشده از بین نمی‌روند.</p>
        </div>
        <span class="tag">${fmt(done)} / ۴۰ تکمیل</span>
      </div>
      <div class="bar"><span style="width:${S.completionPct(s)}%"></span></div>
    </div>`;

  for (const ch of CHAPTERS) {
    html += `<div class="section-head">
      <div><h2>${ch.title}</h2><p>روزهای ${fmt(ch.from)} تا ${fmt(ch.to)}</p></div>
    </div><div class="day-grid">`;
    for (let i = ch.from; i <= ch.to; i++) {
      html += dayTile(S.dayObj(i), {
        done: !!s.completed[i],
        current: i === unlocked,
        locked: i > unlocked,
      });
    }
    html += '</div>';
  }

  html += `<div class="notice" style="margin-top:18px">
    تکمیل هر روز به معنی ثبت یک قدم رفتاری است، نه ثبت یا ارزیابی سود و زیان.
    روزهای قفل‌شده پس از تکمیل روز فعلی باز می‌شوند.
  </div>`;

  root.innerHTML = html;
}
