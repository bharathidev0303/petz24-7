import React, { useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';
import AppText from './AppText';

const CustomButton = ({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
}) => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isPrimary = variant === 'primary';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.button,
          { borderRadius: colors.buttonRadius },
          isPrimary ? styles.primaryButton : styles.secondaryButton,
          disabled && styles.disabledButton,
        ]}
        onPress={onPress}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start()}
        onPressOut={() =>
          Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start()
        }
        disabled={disabled || loading}
        activeOpacity={0.8}>
        {loading ? (
          <ActivityIndicator color={isPrimary ? colors.buttonText : colors.primary} />
        ) : (
          <AppText
            color={isPrimary ? colors.buttonText : colors.text}
            style={[styles.text, !isPrimary && styles.secondaryText]}>
            {title}
          </AppText>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const createStyles = colors => ({
  button: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  primaryButton: { backgroundColor: colors.button },
  secondaryButton: { backgroundColor: colors.lightGray, borderWidth: 1, borderColor: colors.border },
  disabledButton: { backgroundColor: colors.loginButtonBackgroundColor },
  text: { fontSize: 18, fontWeight: '600' },
  secondaryText: { color: colors.text },
});

export default CustomButton;
