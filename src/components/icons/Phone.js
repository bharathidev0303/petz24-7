import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../styles/colors';

const Phone = ({ width = 24, height = 24, color = colors.primary }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6.5 4h3l1.2 3.6a1.5 1.5 0 0 1-.4 1.4l-1.8 1.8a12.5 12.5 0 0 0 5.3 5.3l1.8-1.8a1.5 1.5 0 0 1 1.4-.4L20 14.5V17.5a2 2 0 0 1-2 2C10.1 19.5 4.5 13.9 4.5 6.5A2 2 0 0 1 6.5 4Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default Phone;
