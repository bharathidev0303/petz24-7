import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';
import { getAccentPreset, DEFAULT_ACCENT_ID } from './accentPresets';
import {
  DEFAULT_BUTTON_COLOR_ID,
  DEFAULT_BUTTON_SHAPE,
  DEFAULT_BUTTON_TEXT_COLOR_ID,
  DEFAULT_BACKGROUND_COLOR_ID,
  DEFAULT_CUSTOM_ACCENT,
  DEFAULT_CUSTOM_BACKGROUND,
  DEFAULT_CUSTOM_BUTTON,
  DEFAULT_CUSTOM_BUTTON_TEXT,
  DEFAULT_FONT_SCALE,
  DEFAULT_HOME_HEADER_STYLE,
  getButtonShape,
  getFontScale,
  resolveAccent,
  resolveBackgroundColors,
  resolveButtonColor,
  resolveButtonTextColor,
  resolveHomeHeader,
} from './appearanceOptions';

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

export const DEFAULT_THEME_PREFERENCES = {
  mode: THEME_MODES.LIGHT,
  accentId: DEFAULT_ACCENT_ID,
  customAccentColor: DEFAULT_CUSTOM_ACCENT,
  buttonColorId: DEFAULT_BUTTON_COLOR_ID,
  customButtonColor: DEFAULT_CUSTOM_BUTTON,
  buttonTextColorId: DEFAULT_BUTTON_TEXT_COLOR_ID,
  customButtonTextColor: DEFAULT_CUSTOM_BUTTON_TEXT,
  buttonShape: DEFAULT_BUTTON_SHAPE,
  fontScaleId: DEFAULT_FONT_SCALE,
  homeHeaderStyle: DEFAULT_HOME_HEADER_STYLE,
  backgroundColorId: DEFAULT_BACKGROUND_COLOR_ID,
  customBackgroundColor: DEFAULT_CUSTOM_BACKGROUND,
};

export const buildTheme = (colorScheme, preferences = DEFAULT_THEME_PREFERENCES) => {
  const isDark = colorScheme === 'dark';
  const base = isDark ? darkTheme : lightTheme;
  const fallbackAccent = getAccentPreset(DEFAULT_ACCENT_ID);
  const accent = resolveAccent(
    preferences.accentId,
    preferences.customAccentColor,
    fallbackAccent,
  );
  const buttonShape = getButtonShape(preferences.buttonShape);
  const fontScaleOption = getFontScale(preferences.fontScaleId);
  const backgroundColors = resolveBackgroundColors(
    preferences.backgroundColorId,
    preferences.customBackgroundColor,
    base,
  );
  const buttonBackground = resolveButtonColor(
    preferences.buttonColorId,
    preferences.customButtonColor,
    accent,
    base,
  );

  return {
    ...base,
    primary: accent.primary,
    primaryLight: accent.primaryLight,
    button: buttonBackground,
    buttonText: resolveButtonTextColor(
      preferences.buttonTextColorId,
      preferences.customButtonTextColor,
      buttonBackground,
    ),
    background: backgroundColors.background,
    homeBody: backgroundColors.homeBody,
    homeHeader: resolveHomeHeader(
      preferences.homeHeaderStyle,
      accent,
      base,
      isDark,
    ),
    buttonRadius: buttonShape.radius,
    cardRadius: buttonShape.radius + 2,
    fontScale: fontScaleOption.scale,
  };
};

export const lightColors = buildTheme(THEME_MODES.LIGHT, DEFAULT_THEME_PREFERENCES);
