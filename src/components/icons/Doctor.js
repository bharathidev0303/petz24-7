import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

const Doctor = ({ width = 16, height = 16, color = '#777777' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7" r="3.5" stroke={color} strokeWidth="1.8" />
    <Path
      d="M6 20c1-3 3.2-4.5 6-4.5s5 1.5 6 4.5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <Path d="M18 10v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M16 12h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export default Doctor;
