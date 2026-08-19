import { TouchableOpacity } from 'react-native';
import AppText from '../AppText';

const TextButton = ({
  children,
  color = '#F7941E',
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
