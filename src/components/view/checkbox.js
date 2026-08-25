import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import AppText from '../AppText';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';

export default function CustomCheckbox({
  title = '',
  checked: controlledChecked,
  onChange,
  containerStyle,
  checkboxStyle,
  textStyle,
  activeColor,
  inactiveColor = '#C7C7CC',
  disabled = false,
  disabledColor = '#E5E5E5',
  size = 18,
  borderWidth = 2,
  checkIcon = '✓',
}) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const resolvedActiveColor = activeColor ?? colors.primary;
  const [internalChecked, setInternalChecked] = useState(false);
  const checked = controlledChecked ?? internalChecked;

  const bgScale = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const bgOpacity = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const iconScale = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const iconOpacity = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(bgScale, { toValue: checked ? 1 : 0, friction: 6, useNativeDriver: true }),
      Animated.timing(bgOpacity, { toValue: checked ? 1 : 0, duration: 120, useNativeDriver: true }),
      Animated.spring(iconScale, { toValue: checked ? 1 : 0, friction: 6, useNativeDriver: true }),
      Animated.timing(iconOpacity, { toValue: checked ? 1 : 0, duration: 120, useNativeDriver: true }),
    ]).start();
  }, [checked, bgOpacity, bgScale, iconOpacity, iconScale]);

  const handlePress = () => {
    if (disabled) return;
    const newValue = !checked;
    setInternalChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { opacity: disabled ? 0.5 : 1 }, containerStyle]}
      onPress={handlePress}
      activeOpacity={1}
      disabled={disabled}>
      <View
        style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            borderRadius: size / 4,
            borderWidth,
            borderColor: disabled
              ? disabledColor
              : checked
                ? resolvedActiveColor
                : inactiveColor,
          },
          checkboxStyle,
        ]}>
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: resolvedActiveColor,
              opacity: bgOpacity,
              transform: [{ scale: bgScale }],
            },
          ]}
        />
        <Animated.View style={{ opacity: iconOpacity, transform: [{ scale: iconScale }] }}>
          <AppText style={[styles.checkMark, { fontSize: size - 8 }]}>{checkIcon}</AppText>
        </Animated.View>
      </View>

      {typeof title === 'string' || typeof title === 'number' ? (
        <AppText style={[styles.label, textStyle]}>{title}</AppText>
      ) : (
        title
      )}
    </TouchableOpacity>
  );
}

const createStyles = colors => ({
  container: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { justifyContent: 'center', alignItems: 'center', marginRight: 8, overflow: 'hidden' },
  checkMark: { color: '#fff', fontWeight: '600' },
  label: { fontSize: 16, color: colors.primaryText },
});
