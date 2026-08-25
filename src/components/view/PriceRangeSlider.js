import React from 'react';
import { View, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import AppText from './AppText';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';

const PriceRangeSlider = ({ min, max, low, high, onLowChange, onHighChange }) => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  if (min == null || max == null || min >= max) {
    return null;
  }

  return (
    <View style={styles.container}>
      <AppText style={styles.valueText}>
        Rs. {Math.round(low)} – Rs. {Math.round(high)}
      </AppText>

      <AppText style={styles.label}>Minimum price</AppText>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={1}
        value={low}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
        onValueChange={value => onLowChange(Math.min(Math.round(value), high))}
      />

      <AppText style={styles.label}>Maximum price</AppText>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={1}
        value={high}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
        onValueChange={value => onHighChange(Math.max(Math.round(value), low))}
      />
    </View>
  );
};

const createStyles = colors => ({
  container: {
    marginBottom: 8,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 8,
  },
});

export default PriceRangeSlider;
