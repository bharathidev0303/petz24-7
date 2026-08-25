import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { buildTheme, THEME_MODES } from './buildTheme';
import {
  loadThemePreferences,
  resetThemePreferences,
  saveThemePreferences,
  setAccentId,
  setBackgroundColorId,
  setButtonColorId,
  setButtonShape,
  setButtonTextColorId,
  setCustomAccentColor,
  setCustomBackgroundColor,
  setCustomButtonColor as setCustomButtonColorAction,
  setCustomButtonTextColor as setCustomButtonTextColorAction,
  setFontScaleId,
  setHomeHeaderStyle,
  setThemeMode,
} from '../redux/slices/themeSlice';
import { normalizeHexColor } from '../utils/colorUtils';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const dispatch = useDispatch();
  const preferences = useSelector(state => state.theme);
  const { initialized } = preferences;

  const systemScheme = useColorScheme();

  useEffect(() => {
    if (!initialized) {
      dispatch(loadThemePreferences());
    }
  }, [dispatch, initialized]);

  const resolvedScheme = useMemo(() => {
    if (preferences.mode === THEME_MODES.SYSTEM) {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return preferences.mode === THEME_MODES.DARK ? 'dark' : 'light';
  }, [preferences.mode, systemScheme]);

  const themePreferences = useMemo(
    () => ({
      mode: preferences.mode,
      accentId: preferences.accentId,
      customAccentColor: preferences.customAccentColor,
      buttonColorId: preferences.buttonColorId,
      customButtonColor: preferences.customButtonColor,
      buttonTextColorId: preferences.buttonTextColorId,
      customButtonTextColor: preferences.customButtonTextColor,
      buttonShape: preferences.buttonShape,
      fontScaleId: preferences.fontScaleId,
      homeHeaderStyle: preferences.homeHeaderStyle,
      backgroundColorId: preferences.backgroundColorId,
      customBackgroundColor: preferences.customBackgroundColor,
    }),
    [preferences],
  );

  const colors = useMemo(
    () => buildTheme(resolvedScheme, themePreferences),
    [resolvedScheme, themePreferences],
  );

  const persistPreferences = useCallback(() => {
    dispatch(saveThemePreferences());
  }, [dispatch]);

  const updatePreference = useCallback(
    (key, value) => {
      const actionMap = {
        mode: setThemeMode,
        accentId: setAccentId,
        customAccentColor: setCustomAccentColor,
        buttonColorId: setButtonColorId,
        customButtonColor: setCustomButtonColorAction,
        buttonTextColorId: setButtonTextColorId,
        customButtonTextColor: setCustomButtonTextColorAction,
        buttonShape: setButtonShape,
        fontScaleId: setFontScaleId,
        homeHeaderStyle: setHomeHeaderStyle,
        backgroundColorId: setBackgroundColorId,
        customBackgroundColor: setCustomBackgroundColor,
      };

      dispatch(actionMap[key](value));
      persistPreferences();
    },
    [dispatch, persistPreferences],
  );

  const setMode = useCallback(
    nextMode => updatePreference('mode', nextMode),
    [updatePreference],
  );

  const setAccent = useCallback(
    nextAccentId => updatePreference('accentId', nextAccentId),
    [updatePreference],
  );

  const setCustomAccent = useCallback(
    hex => {
      const normalized = normalizeHexColor(hex);
      if (!normalized) return;

      dispatch(setAccentId('custom'));
      dispatch(setCustomAccentColor(normalized));
      persistPreferences();
    },
    [dispatch, persistPreferences],
  );

  const setButtonColor = useCallback(
    nextButtonColorId => updatePreference('buttonColorId', nextButtonColorId),
    [updatePreference],
  );

  const setCustomButtonColor = useCallback(
    hex => {
      const normalized = normalizeHexColor(hex);
      if (!normalized) return;

      dispatch(setButtonColorId('custom'));
      dispatch(setCustomButtonColorAction(normalized));
      persistPreferences();
    },
    [dispatch, persistPreferences],
  );

  const setButtonTextColor = useCallback(
    nextButtonTextColorId => updatePreference('buttonTextColorId', nextButtonTextColorId),
    [updatePreference],
  );

  const setCustomButtonTextColor = useCallback(
    hex => {
      const normalized = normalizeHexColor(hex);
      if (!normalized) return;

      dispatch(setButtonTextColorId('custom'));
      dispatch(setCustomButtonTextColorAction(normalized));
      persistPreferences();
    },
    [dispatch, persistPreferences],
  );

  const setButtonShapePreference = useCallback(
    nextShape => updatePreference('buttonShape', nextShape),
    [updatePreference],
  );

  const setFontScale = useCallback(
    nextFontScaleId => updatePreference('fontScaleId', nextFontScaleId),
    [updatePreference],
  );

  const setHomeHeader = useCallback(
    nextStyle => updatePreference('homeHeaderStyle', nextStyle),
    [updatePreference],
  );

  const setBackgroundPreset = useCallback(
    nextBackgroundId => updatePreference('backgroundColorId', nextBackgroundId),
    [updatePreference],
  );

  const setCustomBackground = useCallback(
    hex => {
      const normalized = normalizeHexColor(hex);
      if (!normalized) return;

      dispatch(setBackgroundColorId('custom'));
      dispatch(setCustomBackgroundColor(normalized));
      persistPreferences();
    },
    [dispatch, persistPreferences],
  );

  const resetAppearance = useCallback(() => {
    dispatch(resetThemePreferences());
    persistPreferences();
  }, [dispatch, persistPreferences]);

  const value = useMemo(
    () => ({
      colors,
      ...themePreferences,
      resolvedScheme,
      isDark: resolvedScheme === 'dark',
      setMode,
      setAccent,
      setCustomAccent,
      setButtonColor,
      setCustomButtonColor,
      setButtonTextColor,
      setCustomButtonTextColor,
      setButtonShape: setButtonShapePreference,
      setFontScale,
      setHomeHeader,
      setBackgroundPreset,
      setCustomBackground,
      resetAppearance,
      scaleFont: size => Math.round(size * colors.fontScale),
    }),
    [
      colors,
      themePreferences,
      resolvedScheme,
      setMode,
      setAccent,
      setCustomAccent,
      setButtonColor,
      setCustomButtonColor,
      setButtonTextColor,
      setCustomButtonTextColor,
      setButtonShapePreference,
      setFontScale,
      setHomeHeader,
      setBackgroundPreset,
      setCustomBackground,
      resetAppearance,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export { THEME_MODES };
