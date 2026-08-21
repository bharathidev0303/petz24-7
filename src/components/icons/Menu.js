import React from 'react';
import Svg, { Path } from 'react-native-svg';

const Menu = ({ width = 24, height = 24, color = '#777777' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path d="M4 7H20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M4 12H20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M4 17H20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export default Menu;
