import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

const Plan = ({ width = 16, height = 16, color = '#777777' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="4" width="14" height="16" rx="2" stroke={color} strokeWidth="1.8" />
    <Path d="M9 9h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M9 13h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M9 17h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export default Plan;
