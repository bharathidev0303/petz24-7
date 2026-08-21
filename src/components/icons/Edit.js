import React from 'react';
import Svg, { Path } from 'react-native-svg';

const Edit = ({ width = 20, height = 20, color = '#06294F' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill={color}>
    <Path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </Svg>
);

export default Edit;
