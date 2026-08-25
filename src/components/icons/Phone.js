import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';

const Phone = ({ width = 24, height = 24, color }) => {
  const { colors } = useTheme();
  const resolvedColor = color ?? colors.primary;

  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.5 4.5h2.1l1.2 2.8-1.6 1.2a11 11 0 005.3 5.3l1.2-1.6 2.8 1.2v2.1a1.8 1.8 0 01-2 1.8C10.2 17.3 6.7 13.8 6.5 8.7a1.8 1.8 0 011.8-2.2z"
        stroke={resolvedColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Phone;
