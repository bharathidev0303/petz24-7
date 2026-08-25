import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/authorized/HomeScreen';
import CartScreen from '../screens/authorized/CartScreen';
import OrdersScreen from '../screens/authorized/OrdersScreen';
import MenuPlaceholderScreen from '../screens/authorized/MenuPlaceholderScreen';
import AnimatedTabIcon from '../components/view/AnimatedTabIcon';
import MenuBottomSheet from '../components/view/MenuBottomSheet';
import { useMenuSheet } from '../context/MenuSheetContext';
import { useSidebar } from '../context/SidebarContext';
import { Home, Cart, Orders, Menu, UpArrow, ChevronDown } from '../components/icons';
import { useThemedStyles } from '../theme/useThemedStyles';
import { useTheme } from '../theme/ThemeContext';
import {
  getTabBarStyle,
  getTabBarStyleCompact,
  TAB_LABEL_STYLE,
} from './tabBarConfig';

const Tab = createBottomTabNavigator();

const tabIcons = {
  Home,
  Cart,
  Orders,
};

const BottomTabNavigatorContent = () => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { toggleMenuSheet, closeMenuSheet, visible: menuOpen } = useMenuSheet();
  const { toggleSidebar, closeSidebar, visible: sidebarOpen } = useSidebar();

  const closeOverlaysOnTabPress = () => ({
    tabPress: () => {
      closeMenuSheet();
      closeSidebar();
    },
  });

  const handleToggleMore = () => {
    closeSidebar();
    toggleMenuSheet();
  };

  const handleToggleMenu = () => {
    closeMenuSheet();
    toggleSidebar();
  };

  return (
    <View style={styles.navWrap}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          animation: 'shift',
          transitionSpec: {
            animation: 'spring',
            config: {
              stiffness: 900,
              damping: 520,
              mass: 3,
              overshootClamping: true,
            },
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.secondaryText,
          tabBarLabelStyle: TAB_LABEL_STYLE,
          tabBarStyle: menuOpen ? getTabBarStyleCompact(colors) : getTabBarStyle(colors),
          tabBarIcon: ({ color, size, focused }) => {
            const Icon = tabIcons[route.name];
            return Icon ? (
              <AnimatedTabIcon focused={focused} color={color} size={size} Icon={Icon} />
            ) : null;
          },
        })}>
        <Tab.Screen name="Home" component={HomeScreen} listeners={closeOverlaysOnTabPress} />
        <Tab.Screen name="Cart" component={CartScreen} listeners={closeOverlaysOnTabPress} />
        <Tab.Screen name="Orders" component={OrdersScreen} listeners={closeOverlaysOnTabPress} />
        <Tab.Screen
          name="More"
          component={MenuPlaceholderScreen}
          options={{
            tabBarLabel: 'More',
            tabBarLabelStyle: [TAB_LABEL_STYLE, menuOpen && styles.moreLabelActive],
            tabBarIcon: ({ color, size }) => {
              const Icon = menuOpen ? ChevronDown : UpArrow;
              const iconColor = menuOpen ? colors.primary : color;
              return (
                <AnimatedTabIcon focused={menuOpen} color={iconColor} size={size} Icon={Icon} />
              );
            },
          }}
          listeners={{
            tabPress: e => {
              e.preventDefault();
              handleToggleMore();
            },
          }}
        />
        <Tab.Screen
          name="Menu"
          component={MenuPlaceholderScreen}
          options={{
            tabBarLabel: 'Menu',
            tabBarLabelStyle: [TAB_LABEL_STYLE, sidebarOpen && styles.menuLabelActive],
            tabBarIcon: ({ color, size }) => (
              <AnimatedTabIcon
                focused={sidebarOpen}
                color={sidebarOpen ? colors.primary : color}
                size={size}
                Icon={Menu}
              />
            ),
          }}
          listeners={{
            tabPress: e => {
              e.preventDefault();
              handleToggleMenu();
            },
          }}
        />
      </Tab.Navigator>
      <MenuBottomSheet />
    </View>
  );
};

const BottomTabNavigator = () => <BottomTabNavigatorContent />;

const createStyles = colors => ({
  navWrap: {
    flex: 1,
  },
  moreLabelActive: {
    color: colors.primary,
  },
  menuLabelActive: {
    color: colors.primary,
  },
});

export default BottomTabNavigator;
