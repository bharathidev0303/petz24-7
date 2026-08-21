import React from 'react';
import Svg, { Path } from 'react-native-svg';

const Heart = ({ width = 24, height = 24, color = '#777777', filled = false }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 20.5C12 20.5 4.5 14.8 4.5 9.2C4.5 6.6 6.5 4.5 9.1 4.5C10.6 4.5 12 5.3 12 5.3C12 5.3 13.4 4.5 14.9 4.5C17.5 4.5 19.5 6.6 19.5 9.2C19.5 14.8 12 20.5 12 20.5Z"
      stroke={color}
      strokeWidth="1.8"
      fill={filled ? color : 'none'}
    />
  </Svg>
);

export default Heart;
