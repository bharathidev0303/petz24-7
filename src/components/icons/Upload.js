import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';

const Upload = ({ width = 18, height = 18, color }) => {
  const { colors } = useTheme();
  const resolvedColor = color ?? colors.primary;

  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16"
        stroke={resolvedColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Upload;
