import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import AuthStack from './stacks/AuthStack';
import MainAppStack from './MainAppStack';
import AppSidebar from '../components/view/AppSidebar';
import SplashScreen from '../components/view/SplashScreen';
import { SidebarProvider } from '../context/SidebarContext';
import { MenuSheetProvider } from '../context/MenuSheetContext';
import { mainStackRef } from './navigateFromSidebar';
import { checkAuthStatus } from '../redux/slices/authSlice';
import { colors } from '../styles/colors';

const Stack = createStackNavigator();

const LoadingScreen = () => (
  <View style={styles.loading}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, authInitialized, loading } = useSelector(state => state.auth);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!authInitialized) {
      dispatch(checkAuthStatus());
    }
  }, [authInitialized, dispatch]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!authInitialized) {
    return <LoadingScreen />;
  }

  return (
    <>
      <NavigationContainer ref={mainStackRef}>
        <SidebarProvider>
          <MenuSheetProvider>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {isAuthenticated ? (
                <Stack.Screen name="MainApp" component={MainAppStack} />
              ) : (
                <Stack.Screen name="Auth" component={AuthStack} />
              )}
            </Stack.Navigator>
            {isAuthenticated ? <AppSidebar /> : null}
          </MenuSheetProvider>
        </SidebarProvider>
      </NavigationContainer>
      {loading && <LoadingScreen />}
    </>
  );
};

const styles = StyleSheet.create({
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});

export default AppNavigator;
