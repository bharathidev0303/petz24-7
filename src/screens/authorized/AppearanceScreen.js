import React, { useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import SubScreenHeader from '../../components/view/SubScreenHeader';
import { ACCENT_UI_PRESETS, getAccentPreset } from '../../theme/accentPresets';
import {
  BACKGROUND_COLOR_PRESETS,
  BUTTON_COLOR_PRESETS,
  BUTTON_TEXT_COLOR_PRESETS,
  BUTTON_SHAPES,
  FONT_SCALE_OPTIONS,
  HOME_HEADER_STYLES,
  resolveAccent,
  resolveButtonColor,
  resolveButtonTextColor,
} from '../../theme/appearanceOptions';
import { THEME_MODES, useTheme } from '../../theme/ThemeContext';
import { buildTheme } from '../../theme/buildTheme';
import { useThemedStyles } from '../../theme/useThemedStyles';
import CustomColorModal from '../../components/modals/CustomColorModal';
import { lightTheme } from '../../theme/lightTheme';
import { darkTheme } from '../../theme/darkTheme';

const MODE_OPTIONS = [
  { id: THEME_MODES.LIGHT, label: 'Light' },
  { id: THEME_MODES.DARK, label: 'Dark' },
  { id: THEME_MODES.SYSTEM, label: 'System default' },
];

const OptionChip = ({ label, selected, onPress, styles }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={[styles.modeChip, selected && styles.modeChipSelected]}>
    <AppText style={[styles.modeChipText, selected && styles.modeChipTextSelected]}>
      {label}
    </AppText>
  </TouchableOpacity>
);

const AccentSwatch = ({ preset, selected, onPress, previewPrimary, previewButton, styles }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={[styles.swatch, selected && styles.swatchSelected]}
    accessibilityRole="button"
    accessibilityState={{ selected }}>
    <View style={[styles.swatchColor, { backgroundColor: previewPrimary }]} />
    {previewButton ? (
      <View style={[styles.swatchDot, { backgroundColor: previewButton }]} />
    ) : null}
    <AppText style={styles.swatchLabel} numberOfLines={1}>
      {preset.label}
    </AppText>
  </TouchableOpacity>
);

const ButtonColorSwatch = ({ preset, selected, onPress, previewColor, styles }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={[styles.buttonSwatch, selected && styles.swatchSelected]}
    accessibilityRole="button"
    accessibilityState={{ selected }}>
    <View style={[styles.buttonSwatchColor, { backgroundColor: previewColor }]} />
    <AppText style={styles.swatchLabel} numberOfLines={2}>
      {preset.label}
    </AppText>
  </TouchableOpacity>
);

const ButtonTextSwatch = ({ preset, selected, onPress, textColor, buttonBg, styles }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={[styles.buttonTextSwatch, selected && styles.swatchSelected]}
    accessibilityRole="button"
    accessibilityState={{ selected }}>
    <View style={[styles.buttonTextPreview, { backgroundColor: buttonBg }]}>
      <AppText style={[styles.buttonTextPreviewLabel, { color: textColor }]}>Aa</AppText>
    </View>
    <AppText style={styles.swatchLabel} numberOfLines={2}>
      {preset.label}
    </AppText>
  </TouchableOpacity>
);

const BackgroundSwatch = ({ preset, selected, onPress, previewColor, styles }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={[styles.backgroundSwatch, selected && styles.swatchSelected]}
    accessibilityRole="button"
    accessibilityState={{ selected }}>
    <View
      style={[
        styles.backgroundSwatchColor,
        { backgroundColor: previewColor },
        preset.id === 'default' && styles.backgroundSwatchDefault,
      ]}
    />
    <AppText style={styles.swatchLabel} numberOfLines={2}>
      {preset.label}
    </AppText>
  </TouchableOpacity>
);

const CUSTOM_PICKERS = {
  BACKGROUND: 'background',
  ACCENT: 'accent',
  BUTTON: 'button',
  BUTTON_TEXT: 'buttonText',
};

const CUSTOM_PICKER_CONFIG = {
  [CUSTOM_PICKERS.BACKGROUND]: {
    title: 'Background color',
    description: 'Preview updates as you pick. Tap Apply to save this background color.',
    getValue: prefs => prefs.customBackgroundColor,
  },
  [CUSTOM_PICKERS.ACCENT]: {
    title: 'Accent color',
    description: 'Preview updates as you pick. Tap Apply to save this accent color.',
    getValue: prefs => prefs.customAccentColor,
  },
  [CUSTOM_PICKERS.BUTTON]: {
    title: 'Button color',
    description: 'Preview updates as you pick. Tap Apply to save this button color.',
    getValue: prefs => prefs.customButtonColor,
  },
  [CUSTOM_PICKERS.BUTTON_TEXT]: {
    title: 'Button text color',
    description: 'Preview updates as you pick. Tap Apply to save this button text color.',
    getValue: prefs => prefs.customButtonTextColor,
  },
};

const AppearanceScreen = () => {
  const navigation = useNavigation();
  const { user } = useSelector(state => state.auth);
  const [activeCustomPicker, setActiveCustomPicker] = useState(null);
  const [draftColor, setDraftColor] = useState(null);
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
    setMode,
    setAccent,
    setCustomAccent,
    setButtonColor,
    setCustomButtonColor,
    setButtonTextColor,
    setCustomButtonTextColor,
    setButtonShape,
    setFontScale,
    setHomeHeader,
    setBackgroundPreset,
    setCustomBackground,
    resetAppearance,
    colors,
    scaleFont,
    isDark,
    resolvedScheme,
  } = useTheme();
  const styles = useThemedStyles(createStyles);

  const closeCustomPicker = () => {
    setActiveCustomPicker(null);
    setDraftColor(null);
  };

  const openCustomPicker = (pickerKey, initialColor) => {
    setDraftColor(initialColor);
    setActiveCustomPicker(pickerKey);
  };

  const handleBackgroundPreset = presetId => {
    if (presetId === 'custom') {
      openCustomPicker(CUSTOM_PICKERS.BACKGROUND, customBackgroundColor);
      return;
    }
    closeCustomPicker();
    setBackgroundPreset(presetId);
  };

  const handleAccentPreset = presetId => {
    if (presetId === 'custom') {
      openCustomPicker(CUSTOM_PICKERS.ACCENT, customAccentColor);
      return;
    }
    closeCustomPicker();
    setAccent(presetId);
  };

  const handleButtonColorPreset = presetId => {
    if (presetId === 'custom') {
      openCustomPicker(CUSTOM_PICKERS.BUTTON, customButtonColor);
      return;
    }
    closeCustomPicker();
    setButtonColor(presetId);
  };

  const handleButtonTextPreset = presetId => {
    if (presetId === 'custom') {
      openCustomPicker(CUSTOM_PICKERS.BUTTON_TEXT, customButtonTextColor);
      return;
    }
    closeCustomPicker();
    setButtonTextColor(presetId);
  };

  const isCustomSelected = (presetId, currentId, pickerKey) =>
    presetId === 'custom'
      ? currentId === 'custom' || activeCustomPicker === pickerKey
      : currentId === presetId && activeCustomPicker !== pickerKey;

  const previewPreferences = useMemo(() => {
    const preferences = {
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

    if (!activeCustomPicker || !draftColor) {
      return preferences;
    }

    switch (activeCustomPicker) {
      case CUSTOM_PICKERS.BACKGROUND:
        return {
          ...preferences,
          backgroundColorId: 'custom',
          customBackgroundColor: draftColor,
        };
      case CUSTOM_PICKERS.ACCENT:
        return {
          ...preferences,
          accentId: 'custom',
          customAccentColor: draftColor,
        };
      case CUSTOM_PICKERS.BUTTON:
        return {
          ...preferences,
          buttonColorId: 'custom',
          customButtonColor: draftColor,
        };
      case CUSTOM_PICKERS.BUTTON_TEXT:
        return {
          ...preferences,
          buttonTextColorId: 'custom',
          customButtonTextColor: draftColor,
        };
      default:
        return preferences;
    }
  }, [
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
    activeCustomPicker,
    draftColor,
  ]);

  const previewColors = useMemo(
    () => buildTheme(resolvedScheme, previewPreferences),
    [resolvedScheme, previewPreferences],
  );

  const getAccentPreview = preset => {
    if (preset.id === 'custom') {
      const previewColor =
        activeCustomPicker === CUSTOM_PICKERS.ACCENT
          ? draftColor ?? customAccentColor
          : customAccentColor;
      return {
        primary: previewColor,
        button: getAccentPreset('brand').button,
      };
    }
    return {
      primary: preset.primary,
      button: preset.button,
    };
  };

  const getButtonPreviewColor = preset => {
    if (preset.id === 'custom') {
      return activeCustomPicker === CUSTOM_PICKERS.BUTTON
        ? draftColor ?? customButtonColor
        : customButtonColor;
    }
    if (preset.id === 'match-primary') {
      if (activeCustomPicker === CUSTOM_PICKERS.ACCENT && draftColor) {
        return draftColor;
      }
      return accentId === 'custom' ? customAccentColor : colors.primary;
    }
    if (preset.color) return preset.color;

    const base = isDark ? darkTheme : lightTheme;
    const accent = resolveAccent(accentId, customAccentColor, getAccentPreset('brand'));
    return resolveButtonColor(preset.id, customButtonColor, accent, base);
  };

  const getButtonTextPreviewColor = preset => {
    if (preset.id === 'custom') {
      return activeCustomPicker === CUSTOM_PICKERS.BUTTON_TEXT
        ? draftColor ?? customButtonTextColor
        : customButtonTextColor;
    }
    const buttonBackground =
      activeCustomPicker === CUSTOM_PICKERS.BUTTON && draftColor
        ? draftColor
        : previewColors.button;
    return resolveButtonTextColor(preset.id, customButtonTextColor, buttonBackground);
  };

  const getBackgroundPreviewColor = preset => {
    if (preset.id === 'default') {
      return isDark ? darkTheme.background : lightTheme.background;
    }
    if (preset.id === 'custom') {
      return activeCustomPicker === CUSTOM_PICKERS.BACKGROUND
        ? draftColor ?? customBackgroundColor
        : customBackgroundColor;
    }
    return preset.color ?? colors.background;
  };

  const customPickerConfig = activeCustomPicker
    ? CUSTOM_PICKER_CONFIG[activeCustomPicker]
    : null;

  const themePrefs = {
    customBackgroundColor,
    customAccentColor,
    customButtonColor,
    customButtonTextColor,
  };

  const handleCustomColorApply = hex => {
    switch (activeCustomPicker) {
      case CUSTOM_PICKERS.BACKGROUND:
        setCustomBackground(hex);
        break;
      case CUSTOM_PICKERS.ACCENT:
        setCustomAccent(hex);
        break;
      case CUSTOM_PICKERS.BUTTON:
        setCustomButtonColor(hex);
        break;
      case CUSTOM_PICKERS.BUTTON_TEXT:
        setCustomButtonTextColor(hex);
        break;
      default:
        break;
    }
    closeCustomPicker();
  };

  return (
    <View style={styles.container}>
      <SubScreenHeader title="Appearance" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <AppText style={styles.sectionTitle}>Theme</AppText>
        <AppText style={styles.sectionHint}>
          Choose light, dark, or match your device settings.
        </AppText>

        <View style={styles.chipRow}>
          {MODE_OPTIONS.map(option => (
            <OptionChip
              key={option.id}
              label={option.label}
              selected={mode === option.id}
              onPress={() => setMode(option.id)}
              styles={styles}
            />
          ))}
        </View>

        <AppText style={styles.sectionTitle}>Background color</AppText>
        <AppText style={styles.sectionHint}>
          Screen background across home, profile, and list pages.
        </AppText>

        <View style={styles.backgroundSwatchGrid}>
          {BACKGROUND_COLOR_PRESETS.map(preset => (
            <BackgroundSwatch
              key={preset.id}
              preset={preset}
              selected={isCustomSelected(
                preset.id,
                backgroundColorId,
                CUSTOM_PICKERS.BACKGROUND,
              )}
              onPress={() => handleBackgroundPreset(preset.id)}
              previewColor={getBackgroundPreviewColor(preset)}
              styles={styles}
            />
          ))}
        </View>

        <AppText style={styles.sectionTitle}>Accent color</AppText>
        <AppText style={styles.sectionHint}>
          Primary highlights, badges, and active states.
        </AppText>

        <View style={styles.swatchGrid}>
          {ACCENT_UI_PRESETS.map(preset => {
            const preview = getAccentPreview(preset);
            return (
              <AccentSwatch
                key={preset.id}
                preset={preset}
                selected={isCustomSelected(preset.id, accentId, CUSTOM_PICKERS.ACCENT)}
                onPress={() => handleAccentPreset(preset.id)}
                previewPrimary={preview.primary}
                previewButton={preview.button}
                styles={styles}
              />
            );
          })}
        </View>

        <AppText style={styles.sectionTitle}>Button color</AppText>
        <AppText style={styles.sectionHint}>
          Customize action buttons separately from the accent color.
        </AppText>

        <View style={styles.buttonSwatchGrid}>
          {BUTTON_COLOR_PRESETS.map(preset => (
            <ButtonColorSwatch
              key={preset.id}
              preset={preset}
              selected={isCustomSelected(
                preset.id,
                buttonColorId,
                CUSTOM_PICKERS.BUTTON,
              )}
              onPress={() => handleButtonColorPreset(preset.id)}
              previewColor={getButtonPreviewColor(preset)}
              styles={styles}
            />
          ))}
        </View>

        <AppText style={styles.sectionTitle}>Button text color</AppText>
        <AppText style={styles.sectionHint}>
          Label color on action buttons. Auto picks white or black for readability.
        </AppText>

        <View style={styles.buttonTextSwatchGrid}>
          {BUTTON_TEXT_COLOR_PRESETS.map(preset => (
            <ButtonTextSwatch
              key={preset.id}
              preset={preset}
              selected={isCustomSelected(
                preset.id,
                buttonTextColorId,
                CUSTOM_PICKERS.BUTTON_TEXT,
              )}
              onPress={() => handleButtonTextPreset(preset.id)}
              textColor={getButtonTextPreviewColor(preset)}
              buttonBg={previewColors.button}
              styles={styles}
            />
          ))}
        </View>

        <AppText style={styles.sectionTitle}>Button shape</AppText>
        <AppText style={styles.sectionHint}>Corner style for buttons across the app.</AppText>

        <View style={styles.chipRow}>
          {Object.values(BUTTON_SHAPES).map(option => (
            <OptionChip
              key={option.id}
              label={option.label}
              selected={buttonShape === option.id}
              onPress={() => setButtonShape(option.id)}
              styles={styles}
            />
          ))}
        </View>

        <AppText style={styles.sectionTitle}>Text size</AppText>
        <AppText style={styles.sectionHint}>Adjust overall text readability.</AppText>

        <View style={styles.chipRow}>
          {Object.values(FONT_SCALE_OPTIONS).map(option => (
            <OptionChip
              key={option.id}
              label={option.label}
              selected={fontScaleId === option.id}
              onPress={() => setFontScale(option.id)}
              styles={styles}
            />
          ))}
        </View>

        <AppText style={styles.sectionTitle}>Home header</AppText>
        <AppText style={styles.sectionHint}>Background style for the home screen header.</AppText>

        <View style={styles.chipRow}>
          {Object.values(HOME_HEADER_STYLES).map(option => (
            <OptionChip
              key={option.id}
              label={option.label}
              selected={homeHeaderStyle === option.id}
              onPress={() => setHomeHeader(option.id)}
              styles={styles}
            />
          ))}
        </View>

        <View style={[styles.previewCard, { borderRadius: colors.cardRadius }]}>
          <AppText style={[styles.previewTitle, { fontSize: scaleFont(16) }]}>Preview</AppText>
          <AppText style={[styles.previewBody, { fontSize: scaleFont(14) }]}>
            Signed in as {user?.name || 'Guest'}. Custom colors preview here before
            you tap Apply.
          </AppText>

          <View style={[styles.headerPreview, { backgroundColor: previewColors.homeHeader }]}>
            <AppText style={[styles.headerPreviewText, { fontSize: scaleFont(12) }]}>
              Home header preview
            </AppText>
          </View>

          <View style={[styles.backgroundPreview, { backgroundColor: previewColors.background }]}>
            <AppText style={[styles.backgroundPreviewText, { fontSize: scaleFont(12) }]}>
              Screen background preview
            </AppText>
          </View>

          <Button backgroundColor={previewColors.primary} style={styles.previewButton}>
            Primary button
          </Button>
          <Button
            backgroundColor={previewColors.button}
            textStyle={{ color: previewColors.buttonText }}
            style={styles.previewButtonSecondary}>
            Action button
          </Button>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            closeCustomPicker();
            resetAppearance();
          }}
          style={styles.resetButton}>
          <AppText style={styles.resetButtonText}>Reset to defaults</AppText>
        </TouchableOpacity>
      </ScrollView>

      <CustomColorModal
        visible={!!activeCustomPicker}
        title={customPickerConfig?.title}
        description={customPickerConfig?.description}
        value={customPickerConfig ? customPickerConfig.getValue(themePrefs) : undefined}
        onPreviewChange={setDraftColor}
        onClose={closeCustomPicker}
        onApply={handleCustomColorApply}
      />
    </View>
  );
};

