import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../../screens/authorized/HomeScreen';
import ProfileScreen from '../../screens/authorized/ProfileScreen';
import { colors } from '../../styles/colors';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.secondaryText,
      tabBarStyle: {
        borderTopColor: colors.border,
        paddingBottom: 4,
        height: 56,
      },
    }}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default BottomTabNavigator;
