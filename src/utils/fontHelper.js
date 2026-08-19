import { Platform } from 'react-native';

export const Fonts = {
  Bold: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  Regular: Platform.select({ ios: 'System', android: 'sans-serif' }),
  Light: Platform.select({ ios: 'System', android: 'sans-serif-light' }),
};
