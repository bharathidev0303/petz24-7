/**
 * @format
 */

import 'react-native-gesture-handler';
import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import AppToast from './src/components/AppToast';

const App = () => (
  <Provider store={store}>
    <SafeAreaProvider>
      <AppNavigator />
      <AppToast />
    </SafeAreaProvider>
  </Provider>
);

export default App;
