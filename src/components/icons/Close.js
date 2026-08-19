import React from 'react';
import Svg, { Path } from 'react-native-svg';

const Close = ({ width = 24, height = 24, color = '#666' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export default Close;
