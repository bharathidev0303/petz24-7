const HEX_PATTERN = /^#([0-9A-Fa-f]{6})$/;

export const normalizeHexColor = value => {
  if (!value) return null;
  const trimmed = String(value).trim();
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  if (!HEX_PATTERN.test(withHash)) return null;
  return withHash.toUpperCase();
};

export const hexToHsl = hex => {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return { h: 0, s: 0, l: 100 };

  const raw = normalized.slice(1);
  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      default:
        h = (r - g) / delta + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

export const hslToHex = (h, s, l) => {
  const hue = ((h % 360) + 360) % 360;
  const saturation = Math.max(0, Math.min(100, s)) / 100;
  const lightness = Math.max(0, Math.min(100, l)) / 100;

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - chroma / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (hue < 60) {
    r = chroma;
    g = x;
  } else if (hue < 120) {
    r = x;
    g = chroma;
  } else if (hue < 180) {
    g = chroma;
    b = x;
  } else if (hue < 240) {
    g = x;
    b = chroma;
  } else if (hue < 300) {
    r = x;
    b = chroma;
  } else {
    r = chroma;
    b = x;
  }

  const toHex = value => {
    const channel = Math.round((value + m) * 255)
      .toString(16)
      .padStart(2, '0');
    return channel;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

export const getLuminance = hex => {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return 1;

  const raw = normalized.slice(1);
  const channels = [0, 2, 4].map(start => {
    const channel = parseInt(raw.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

export const isLightColor = hex => getLuminance(hex) > 0.6;

export const lightenHex = (hex, amount = 12) => {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return hex;

  const { h, s, l } = hexToHsl(normalized);
  return hslToHex(h, s, Math.min(100, l + amount));
};

export const getContrastTextColor = (backgroundHex, light = '#FFFFFF', dark = '#1A1A1A') =>
  isLightColor(backgroundHex) ? dark : light;
