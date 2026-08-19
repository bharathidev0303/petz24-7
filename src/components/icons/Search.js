import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

const Search = ({ width = 20, height = 20, color = '#999' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
    <Path d="M20 20L16.5 16.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export default Search;
