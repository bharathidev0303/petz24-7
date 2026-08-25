import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import AppText from '../AppText';
import AppInput from '../AppInput';
import AppView from '../AppView';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';

const FloatingInput = ({
  label,
  value = '',
  error,
  disabled = false,
  style,
  inputStyle,
  labelStyle = { fontSize: 14 },
  isRequired = false,
  suffix,
  prefix,
  disabledColor = '#f5f5f5',
  onFocus,
  onBlur,
  onChangeText,
  ...props
}) => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const hasFocusedOnce = useRef(false);
  const isFirstRender = useRef(true);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    Animated.timing(animatedValue, { toValue: value ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [value]);

  const handleFocus = () => {
    if (disabled) return;
    setIsFocused(true);
    hasFocusedOnce.current = true;
    onFocus?.();
    Animated.timing(animatedValue, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };

  const handleBlur = () => {
    if (disabled) return;
    setIsFocused(false);
    onBlur?.();
    if (!value) {
      Animated.timing(animatedValue, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    }
  };

  const floatingLabelStyle = {
    position: 'absolute',
    left: 16,
    top: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [14, -10] }),
    color: disabled ? '#bdbdbd' : isFocused ? colors.primary : '#999',
    backgroundColor: 'white',
    paddingLeft: 5,
    zIndex: 99,
  };

  return (
    <AppView marginVertical={10}>
      <View
        style={[
          styles.container,
          isFocused && !disabled && !error && styles.focusedContainer,
          error && styles.errorContainer,
          style,
        ]}>
        {prefix && <View style={{ paddingHorizontal: 5 }}>{prefix}</View>}

        <View style={styles.input}>
          <Animated.Text style={[floatingLabelStyle, labelStyle]}>
            {label}{' '}
            {isRequired && <AppText style={styles.required}>*</AppText>}
          </Animated.Text>

          <AppInput
            value={value}
            onChangeText={onChangeText}
            editable={!disabled}
            selectTextOnFocus={!disabled && !hasFocusedOnce.current}
            style={[
              styles.inputStyle,
              disabled && { ...styles.disabledInput, backgroundColor: disabledColor },
              error && !disabled && styles.errorInput,
              inputStyle,
            ]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        </View>

        {suffix && <View style={{ paddingHorizontal: 5 }}>{suffix}</View>}
      </View>

      {error && (
        <AppText fontFamily="Regular" style={styles.errorText} color="red">
          {error}
        </AppText>
      )}
    </AppView>
  );
};

const createStyles = colors => ({
  container: {
    borderWidth: 1.5,
    borderColor: '#E3E3E3',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: { paddingHorizontal: 16, flex: 1 },
  inputStyle: { paddingVertical: 17 },
  focusedContainer: { borderColor: colors.primary, borderWidth: 1.5 },
  errorContainer: { borderColor: 'red', borderWidth: 1 },
  errorInput: { borderColor: '#d32f2f' },
  disabledInput: { borderColor: '#e0e0e0', color: '#9e9e9e' },
  required: { color: 'red', fontSize: 12 },
  errorText: { marginTop: 5, paddingLeft: 15, fontSize: 13 },
});

export default FloatingInput;
