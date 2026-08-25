import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_THEME_PREFERENCES } from '../../theme/buildTheme';
import { normalizeHexColor } from '../../utils/colorUtils';

const THEME_STORAGE_KEY = 'appThemePreferences';

const normalizePreferences = raw => ({
  mode: raw?.mode ?? DEFAULT_THEME_PREFERENCES.mode,
  accentId: raw?.accentId ?? DEFAULT_THEME_PREFERENCES.accentId,
  customAccentColor:
    normalizeHexColor(raw?.customAccentColor) ?? DEFAULT_THEME_PREFERENCES.customAccentColor,
  buttonColorId: raw?.buttonColorId ?? DEFAULT_THEME_PREFERENCES.buttonColorId,
  customButtonColor:
    normalizeHexColor(raw?.customButtonColor) ?? DEFAULT_THEME_PREFERENCES.customButtonColor,
  buttonTextColorId: raw?.buttonTextColorId ?? DEFAULT_THEME_PREFERENCES.buttonTextColorId,
  customButtonTextColor:
    normalizeHexColor(raw?.customButtonTextColor) ??
    DEFAULT_THEME_PREFERENCES.customButtonTextColor,
  buttonShape: raw?.buttonShape ?? DEFAULT_THEME_PREFERENCES.buttonShape,
  fontScaleId: raw?.fontScaleId ?? DEFAULT_THEME_PREFERENCES.fontScaleId,
  homeHeaderStyle: raw?.homeHeaderStyle ?? DEFAULT_THEME_PREFERENCES.homeHeaderStyle,
  backgroundColorId: raw?.backgroundColorId ?? DEFAULT_THEME_PREFERENCES.backgroundColorId,
  customBackgroundColor:
    normalizeHexColor(raw?.customBackgroundColor) ??
    DEFAULT_THEME_PREFERENCES.customBackgroundColor,
});

export const loadThemePreferences = createAsyncThunk('theme/load', async () => {
  try {
    const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_THEME_PREFERENCES;
    }
    return normalizePreferences(JSON.parse(stored));
  } catch {
    return DEFAULT_THEME_PREFERENCES;
  }
});

const pickThemePreferences = state => {
  const {
    mode,
    accentId,
    customAccentColor,
    buttonColorId,
    customButtonColor,
    buttonTextColorId,
    customButtonTextColor,
    buttonShape,
    fontScaleId,
    homeHeaderStyle,
    backgroundColorId,
    customBackgroundColor,
  } = state.theme;

  return {
    mode,
    accentId,
    customAccentColor,
    buttonColorId,
    customButtonColor,
    buttonTextColorId,
    customButtonTextColor,
    buttonShape,
    fontScaleId,
    homeHeaderStyle,
    backgroundColorId,
    customBackgroundColor,
  };
};

export const saveThemePreferences = createAsyncThunk('theme/save', async (_, { getState }) => {
  const normalized = normalizePreferences(pickThemePreferences(getState()));
  await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
});

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    ...DEFAULT_THEME_PREFERENCES,
    initialized: false,
  },
  reducers: {
    setThemeMode: (state, action) => {
      state.mode = action.payload;
    },
    setAccentId: (state, action) => {
      state.accentId = action.payload;
    },
    setCustomAccentColor: (state, action) => {
      state.customAccentColor =
        normalizeHexColor(action.payload) ?? DEFAULT_THEME_PREFERENCES.customAccentColor;
    },
    setButtonColorId: (state, action) => {
      state.buttonColorId = action.payload;
    },
    setCustomButtonColor: (state, action) => {
      state.customButtonColor =
        normalizeHexColor(action.payload) ?? DEFAULT_THEME_PREFERENCES.customButtonColor;
    },
    setButtonTextColorId: (state, action) => {
      state.buttonTextColorId = action.payload;
    },
    setCustomButtonTextColor: (state, action) => {
      state.customButtonTextColor =
        normalizeHexColor(action.payload) ?? DEFAULT_THEME_PREFERENCES.customButtonTextColor;
    },
    setButtonShape: (state, action) => {
      state.buttonShape = action.payload;
    },
    setFontScaleId: (state, action) => {
      state.fontScaleId = action.payload;
    },
    setHomeHeaderStyle: (state, action) => {
      state.homeHeaderStyle = action.payload;
    },
    setBackgroundColorId: (state, action) => {
      state.backgroundColorId = action.payload;
    },
    setCustomBackgroundColor: (state, action) => {
      state.customBackgroundColor =
        normalizeHexColor(action.payload) ?? DEFAULT_THEME_PREFERENCES.customBackgroundColor;
    },
    resetThemePreferences: state => {
      Object.assign(state, DEFAULT_THEME_PREFERENCES);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadThemePreferences.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
        state.initialized = true;
      })
      .addCase(loadThemePreferences.rejected, state => {
        state.initialized = true;
      });
  },
});

export const {
  setThemeMode,
  setAccentId,
  setCustomAccentColor,
  setButtonColorId,
  setCustomButtonColor,
  setButtonTextColorId,
  setCustomButtonTextColor,
  setButtonShape,
  setFontScaleId,
  setHomeHeaderStyle,
  setBackgroundColorId,
  setCustomBackgroundColor,
  resetThemePreferences,
} = themeSlice.actions;

export default themeSlice.reducer;
