import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

const Orders = ({ width = 24, height = 24, color = '#777777' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="3" width="14" height="18" rx="2" stroke={color} strokeWidth="1.8" />
    <Path d="M9 8H15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M9 12H15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M9 16H13" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export default Orders;
