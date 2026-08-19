import React from 'react';
import Svg, { Path } from 'react-native-svg';

const BackArrow = () => (
  <Svg width="9" height="16" viewBox="0 0 9 16" fill="none">
    <Path
      d="M7.75 1L1 7.75L7.75 14.5"
      stroke="#2B2B2B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default BackArrow;
