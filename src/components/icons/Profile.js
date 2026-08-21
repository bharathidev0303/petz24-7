import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

const Profile = ({ width = 24, height = 24, color = '#777777' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8" />
    <Path
      d="M5 20C5.8 16.7 8.6 15 12 15C15.4 15 18.2 16.7 19 20"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </Svg>
);

export default Profile;
