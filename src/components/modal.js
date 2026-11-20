// ============================================================================
// modal.js — مودال تایید عمومی (پس‌زمینه، Escape، مدیریت فوکوس)
// در v1 فقط reset مودال داشت و import بدون تایید جایگزین می‌شد؛
// اینجا هر عملیات مخرب/جایگزین‌کننده از همین مودال تایید می‌گیرد.
// ============================================================================

import { esc } from '../core/utils.js';

/**
 * نمایش مودال تایید.
 * @param {{title:string, body:string, confirmLabel?:string, cancelLabel?:string,
 *          danger?:boolean, onConfirm:()=>void}} opts
 */
export function confirmModal({ title, body, confirmLabel = 'تایید', cancelLabel = 'انصراف', danger = false, onConfirm }) {
  const root = document.getElementById('modalRoot');
  root.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <h3>${esc(title)}</h3>
        <p>${esc(body)}</p>
        <div class="modal-actions">
          <button class="btn ${danger ? 'danger' : 'primary'}" data-modal-confirm>${esc(confirmLabel)}</button>
          <button class="btn ghost" data-modal-cancel>${esc(cancelLabel)}</button>
        </div>
      </div>
    </div>`;

  const close = () => {
    root.innerHTML = '';
    document.removeEventListener('keydown', onKey);
  };

  const onKey = (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter' && document.activeElement !== confirmBtn) { /* پیش‌فرض دکمه فوکوس‌شده بماند */ }
  };

  const confirmBtn = root.querySelector('[data-modal-confirm]');
  const cancelBtn = root.querySelector('[data-modal-cancel]');

  confirmBtn.addEventListener('click', () => { close(); onConfirm(); });
  cancelBtn.addEventListener('click', close);
  root.querySelector('.modal-backdrop').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) close();
  });
  document.addEventListener('keydown', onKey);
  confirmBtn.focus();
}
