import { Home, Shop, Cart, Orders, Profile } from '../components/icons';

export const MENU_ITEMS = [
  { id: 'home', label: 'Home', tab: 'Home', Icon: Home },
  { id: 'shop', label: 'Shop', screen: 'Shop', Icon: Shop },
  { id: 'cart', label: 'Cart', tab: 'Cart', Icon: Cart },
  { id: 'orders', label: 'My Orders', tab: 'Orders', Icon: Orders },
  { id: 'addresses', label: 'Your Addresses', screen: 'AddressList', Icon: Profile },
  { id: 'profile', label: 'Profile', screen: 'Profile', Icon: Profile },
];
