import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';

const ContactUs = ({ width = 120, height = 120, color }) => {
  const { colors } = useTheme();
  const resolvedColor = color ?? colors.primary;

  return (
    <Svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      <Circle cx="60" cy="60" r="58" stroke={resolvedColor} strokeWidth="3" />
      <Path
        d="M40 52c0-11 9-20 20-20s20 9 20 20-9 20-20 20"
        stroke={resolvedColor}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Path
        d="M35 88c6-12 16-18 25-18s19 6 25 18"
        stroke={resolvedColor}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default ContactUs;
