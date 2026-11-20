// ============================================================================
// charts.js — نمودارهای SVG بدون هیچ وابستگی
// جهت RTL رعایت شده: روز ۱ سمت راست، روز ۴۰ سمت چپ.
// رنگ‌ها از CSS custom properties می‌آیند (var(--chart-*)) تا هماهنگ بمانند.
// ============================================================================

import { fmt } from './core/utils.js';

/** موقعیت X نقطه i از n نقطه در محور RTL (راست = ابتدای برنامه) */
function xRTL(i, n, left, right) {
  const span = right - left;
  if (n <= 1) return right;
  return right - (i / (n - 1)) * span;
}

/**
 * نمودار خطی چندسری.
 * @param {object} opts
 * @param {Array<{name:string,color:string,points:Array<number|null>}>} opts.series
 * @param {number} opts.yMax
 * @param {number} opts.width
 * @param {number} opts.height
 * @param {boolean} opts.compact حالت کوچک داشبورد (بدون برچسب محور)
 */
export function lineChart({ series, yMax = 10, width = 560, height = 220, compact = false }) {
  const n = series.length ? series[0].points.length : 0;
  if (!n) return '';

  const padTop = compact ? 8 : 14;
  const padBottom = compact ? 8 : 26;
  const padLeft = compact ? 6 : 14;
  // در RTL برچسب محور y سمت راست است
  const padRight = compact ? 6 : 44;
  const left = padLeft;
  const right = width - padRight;
  const top = padTop;
  const bottom = height - padBottom;
  const yOf = (v) => bottom - (v / yMax) * (bottom - top);

  const parts = [];
  parts.push(`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="نمودار روند امتیازها">`);

  // خطوط شبکه و برچسب محور y
  const ticks = compact ? [0, yMax / 2, yMax] : [0, 2, 4, 6, 8, 10];
  for (const t of ticks) {
    const y = yOf(t);
    parts.push(`<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="var(--chart-grid)" stroke-width="1"/>`);
    if (!compact) {
      parts.push(`<text x="${right + 8}" y="${y + 4}" font-size="10" fill="var(--muted)">${fmt(t)}</text>`);
    }
  }

  // برچسب محور x
  if (!compact) {
    parts.push(`<text x="${right}" y="${height - 6}" font-size="10" fill="var(--muted)" text-anchor="end">روز ۱</text>`);
    parts.push(`<text x="${(left + right) / 2}" y="${height - 6}" font-size="10" fill="var(--muted)" text-anchor="middle">روز ${fmt(Math.round(n / 2))}</text>`);
    parts.push(`<text x="${left}" y="${height - 6}" font-size="10" fill="var(--muted)" text-anchor="start">روز ${fmt(n)}</text>`);
  }

  // سری‌ها: شکست در نقاط null یعنی قطع خط
  for (const s of series) {
    let run = [];
    const flush = () => {
      if (run.length > 1) {
        parts.push(`<polyline points="${run.map((p) => `${p.x},${p.y}`).join(' ')}"
          fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`);
      }
      for (const p of run) {
        parts.push(`<circle cx="${p.x}" cy="${p.y}" r="2.6" fill="${s.color}"><title>روز ${p.day}: ${fmt(p.v)} از ${fmt(yMax)}</title></circle>`);
      }
      run = [];
    };
    s.points.forEach((v, i) => {
      if (v === null || v === undefined) { flush(); return; }
      run.push({ x: xRTL(i, n, left, right).toFixed(1), y: yOf(v).toFixed(1), day: i + 1, v });
    });
    flush();
  }

  parts.push('</svg>');
  return parts.join('');
}

/**
 * نمودار میله‌ای (پایبندی روزانه ۴۰ روز).
 * @param {Array<{day:number, value:number|null, completed:boolean}>} opts.values
 */
export function barChart({ values, yMax = 10, width = 560, height = 150 }) {
  const n = values.length;
  if (!n) return '';
  const padBottom = 18;
  const padTop = 8;
  const bottom = height - padBottom;
  const slot = width / n;
  const barW = Math.max(3, slot * 0.62);

  const parts = [];
  parts.push(`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="نمودار میله‌ای پایبندی روزانه">`);
  parts.push(`<line x1="0" y1="${bottom}" x2="${width}" y2="${bottom}" stroke="var(--chart-grid)" stroke-width="1"/>`);

  values.forEach((d, i) => {
    // RTL: اولین روز سمت راست
    const cx = width - (i + 0.5) * slot;
    const x = cx - barW / 2;
    const has = d.value !== null && d.value !== undefined;
    const h = has ? Math.max(4, (d.value / yMax) * (bottom - padTop)) : 4;
    const fill = has ? (d.completed ? 'var(--green)' : 'var(--amber)') : 'var(--chart-off)';
    const label = has ? `روز ${fmt(d.day)}: پایبندی ${fmt(d.value)} از ${fmt(yMax)}` : `روز ${fmt(d.day)}: بدون امتیاز`;
    parts.push(`<rect x="${x.toFixed(1)}" y="${(bottom - h).toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}"
      rx="2" fill="${fill}"><title>${label}</title></rect>`);
  });

  parts.push(`<text x="${width}" y="${height - 4}" font-size="10" fill="var(--muted)" text-anchor="end">روز ۱</text>`);
  parts.push(`<text x="0" y="${height - 4}" font-size="10" fill="var(--muted)" text-anchor="start">روز ${fmt(n)}</text>`);
  parts.push('</svg>');
  return parts.join('');
}

/** راهنمای رنگ سری‌ها */
export function chartLegend(items) {
  return `<div class="chart-legend">${items
    .map((i) => `<span><i style="background:${i.color}"></i>${i.name}</span>`)
    .join('')}</div>`;
}
