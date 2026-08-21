import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors } from '../../styles/colors';

const Mail = ({ width = 24, height = 24, color = colors.primary }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke={color} strokeWidth="1.8" />
    <Path
      d="M4 7l8 6 8-6"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default Mail;
