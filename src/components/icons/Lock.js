import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

const Lock = ({ width = 24, height = 24, color = '#777777' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Rect x="6" y="10" width="12" height="10" rx="2" stroke={color} strokeWidth="1.8" />
    <Path
      d="M8 10V8C8 5.8 9.8 4 12 4C14.2 4 16 5.8 16 8V10"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <Path d="M12 14V17" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export default Lock;
