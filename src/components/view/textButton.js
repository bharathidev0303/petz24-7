import { TouchableOpacity } from 'react-native';
import AppText from '../AppText';

import { colors } from '../../styles/colors';

const TextButton = ({
  children,
  color = colors.button,
  fontWeight,
  fontFamily = 'Regular',
  fontSize,
  letterSpacing,
  onPress,
  style,
  ...props
}) => (
  <TouchableOpacity style={style} onPress={() => onPress?.()} {...props}>
    <AppText color={color} fontWeight={fontWeight} fontFamily={fontFamily} fontSize={fontSize} letterSpacing={letterSpacing}>
      {children}
    </AppText>
  </TouchableOpacity>
);

export default TextButton;
