import React from 'react';
import Svg, { Path } from 'react-native-svg';

const Shield = ({ width = 24, height = 24, color = '#777777' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3L5 6V11.5C5 16.2 8.1 20.5 12 21.5C15.9 20.5 19 16.2 19 11.5V6L12 3Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <Path d="M9.5 12L11 13.5L14.5 10" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default Shield;
