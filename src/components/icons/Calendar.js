import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

const Calendar = ({ width = 24, height = 24, color = '#777777' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="5" width="16" height="16" rx="2" stroke={color} strokeWidth="1.8" />
    <Path d="M8 3V7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M16 3V7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M4 10H20" stroke={color} strokeWidth="1.8" />
    <Path d="M9 14H11" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M13 14H15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export default Calendar;
