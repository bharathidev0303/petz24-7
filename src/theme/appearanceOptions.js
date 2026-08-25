import { normalizeHexColor, isLightColor, lightenHex } from '../utils/colorUtils';
import { getAccentPreset } from './accentPresets';

export const BUTTON_SHAPES = {
  sharp: { id: 'sharp', label: 'Sharp', radius: 6 },
  rounded: { id: 'rounded', label: 'Rounded', radius: 12 },
  pill: { id: 'pill', label: 'Pill', radius: 999 },
};

export const FONT_SCALE_OPTIONS = {
  small: { id: 'small', label: 'Small', scale: 0.92 },
  medium: { id: 'medium', label: 'Default', scale: 1 },
  large: { id: 'large', label: 'Large', scale: 1.1 },
};

export const HOME_HEADER_STYLES = {
  warm: { id: 'warm', label: 'Warm' },
  accent: { id: 'accent', label: 'Accent tint' },
  minimal: { id: 'minimal', label: 'Minimal' },
};

/** Button colors independent of accent preset */
export const BUTTON_COLOR_PRESETS = [
  { id: 'default', label: 'From accent', color: null },
  { id: 'match-primary', label: 'Match primary', color: null },
  { id: 'navy', label: 'Navy', color: '#06294F' },
  { id: 'charcoal', label: 'Charcoal', color: '#2D3436' },
  { id: 'black', label: 'Black', color: '#1A1A1A' },
  { id: 'forest', label: 'Forest', color: '#006266' },
  { id: 'custom', label: 'Custom', color: null },
];

export const BUTTON_TEXT_COLOR_PRESETS = [
  { id: 'auto', label: 'Auto contrast', color: null },
  { id: 'white', label: 'White', color: '#FFFFFF' },
  { id: 'black', label: 'Black', color: '#1A1A1A' },
  { id: 'custom', label: 'Custom', color: null },
];

export const DEFAULT_BUTTON_SHAPE = 'rounded';
export const DEFAULT_FONT_SCALE = 'medium';
export const DEFAULT_HOME_HEADER_STYLE = 'warm';
export const DEFAULT_BUTTON_COLOR_ID = 'default';
export const DEFAULT_BACKGROUND_COLOR_ID = 'default';
export const DEFAULT_CUSTOM_BACKGROUND = '#FFFFFF';
export const DEFAULT_CUSTOM_ACCENT = '#AB041F';
export const DEFAULT_CUSTOM_BUTTON = '#06294F';
export const DEFAULT_BUTTON_TEXT_COLOR_ID = 'auto';
export const DEFAULT_CUSTOM_BUTTON_TEXT = '#FFFFFF';

export const BACKGROUND_COLOR_PRESETS = [
  { id: 'default', label: 'Theme default', color: null },
  { id: 'white', label: 'White', color: '#FFFFFF' },
  { id: 'soft-gray', label: 'Soft gray', color: '#F5F7FA' },
  { id: 'cream', label: 'Cream', color: '#FFF8F0' },
  { id: 'mint', label: 'Mint', color: '#F0FAF5' },
  { id: 'sky', label: 'Sky', color: '#F0F7FF' },
  { id: 'lavender', label: 'Lavender', color: '#F5F0FF' },
  { id: 'custom', label: 'Custom', color: null },
];

export const getBackgroundPreset = id =>
  BACKGROUND_COLOR_PRESETS.find(item => item.id === id) ?? BACKGROUND_COLOR_PRESETS[0];

export const resolveBackgroundColors = (backgroundColorId, customBackgroundColor, baseColors) => {
  if (backgroundColorId === 'default') {
    return {
      background: baseColors.background,
      homeBody: baseColors.homeBody,
    };
  }

  if (backgroundColorId === 'custom') {
    const custom = normalizeHexColor(customBackgroundColor) ?? baseColors.background;
    return {
      background: custom,
      homeBody: custom,
    };
  }

  const preset = getBackgroundPreset(backgroundColorId);
  const color = preset.color ?? baseColors.background;
  return {
    background: color,
    homeBody: color,
  };
};

export const getButtonShape = id =>
  Object.values(BUTTON_SHAPES).find(shape => shape.id === id) ?? BUTTON_SHAPES.rounded;

export const getFontScale = id =>
  FONT_SCALE_OPTIONS[id] ?? FONT_SCALE_OPTIONS.medium;

export const resolveAccent = (accentId, customAccentColor, fallbackAccent) => {
  if (accentId === 'custom') {
    const primary = normalizeHexColor(customAccentColor) ?? fallbackAccent.primary;
    return {
      primary,
      primaryLight: lightenHex(primary, 12),
      button: fallbackAccent.button,
    };
  }

  return getAccentPreset(accentId);
};

export const resolveButtonColor = (buttonColorId, customButtonColor, accent, baseColors) => {
  if (buttonColorId === 'custom') {
    return normalizeHexColor(customButtonColor) ?? accent.button ?? baseColors.button;
  }

  if (buttonColorId === 'match-primary') {
    return accent.primary;
  }

  const preset = BUTTON_COLOR_PRESETS.find(item => item.id === buttonColorId);
  if (preset?.color) {
    return preset.color;
  }

  return accent.button ?? baseColors.button;
};

export const resolveButtonTextColor = (
  buttonTextColorId,
  customButtonTextColor,
  buttonBackground,
) => {
  if (buttonTextColorId === 'custom') {
    return normalizeHexColor(customButtonTextColor) ?? '#FFFFFF';
  }

  const preset = BUTTON_TEXT_COLOR_PRESETS.find(item => item.id === buttonTextColorId);
  if (preset?.color) {
    return preset.color;
  }

  return isLightColor(buttonBackground) ? '#1A1A1A' : '#FFFFFF';
};

export const resolveHomeHeader = (homeHeaderStyle, accent, baseColors, isDark) => {
  if (homeHeaderStyle === 'minimal') {
    return baseColors.homeBody;
  }

  if (homeHeaderStyle === 'accent') {
    if (isDark) {
      return `${accent.primary}22`;
    }
    return `${accent.primary}14`;
  }

  return baseColors.homeHeader;
};
