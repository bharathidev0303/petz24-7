import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

const Cart = ({ width = 24, height = 24, color = '#777777' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 5H6.2L8.4 16.2C8.6 17.3 9.5 18.1 10.7 18.1H17.5C18.6 18.1 19.5 17.3 19.7 16.2L21 9H7"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="11" cy="20.5" r="1.2" fill={color} />
    <Circle cx="17" cy="20.5" r="1.2" fill={color} />
  </Svg>
);

export default Cart;
