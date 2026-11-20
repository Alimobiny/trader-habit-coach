#!/usr/bin/env python3
# ============================================================================
# make_icons.py — تولید آیکون‌های PWA بدون هیچ وابستگی (PNG خالص پایتون)
# طرح: گرادیان سرمه‌ای→فیروزه‌ای با سه کندل (صعودی/نزولی/صعودی)
# رندر در مقیاس ۴ برابر و سپس downsample برای لبه‌های نرم.
# اجرا:  python scripts/make_icons.py
# خروجی: icons/icon-192.png، icons/icon-512.png، icons/maskable-512.png
# ============================================================================
import struct
import sys
import zlib
from pathlib import Path

# کنسول ویندوز به‌طور پیش‌فرض cp1256 است؛ برای پیام‌های فارسی
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

OUT = Path(__file__).resolve().parent.parent / "icons"
SCALE = 4  # مضرب سوپرسمپل

# رنگ‌ها (هماهنگ با tokens.css)
NAVY = (16, 29, 49)      # #101d31
TEAL = (35, 124, 145)    # #237c91
GREEN = (46, 204, 154)   # کندل صعودی
RED = (255, 122, 133)    # کندل نزولی
WHITE = (240, 248, 255)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def render(size, radius_frac, content_frac):
    """رندر آیکون در ابعاد size×size (RGBA، لیست تخت)."""
    s = size * SCALE
    r = int(s * radius_frac)
    # ناحیه محتوا (کندل‌ها)
    cw = s * content_frac
    L, R = (s - cw) / 2, (s + cw) / 2
    T, B = (s - cw) / 2, (s + cw) / 2
    H = B - T
    W = R - L

    # هندسه سه کندل: (مرکز x، بالای بدنه، پایین بدنه، بالای سایه، پایین سایه، رنگ)
    seg = W / 3
    body_w = seg * 0.42
    candles = [
        (L + 0.5 * seg, B - 0.56 * H, B - 0.12 * H, GREEN),
        (L + 1.5 * seg, B - 0.38 * H, B - 0.06 * H, RED),
        (L + 2.5 * seg, B - 0.72 * H, B - 0.10 * H, GREEN),
    ]
    wick_ext = 0.07 * H
    wick_w = max(2.0, body_w * 0.16)

    px = bytearray(s * s * 4)

    def put(idx, rgb, a=255):
        base = idx * 4
        # ترکیب ساده روی پس‌زمینه (پس‌زمینه کدر است؛ فقط برای اطمینان)
        if a >= 255:
            px[base:base + 3] = bytes(rgb)
            px[base + 3] = 255
        else:
            old_a = px[base + 3]
            if old_a == 0:
                px[base:base + 4] = bytes(rgb) + bytes([a])
            else:
                t = a / 255
                for c in range(3):
                    px[base + c] = int(px[base + c] * (1 - t) + rgb[c] * t)
                px[base + 3] = max(old_a, a)

    for y in range(s):
        for x in range(s):
            idx = y * s + x
            # گِرد بودن گوشه‌ها
            if r > 0:
                dx = max(r - x, x - (s - 1 - r), 0)
                dy = max(r - y, y - (s - 1 - r), 0)
                if dx * dx + dy * dy > r * r:
                    continue  # شفاف

            # گرادیان مورب سرمه‌ای → فیروزه‌ای
            t = (x + y) / (2 * s)
            put(idx, lerp(NAVY, TEAL, t))

            # سایه‌ها (خط عمودی) و بدنه کندل‌ها
            for (cx, bt, bb, col) in candles:
                if bt - wick_ext <= y <= bb + wick_ext and abs(x - cx) <= wick_w / 2:
                    put(idx, col)
                if bt <= y <= bb and abs(x - cx) <= body_w / 2:
                    put(idx, col)

    return s, px


def downsample(s, px, size):
    """میانگین‌گیری بلوکی SCALE×SCALE → سایز نهایی."""
    out = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            r = g = b = a = 0
            for dy in range(SCALE):
                for dx in range(SCALE):
                    base = ((y * SCALE + dy) * s + (x * SCALE + dx)) * 4
                    r += px[base]; g += px[base + 1]; b += px[base + 2]; a += px[base + 3]
            n = SCALE * SCALE
            o = (y * size + x) * 4
            out[o] = r // n; out[o + 1] = g // n; out[o + 2] = b // n; out[o + 3] = a // n
    return out


def write_png(path, size, rgba):
    """نوشتن PNG بدون وابستگی (RGBA 8bit، فیلتر صفر)."""
    raw = bytearray()
    stride = size * 4
    for y in range(size):
        raw.append(0)  # filter: None
        raw += rgba[y * stride:(y + 1) * stride]

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", ihdr)
           + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
           + chunk(b"IEND", b""))
    path.write_bytes(png)


def build(name, size, radius_frac, content_frac):
    s, px = render(size, radius_frac, content_frac)
    final = downsample(s, px, size)
    OUT.mkdir(parents=True, exist_ok=True)
    p = OUT / name
    write_png(p, size, final)
    print(f"  {p.relative_to(OUT.parent)}  ({size}x{size}, {p.stat().st_size:,} bytes)")


if __name__ == "__main__":
    print("تولید آیکون‌های PWA…")
    build("icon-192.png", 192, radius_frac=0.225, content_frac=0.60)
    build("icon-512.png", 512, radius_frac=0.225, content_frac=0.60)
    # maskable: تمام‌صفحه، محتوا در ناحیه امن مرکزی
    build("maskable-512.png", 512, radius_frac=0.0, content_frac=0.42)
    print("انجام شد.")
