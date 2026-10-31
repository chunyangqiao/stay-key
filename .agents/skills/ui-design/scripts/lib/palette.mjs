// Bisect lightness, compensate saturation, and cap hue rotation at 20 degrees.
// The compensation formula is a heuristic.

export function normalizeHex(value, path = 'color') {
  if (typeof value !== 'string' || !/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value)) {
    throw new Error(`${path}: expected #rgb or #rrggbb; other color encodings are unsupported`);
  }
  const hex = value.slice(1).toLowerCase();
  return `#${hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex}`;
}

export function hexToHsl(value) {
  const hex = normalizeHex(value);
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const lightness = (max + min) / 2;
  if (delta === 0) return [0, 0, lightness * 100];
  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  const sector =
    max === r ? (g - b) / delta : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return [(sector * 60 + 360) % 360, saturation * 100, lightness * 100];
}

export function hslToHex(h, s, l) {
  const lightness = l / 100;
  const chroma = ((1 - Math.abs(2 * lightness - 1)) * s) / 100;
  const hue = (((h % 360) + 360) % 360) / 60;
  const x = chroma * (1 - Math.abs((hue % 2) - 1));
  const channels =
    hue < 1
      ? [chroma, x, 0]
      : hue < 2
        ? [x, chroma, 0]
        : hue < 3
          ? [0, chroma, x]
          : hue < 4
            ? [0, x, chroma]
            : hue < 5
              ? [x, 0, chroma]
              : [chroma, 0, x];
  const offset = lightness - chroma / 2;
  return `#${channels
    .map((c) =>
      Math.round((c + offset) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

function signedDelta(from, to) {
  return ((to - from + 540) % 360) - 180;
}

function rotateHue(h, l, target) {
  if (l === target) return h;
  const lighter = target > l;
  const targets = lighter ? [60, 180, 300] : [0, 120, 240];
  const nearest = targets.reduce((best, item) =>
    Math.abs(signedDelta(h, item)) < Math.abs(signedDelta(h, best)) ? item : best,
  );
  const span = lighter ? 100 - l : l;
  if (span === 0) return h;
  const delta = signedDelta(h, nearest) * Math.min(1, Math.abs(target - l) / span);
  return h + Math.max(-20, Math.min(20, delta));
}

export function generatePalette(base, { neutral = false } = {}) {
  const normalized = normalizeHex(base, 'base');
  const [h, s, l] = hexToHsl(normalized);
  // Adapt the ends for very light/dark brands while preserving stop 500.
  const light = Math.max(neutral ? 98 : 96, l + (100 - l) / 2);
  const defaultDark = neutral ? 17 : 21;
  const dark = l > defaultDark ? defaultDark : l / 2;
  const stops = { 100: light, 500: l, 900: dark };
  stops[700] = (stops[900] + stops[500]) / 2;
  stops[300] = (stops[500] + stops[100]) / 2;
  stops[800] = (stops[900] + stops[700]) / 2;
  stops[600] = (stops[700] + stops[500]) / 2;
  stops[400] = (stops[500] + stops[300]) / 2;
  stops[200] = (stops[300] + stops[100]) / 2;
  stops[50] = light + (100 - light) * 0.55;
  stops[950] = dark * 0.55;
  const headroom = (value) => Math.max(1e-6, 1 - Math.abs((2 * value) / 100 - 1));
  return Object.fromEntries(
    Object.entries(stops).map(([stop, target]) => [
      stop,
      Number(stop) === 500
        ? normalized
        : hslToHex(
            rotateHue(h, l, target),
            Math.min(100, s * (headroom(l) / headroom(target)) ** 0.55),
            target,
          ),
    ]),
  );
}

export function relativeLuminance(value) {
  const hex = normalizeHex(value);
  const channels = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function contrastRatio(a, b) {
  const left = relativeLuminance(a);
  const right = relativeLuminance(b);
  return (Math.max(left, right) + 0.05) / (Math.min(left, right) + 0.05);
}
