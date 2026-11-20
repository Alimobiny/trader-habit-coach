// ============================================================================
// day-tile.js — کاشی یک روز در مسیر ۴۰ روزه (لینک واقعی به #/day/N)
// ============================================================================

import { fmt, esc } from '../core/utils.js';

/**
 * @param {object} d      خروجی selectors.dayObj
 * @param {object} opts   { done, current, locked }
 */
export function dayTile(d, { done, current, locked }) {
  const cls = [
    'day-tile',
    done ? 'done' : '',
    current && !done ? 'current' : '',
    locked ? 'locked' : '',
  ].filter(Boolean).join(' ');

  const status = done ? '✓' : locked ? '🔒' : current ? '●' : '';
  const inner = `
    <span class="status" aria-hidden="true">${status}</span>
    <b>روز ${fmt(d.day)}</b>
    <strong>${esc(d.title)}</strong>`;

  // روز قفل دکمهٔ غیرفعال است؛ روز باز لینک به مسیر همان روز
  if (locked) return `<button class="${cls}" disabled>${inner}</button>`;
  return `<a class="${cls}" href="#/day/${d.day}">${inner}</a>`;
}
