import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';

const Mail = ({ width = 24, height = 24, color }) => {
  const { colors } = useTheme();
  const resolvedColor = color ?? colors.primary;

  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke={resolvedColor} strokeWidth="1.8" />
      <Path
        d="M4 7l8 6 8-6"
        stroke={resolvedColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Mail;
