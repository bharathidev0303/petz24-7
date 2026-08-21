import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

const Document = ({ width = 24, height = 24, color = '#777777' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 3H14L18 7V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V5C6 3.9 6.9 3 8 3Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <Path d="M14 3V7H18" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <Path d="M9 12H15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M9 16H13" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export default Document;
