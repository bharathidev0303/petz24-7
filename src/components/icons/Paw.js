import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

const Paw = ({ width = 16, height = 16, color = '#777777' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Circle cx="8" cy="8" r="2" fill={color} />
    <Circle cx="12" cy="6" r="2" fill={color} />
    <Circle cx="16" cy="8" r="2" fill={color} />
    <Circle cx="18" cy="12" r="1.8" fill={color} />
    <Path
      d="M7 12c1.2 3.2 3.4 5 5 5s3.8-1.8 5-5c-1.4 2.6-3.4 4-5 4s-3.6-1.4-5-4Z"
      fill={color}
    />
  </Svg>
);

export default Paw;
