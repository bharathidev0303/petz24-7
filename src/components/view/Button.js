import React from 'react';
import { TouchableOpacity, View, ActivityIndicator } from 'react-native';
import AppText from './AppText';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';

const Button = ({
  children,
  onPress,
  loading = false,
  backgroundColor,
  disabled = false,
  style,
  textStyle,
  testID,
}) => {
  const { colors, scaleFont } = useTheme();
  const styles = useThemedStyles(createStyles);

  const resolvedBackground = backgroundColor ?? colors.button;
  const resolvedTextColor = textStyle?.color ?? colors.buttonText;
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={isDisabled ? null : onPress}
      style={[
        styles.button,
        { borderRadius: colors.buttonRadius },
        isDisabled && styles.disabled,
        style,
        { backgroundColor: resolvedBackground },
      ]}
      disabled={isDisabled}
      testID={testID}>
      {loading ? (
        <ActivityIndicator size="small" color={resolvedTextColor} />
      ) : (
        <View>
          {typeof children === 'string' || typeof children === 'number' ? (
            <AppText
              color={resolvedTextColor}
              style={[styles.text, { fontSize: scaleFont(16) }, textStyle]}>
              {children}
            </AppText>
          ) : (
            children
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const createStyles = () => ({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontWeight: '600' },
  disabled: { opacity: 0.6 },
});

export default Button;
