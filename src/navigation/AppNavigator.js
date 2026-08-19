import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AuthStack from './stacks/AuthStack';
import BottomTabNavigator from './BottomTabNavigator';
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
  const { isAuthenticated, authInitialized, loading } = useSelector(
    state => state.auth,
  );

  useEffect(() => {
    if (!authInitialized) {
      dispatch(checkAuthStatus());
    }
  }, [authInitialized, dispatch]);

  if (!authInitialized) {
    return <LoadingScreen />;
  }

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <Stack.Screen name="Auth" component={AuthStack} />
          ) : (
            <Stack.Screen name="Main" component={BottomTabNavigator} />
          )}
        </Stack.Navigator>
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
