/**
 * @format
 */

import 'react-native-gesture-handler';
import React from 'react';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import AppToast from './src/components/AppToast';
import NoInternetBanner from './src/components/view/NoInternetBanner';

const App = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <Provider store={store}>
      <SafeAreaProvider>
        <AppNavigator />
        <NoInternetBanner />
        <AppToast />
      </SafeAreaProvider>
    </Provider>
  </GestureHandlerRootView>
);

export default App;
