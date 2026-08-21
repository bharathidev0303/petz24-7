import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../styles/colors';

const ContactUs = ({ width = 120, height = 120, color = colors.primary }) => (
  <Svg width={width} height={height} viewBox="0 0 120 120" fill="none">
    <Circle cx="60" cy="60" r="56" fill="#FFF5ED" stroke="#FFE4CC" strokeWidth="2" />
    <Path
      d="M38 48h44v28H38V48Z"
      stroke={color}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <Path
      d="M38 48l22 16 22-16"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M78 72c4.5 0 8.5 1.2 11.8 3.2"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
    />
    <Path
      d="M78 84c6.8 0 12.8 2.2 17.2 5.8"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
    />
    <Path
      d="M42 72h8M42 80h14"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
    />
  </Svg>
);

export default ContactUs;
