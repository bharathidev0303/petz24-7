import React from 'react';
import { TextInput } from 'react-native';

const AppInput = ({ style, ref, ...props }) => (
  <TextInput ref={ref} {...props} style={[{ fontSize: 16 }, style]} />
);

export default AppInput;
