import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import ScreenLayout from '../../components/view/ScreenLayout';
import AnimatedMenuItem from '../../components/view/AnimatedMenuItem';
import { MENU_ITEMS } from '../../constants/menuItems';
import { colors } from '../../styles/colors';
import { logout } from '../../redux/slices/authSlice';

const MenuScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [animateItems, setAnimateItems] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setAnimateItems(false);
      const timer = setTimeout(() => setAnimateItems(true), 50);
      return () => {
        clearTimeout(timer);
        setAnimateItems(false);
      };
    }, []),
  );

  const handleNavigate = item => {
    if (item.screen) {
      navigation.navigate(item.screen);
    } else if (item.tab) {
      navigation.navigate(item.tab);
    }
  };

  const menuItems = MENU_ITEMS.filter(item => item.id !== 'home');

  return (
    <ScreenLayout
      showSearch={false}
      title="Menu"
      headerBackgroundColor={colors.homeHeader}
      bodyBackgroundColor={colors.homeBody}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText style={styles.title}>Menu</AppText>
        <AppText style={styles.subtitle}>Browse shop, profile & more</AppText>

        {menuItems.map((item, index) => {
          const Icon = item.Icon;
          return (
            <AnimatedMenuItem
              key={item.id}
              index={index}
              visible={animateItems}
              onPress={() => handleNavigate(item)}
              style={styles.menuCard}>
              <View style={styles.iconWrap}>
                <Icon width={24} height={24} color={colors.primary} />
              </View>
              <AppText style={styles.menuLabel}>{item.label}</AppText>
            </AnimatedMenuItem>
          );
        })}

        <Button
          style={styles.logoutBtn}
          backgroundColor={colors.error}
          onPress={() => dispatch(logout())}>
          Logout
        </Button>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 20,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF5ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
  },
  logoutBtn: {
    marginTop: 24,
  },
});

export default MenuScreen;
