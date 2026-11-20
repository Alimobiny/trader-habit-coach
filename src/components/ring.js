// ============================================================================
// ring.js — حلقه پیشرفت با conic-gradient (در v1 با چرخش border ساخته می‌شد
// که دقیق نبود و همیشه یک‌ساعت می‌چرخید)
// ============================================================================

import { fmt } from '../core/utils.js';

/**
 * @param {number} pct درصد ۰..۱۰۰
 * @param {string} caption زیرنویس داخل حلقه
 */
export function progressRing(pct, caption = 'پیشرفت کل') {
  return `<div class="progress-ring" style="--ring-pct:${Math.max(0, Math.min(100, pct))}%">
    <div><strong>${fmt(pct)}٪</strong><span>${caption}</span></div>
  </div>`;
}
