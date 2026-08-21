import React from 'react';
import Svg, { Path } from 'react-native-svg';

const Filter = ({ width = 22, height = 22, color = '#2B2B2B' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 6H20M7 12H17M10 18H14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

export default Filter;
