import React from 'react';
import Svg, { Path } from 'react-native-svg';

const Shop = ({ width = 24, height = 24, color = '#777777' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 9L5.5 4H18.5L20 9"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 9H20V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V9Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <Path d="M9 13H15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export default Shop;
