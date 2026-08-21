import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import AppText from './AppText';
import Button from './Button';
import AnimatedMenuItem from './AnimatedMenuItem';
import {
  Profile,
  Heart,
  Location,
  Calendar,
  Lock,
  Document,
  Shield,
  Phone,
} from '../icons';
import { useSidebar } from '../../context/SidebarContext';
import { useMoreMenuNavigation } from '../../hooks/useMoreMenuNavigation';
import { logout } from '../../redux/slices/authSlice';
import { colors } from '../../styles/colors';

const logoSource = require('../../assets/app-logo.png');
const SIDEBAR_WIDTH = Dimensions.get('window').width * 0.78;

const SidebarMenuItem = ({ label, icon: Icon, onPress, index, visible }) => (
  <AnimatedMenuItem index={index} visible={visible} onPress={onPress} style={styles.menuItem}>
    <View style={styles.menuIconWrap}>
      <Icon width={20} height={20} color={colors.primary} />
    </View>
    <AppText style={styles.menuLabel}>{label}</AppText>
  </AnimatedMenuItem>
);

const AppSidebar = () => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { visible, closeSidebar } = useSidebar();
  const menuNav = useMoreMenuNavigation(closeSidebar);
  const { user } = useSelector(state => state.auth);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      headerAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 9,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(headerAnim, {
          toValue: 1,
          delay: 120,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -SIDEBAR_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setModalVisible(false);
    });
  }, [visible, slideAnim, backdropAnim, headerAnim]);

  const handleLogout = () => {
    closeSidebar();
    setTimeout(() => {
      dispatch(logout());
    }, 220);
  };

  if (!modalVisible) return null;

  const headerStyle = {
    opacity: headerAnim,
    transform: [
      {
        translateY: headerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-12, 0],
        }),
      },
    ],
  };

  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: Profile, onPress: menuNav.goProfile },
    { id: 'wishlist', label: 'Your Wishlist', icon: Heart, onPress: menuNav.goWishlist },
    { id: 'address', label: 'Your Address', icon: Location, onPress: menuNav.goAddresses },
    { id: 'booking', label: 'My Booking', icon: Calendar, onPress: menuNav.goMyBooking },
    { id: 'password', label: 'Change Password', icon: Lock, onPress: menuNav.goChangePassword },
    { id: 'terms', label: 'Terms and Conditions', icon: Document, onPress: menuNav.goTerms },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield, onPress: menuNav.goPrivacyPolicy },
    { id: 'contact', label: 'Contact Us', icon: Phone, onPress: menuNav.goContactUs },
  ];

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeSidebar}>
      <View style={styles.overlay} pointerEvents="box-none">
        <Animated.View
          style={[styles.backdrop, { opacity: backdropAnim }]}
          pointerEvents={visible ? 'auto' : 'none'}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSidebar} />
        </Animated.View>

        <Animated.View
          pointerEvents="auto"
          style={[
            styles.sidebar,
            {
              width: SIDEBAR_WIDTH,
              paddingTop: insets.top + 16,
              paddingBottom: insets.bottom + 16,
              transform: [{ translateX: slideAnim }],
            },
          ]}>
          <Animated.View style={[styles.header, headerStyle]}>
            <Image source={logoSource} style={styles.logo} resizeMode="contain" />
            <AppText style={styles.userName}>{user?.name || 'Guest'}</AppText>
            <AppText style={styles.userEmail}>{user?.email || ''}</AppText>
          </Animated.View>

          <ScrollView
            style={styles.menuScroll}
            contentContainerStyle={styles.menuList}
            showsVerticalScrollIndicator={false}>
            {menuItems.map((item, index) => (
              <SidebarMenuItem
                key={item.id}
                index={index}
                visible={visible}
                label={item.label}
                icon={item.icon}
                onPress={item.onPress}
              />
            ))}
          </ScrollView>

          <Button
            style={styles.logoutBtn}
            backgroundColor={colors.error}
            onPress={handleLogout}>
            Logout
          </Button>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 2,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 16,
  },
  header: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: {
    width: 160,
    height: 53,
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryText,
  },
  userEmail: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 4,
  },
  menuScroll: {
    flex: 1,
  },
  menuList: {
    paddingBottom: 12,
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF5ED',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFE4CC',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
  },
  logoutBtn: {
    marginTop: 12,
  },
});

export default AppSidebar;
