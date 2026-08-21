import React from 'react';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { colors } from '../../styles/colors';

const AppLogo = ({ size = 120 }) => (
  <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <Circle cx="60" cy="60" r="58" fill={colors.primary} />
    <Circle cx="45" cy="42" r="7" fill="#FFFFFF" />
    <Circle cx="75" cy="42" r="7" fill="#FFFFFF" />
    <Circle cx="60" cy="58" r="7" fill="#FFFFFF" />
    <Circle cx="48" cy="72" r="6" fill="#FFFFFF" />
    <Circle cx="72" cy="72" r="6" fill="#FFFFFF" />
    <Path
      d="M52 88C56 92 64 92 68 88"
      stroke="#FFFFFF"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <SvgText
      x="60"
      y="108"
      fill="#FFFFFF"
      fontSize="11"
      fontWeight="700"
      textAnchor="middle">
      Petz 24x7
    </SvgText>
  </Svg>
);

export default AppLogo;
