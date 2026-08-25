import React from 'react';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import { normalizeVegNonVeg } from '../../utils/vegNonVeg';

const VegNonVegIcon = ({ value, size = 16 }) => {
  const type = normalizeVegNonVeg(value);
  if (!type) return null;

  if (type === 'veg') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Rect x="2" y="2" width="20" height="20" rx="1" stroke="#008000" strokeWidth="2" fill="#FFFFFF" />
        <Circle cx="12" cy="12" r="5" fill="#008000" />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="2" y="2" width="20" height="20" rx="1" stroke="#C62828" strokeWidth="2" fill="#FFFFFF" />
      <Path d="M12 7 L17 17 H7 Z" fill="#C62828" />
    </Svg>
  );
};

export default VegNonVegIcon;
