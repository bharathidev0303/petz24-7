import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import AppText from './AppText';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';
import { hexToHsl, hslToHex, normalizeHexColor } from '../../utils/colorUtils';

const ColorPicker = ({
  value,
  onChange,
  onApply,
  onPreviewChange,
  deferChanges = false,
  showApplyButton,
  embedded = false,
}) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const initialColor = normalizeHexColor(value) ?? '#FFFFFF';
  const initialHsl = useMemo(() => hexToHsl(initialColor), [initialColor]);

  const [hue, setHue] = useState(initialHsl.h);
  const [saturation, setSaturation] = useState(initialHsl.s);
  const [lightness, setLightness] = useState(initialHsl.l);
  const [hexInput, setHexInput] = useState(initialColor);
  const [isEditingHex, setIsEditingHex] = useState(false);

  const selectedColor = useMemo(
    () => hslToHex(hue, saturation, lightness),
    [hue, saturation, lightness],
  );

  useEffect(() => {
    const normalized = normalizeHexColor(value);
    if (!normalized) return;

    const nextHsl = hexToHsl(normalized);
    setHue(nextHsl.h);
    setSaturation(nextHsl.s);
    setLightness(nextHsl.l);
    setHexInput(normalized);
    setIsEditingHex(false);
  }, [value]);

  const emitColor = useCallback(
    (hex, h, s, l) => {
      const nextHex = normalizeHexColor(hex) ?? hslToHex(h, s, l);
      if (!isEditingHex) {
        setHexInput(nextHex);
      }
      if (deferChanges) {
        onPreviewChange?.(nextHex);
      } else {
        onChange?.(nextHex);
      }
    },
    [deferChanges, isEditingHex, onChange, onPreviewChange],
  );

  const handleHueChange = nextHue => {
    setHue(nextHue);
    emitColor(hslToHex(nextHue, saturation, lightness), nextHue, saturation, lightness);
  };

  const handleSaturationChange = nextSaturation => {
    setSaturation(nextSaturation);
    emitColor(hslToHex(hue, nextSaturation, lightness), hue, nextSaturation, lightness);
  };

  const handleLightnessChange = nextLightness => {
    setLightness(nextLightness);
    emitColor(hslToHex(hue, saturation, nextLightness), hue, saturation, nextLightness);
  };

  const handleHexBlur = () => {
    const normalized = normalizeHexColor(hexInput);
    if (!normalized) {
      setHexInput(selectedColor);
      setIsEditingHex(false);
      return;
    }

    const nextHsl = hexToHsl(normalized);
    setHue(nextHsl.h);
    setSaturation(nextHsl.s);
    setLightness(nextHsl.l);
    setHexInput(normalized);
    setIsEditingHex(false);
    if (deferChanges) {
      onPreviewChange?.(normalized);
    } else {
      onChange?.(normalized);
    }
  };

  const handleHexFocus = () => {
    setHexInput(selectedColor);
    setIsEditingHex(true);
  };

  const handleApply = () => {
    const normalized = normalizeHexColor(selectedColor) ?? normalizeHexColor(hexInput);
    if (normalized) {
      onApply?.(normalized);
    }
  };

  const shouldShowApplyButton = showApplyButton ?? deferChanges;

  return (
    <View style={[styles.container, embedded && styles.containerEmbedded]}>
      <View style={[styles.preview, { backgroundColor: selectedColor }]}>
        <AppText style={styles.previewHex}>{selectedColor}</AppText>
      </View>

      <AppText style={styles.sliderLabel}>Hue</AppText>
      <View style={styles.hueTrack}>
        <Slider
          minimumValue={0}
          maximumValue={360}
          step={1}
          value={hue}
          onValueChange={handleHueChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
      </View>

      <AppText style={styles.sliderLabel}>Saturation</AppText>
      <Slider
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={saturation}
        onValueChange={handleSaturationChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
      />

      <AppText style={styles.sliderLabel}>Lightness</AppText>
      <Slider
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={lightness}
        onValueChange={handleLightnessChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
      />

      <AppText style={styles.sliderLabel}>Hex code</AppText>
      <TextInput
        value={isEditingHex ? hexInput : selectedColor}
        onChangeText={setHexInput}
        onFocus={handleHexFocus}
        onBlur={handleHexBlur}
        onSubmitEditing={handleHexBlur}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={7}
        placeholder="#FFFFFF"
        placeholderTextColor={colors.secondaryText}
        style={styles.hexInput}
      />

      {shouldShowApplyButton ? (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleApply}
          style={[styles.applyButton, { backgroundColor: colors.primary }]}>
          <AppText style={styles.applyButtonText}>Apply</AppText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const createStyles = colors =>
  StyleSheet.create({
    container: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      backgroundColor: colors.card,
      gap: 4,
    },
    containerEmbedded: {
      borderWidth: 0,
      padding: 0,
      backgroundColor: 'transparent',
    },
    preview: {
      height: 72,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    previewHex: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primaryText,
      backgroundColor: 'rgba(255,255,255,0.75)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      overflow: 'hidden',
    },
    sliderLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primaryText,
      marginTop: 6,
    },
    hueTrack: {
      marginBottom: 4,
    },
    hexInput: {
      marginTop: 4,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.primaryText,
      backgroundColor: colors.inputBackground,
    },
    applyButton: {
      marginTop: 12,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
    },
    applyButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.white,
    },
  });

export default ColorPicker;
