import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
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
import { useThemedStyles } from '../theme/useThemedStyles';
import { useTheme } from '../theme/ThemeContext';

const Stack = createStackNavigator();

const LoadingScreen = () => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, authInitialized, loading } = useSelector(state => state.auth);
  const { colors, isDark } = useTheme();
  const [showSplash, setShowSplash] = useState(true);

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.primaryText,
      border: colors.border,
    },
  };

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
      <SidebarProvider>
        <NavigationContainer ref={mainStackRef} theme={navigationTheme}>
          <MenuSheetProvider>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {isAuthenticated ? (
                <Stack.Screen name="MainApp" component={MainAppStack} />
              ) : (
                <Stack.Screen name="Auth" component={AuthStack} />
              )}
            </Stack.Navigator>
          </MenuSheetProvider>
        </NavigationContainer>
        {isAuthenticated ? <AppSidebar /> : null}
      </SidebarProvider>
      {loading && <LoadingScreen />}
    </>
  );
};

const createStyles = colors => ({
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});

export default AppNavigator;
