// ============================================================================
// toolkit/index.js — ظرف تب‌های جعبه‌ابزار رفتاری
// تب از مسیر می‌آید: #/toolkit/emotions و #/toolkit/checklists و ...
// ============================================================================

import { fmt } from '../../core/utils.js';
import { getState } from '../../core/store.js';
import * as S from '../../core/selectors.js';
import * as emotionsTab from './emotions.js';
import * as checklistsTab from './checklists.js';
import * as emergencyTab from './emergency.js';
import * as reviewsTab from './reviews.js';
import * as contractTab from './contract.js';
import * as maintenanceTab from './maintenance.js';

const TABS = [
  { id: 'emotions', label: 'شناخت احساسات', module: emotionsTab },
  { id: 'checklists', label: 'چک‌لیست‌ها', module: checklistsTab },
  { id: 'emergency', label: 'توقف اضطراری', module: emergencyTab },
  { id: 'reviews', label: 'مرور هفتگی و ماهانه', module: reviewsTab },
  { id: 'contract', label: 'قرارداد تعهد', module: contractTab },
  { id: 'maintenance', label: 'تثبیت ۹۰ روزه', module: maintenanceTab, lockedUntil40: true },
];

export function render(root, params) {
  const s = getState();
  const finished = S.daysDone(s) >= 40;
  const tab = TABS.some((t) => t.id === params.tab) ? params.tab : 'emotions';

  const pills = TABS.map((t) => {
    const locked = t.lockedUntil40 && !finished;
    if (locked) {
      return `<span class="pill" disabled title="پس از تکمیل روز چهلم فعال می‌شود">${t.label} 🔒</span>`;
    }
    return `<a class="pill ${t.id === tab ? 'active' : ''}" href="#/toolkit/${t.id}">${t.label}</a>`;
  }).join('');

  const activeTab = TABS.find((t) => t.id === tab);
  const content =
    activeTab.lockedUntil40 && !finished
      ? `<div class="card empty">برنامه تثبیت ۹۰ روزه پس از تکمیل روز چهلم دوره اصلی باز می‌شود.<br><br>
         <a class="btn secondary" href="#/path">مشاهده مسیر ۴۰ روزه (${fmt(S.daysDone(s))} از ۴۰)</a></div>`
      : activeTab.module.render();

  root.innerHTML = `<div class="subnav">${pills}</div>${content}`;
}
