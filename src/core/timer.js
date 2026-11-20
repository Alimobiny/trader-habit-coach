// ============================================================================
// timer.js — تایمر مکث ۹۰ ثانیه (و هر شمارش معکوس دیگر)
// چرخه عمر تایمر مستقل از view است؛ router هنگام تغییر مسیر stop() می‌کند
// تا نشت interval از بین برود (در v1 تایمر صفحه قبل زنده می‌ماند).
// ============================================================================

let interval = null;

/**
 * شروع شمارش معکوس.
 * @param {number} seconds مدت به ثانیه
 * @param {{onTick:(remaining:number)=>void, onEnd:()=>void}} cbs
 */
export function start(seconds, { onTick, onEnd }) {
  stop();
  let remaining = seconds;
  onTick(remaining);
  interval = setInterval(() => {
    remaining--;
    onTick(remaining);
    if (remaining <= 0) {
      stop();
      if (onEnd) onEnd();
    }
  }, 1000);
}

export function stop() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

export function isRunning() {
  return interval !== null;
}
