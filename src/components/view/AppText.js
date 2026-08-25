import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Fonts } from '../../utils/fontHelper';
import { useTheme } from '../../theme/ThemeContext';

function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const scaleTextStyle = (style, fontScale) => {
  if (!style) return [];

  const flattened = StyleSheet.flatten(style);
  if (!flattened?.fontSize) {
    return [style];
  }

  return [style, { fontSize: Math.round(flattened.fontSize * fontScale) }];
};

const AppText = ({
  style,
  children,
  fontFamily = 'Bold',
  fontSize,
  color,
  fontWeight,
  letterSpacing,
  numberOfLines,
  ellipsizeMode = 'tail',
  ...props
}) => {
  const { colors, scaleFont } = useTheme();
  const resolvedColor = color ?? colors.primaryText;
  const findFont = Fonts?.[capitalize(fontFamily)] ?? Fonts.Bold;
  const resolvedFontSize = fontSize ? scaleFont(fontSize) : undefined;

  return (
    <Text
      {...props}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      style={[
        {
          fontFamily: findFont,
          color: resolvedColor,
          fontSize: resolvedFontSize,
          fontWeight,
          letterSpacing,
        },
        ...scaleTextStyle(style, colors.fontScale),
      ]}>
      {children}
    </Text>
  );
};

export default AppText;
