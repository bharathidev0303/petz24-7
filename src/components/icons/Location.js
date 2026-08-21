import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

const Location = ({ width = 24, height = 24, color = '#777777' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21C12 21 19 14.5 19 9.5C19 6.5 16.5 4 12 4C7.5 4 5 6.5 5 9.5C5 14.5 12 21 12 21Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="9.5" r="2.5" stroke={color} strokeWidth="1.8" />
  </Svg>
);

export default Location;