const createStyles = colors => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 6,
    marginTop: 8,
  },
  sectionHint: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 14,
    lineHeight: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  modeChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  modeChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  modeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
  },
  modeChipTextSelected: {
    color: colors.white,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  buttonSwatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  buttonTextSwatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  buttonTextSwatch: {
    width: '23%',
    minWidth: 72,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 8,
    alignItems: 'center',
  },
  buttonTextPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonTextPreviewLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  backgroundSwatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  swatch: {
    width: '31%',
    minWidth: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 10,
    alignItems: 'center',
  },
  buttonSwatch: {
    width: '31%',
    minWidth: 96,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 10,
    alignItems: 'center',
  },
  swatchSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  swatchColor: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginBottom: 6,
  },
  buttonSwatchColor: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginBottom: 8,
  },
  backgroundSwatch: {
    width: '23%',
    minWidth: 72,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 8,
    alignItems: 'center',
  },
  backgroundSwatchColor: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backgroundSwatchDefault: {
    borderStyle: 'dashed',
  },
  swatchDot: {
    width: 18,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  swatchLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryText,
    textAlign: 'center',
  },
  previewCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  previewTitle: {
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 8,
  },
  previewBody: {
    color: colors.secondaryText,
    marginBottom: 16,
    lineHeight: 20,
  },
  headerPreview: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  headerPreviewText: {
    fontWeight: '600',
    color: colors.primaryText,
  },
  backgroundPreview: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backgroundPreviewText: {
    fontWeight: '600',
    color: colors.primaryText,
  },
  previewButton: {
    marginBottom: 10,
  },
  previewButtonSecondary: {
    marginBottom: 0,
  },
  resetButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.card,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.error,
  },
});

export default AppearanceScreen;
