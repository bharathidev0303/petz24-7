import React from 'react';
import { TouchableOpacity } from 'react-native';
import AppText from '../AppText';
import { useTheme } from '../../theme/ThemeContext';

const TextButton = ({
  children,
  color,
  fontWeight,
  fontFamily = 'Regular',
  fontSize,
  letterSpacing,
  onPress,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={style} onPress={() => onPress?.()} {...props}>
      <AppText
        color={color ?? colors.button}
        fontWeight={fontWeight}
        fontFamily={fontFamily}
        fontSize={fontSize}
        letterSpacing={letterSpacing}>
        {children}
      </AppText>
    </TouchableOpacity>
  );
};

export default TextButton;
