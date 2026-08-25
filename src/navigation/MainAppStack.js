import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import ProfileScreen from '../screens/authorized/ProfileScreen';
import ShopScreen from '../screens/authorized/ShopScreen';
import CheckoutScreen from '../screens/authorized/CheckoutScreen';
import OrderProcessingScreen from '../screens/authorized/OrderProcessingScreen';
import AddressListScreen from '../screens/authorized/AddressListScreen';
import AddAddressScreen from '../screens/authorized/AddAddressScreen';
import OrderDetailScreen from '../screens/authorized/OrderDetailScreen';
import ProductDetailScreen from '../screens/authorized/ProductDetailScreen';
import SearchScreen from '../screens/authorized/SearchScreen';
import WishlistScreen from '../screens/authorized/WishlistScreen';
import StaticContentScreen from '../screens/authorized/StaticContentScreen';
import BookingScreen from '../screens/authorized/BookingScreen';
import DoctorBookingScreen from '../screens/authorized/DoctorBookingScreen';
import QuickBookingScreen from '../screens/authorized/QuickBookingScreen';
import MyBookingScreen from '../screens/authorized/MyBookingScreen';
import BookingDetailScreen from '../screens/authorized/BookingDetailScreen';
import ContactScreen from '../screens/authorized/ContactScreen';
import ManagePetScreen from '../screens/authorized/ManagePetScreen';
import AddEditPetScreen from '../screens/authorized/AddEditPetScreen';
import ChatDoctorScreen from '../screens/authorized/ChatDoctorScreen';
import ChatDoctorBookingScreen from '../screens/authorized/ChatDoctorBookingScreen';
import AppearanceScreen from '../screens/authorized/AppearanceScreen';

const Stack = createStackNavigator();

export const stackTransition = {
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  transitionSpec: {
    open: {
      animation: 'spring',
      config: {
        stiffness: 900,
        damping: 500,
        mass: 3,
        overshootClamping: true,
      },
    },
    close: {
      animation: 'spring',
      config: {
        stiffness: 900,
        damping: 500,
        mass: 3,
        overshootClamping: true,
      },
    },
  },
};

const MainAppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={BottomTabNavigator} />
    <Stack.Screen name="Search" component={SearchScreen} options={stackTransition} />
    <Stack.Screen name="Shop" component={ShopScreen} options={stackTransition} />
    <Stack.Screen name="Profile" component={ProfileScreen} options={stackTransition} />
    <Stack.Screen name="Appearance" component={AppearanceScreen} options={stackTransition} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={stackTransition} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} options={stackTransition} />
    <Stack.Screen name="OrderProcessing" component={OrderProcessingScreen} options={stackTransition} />
    <Stack.Screen name="AddressList" component={AddressListScreen} options={stackTransition} />
    <Stack.Screen name="AddAddress" component={AddAddressScreen} options={stackTransition} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={stackTransition} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} options={stackTransition} />
    <Stack.Screen name="StaticContent" component={StaticContentScreen} options={stackTransition} />
    <Stack.Screen name="Booking" component={BookingScreen} options={stackTransition} />
    <Stack.Screen name="DoctorBooking" component={DoctorBookingScreen} options={stackTransition} />
    <Stack.Screen name="ChatDoctor" component={ChatDoctorScreen} options={stackTransition} />
    <Stack.Screen name="ChatDoctorBooking" component={ChatDoctorBookingScreen} options={stackTransition} />
    <Stack.Screen name="QuickBooking" component={QuickBookingScreen} options={stackTransition} />
    <Stack.Screen name="MyBooking" component={MyBookingScreen} options={stackTransition} />
    <Stack.Screen name="BookingDetail" component={BookingDetailScreen} options={stackTransition} />
    <Stack.Screen name="Contact" component={ContactScreen} options={stackTransition} />
    <Stack.Screen name="ManagePet" component={ManagePetScreen} options={stackTransition} />
    <Stack.Screen name="AddEditPet" component={AddEditPetScreen} options={stackTransition} />
  </Stack.Navigator>
);

export default MainAppStack;
