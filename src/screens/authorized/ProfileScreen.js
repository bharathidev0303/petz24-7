import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import SubScreenHeader from '../../components/view/SubScreenHeader';
import { Profile as ProfileIcon } from '../../components/icons';
import { colors } from '../../styles/colors';
import { logout } from '../../redux/slices/authSlice';

const MenuRow = ({ label, onPress, isLast = false }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    style={[styles.menuRow, isLast && styles.menuRowLast]}>
    <AppText style={styles.menuText}>{label}</AppText>
    <AppText style={styles.menuArrow}>›</AppText>
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useSelector(state => state.auth);

  return (
    <View style={styles.container}>
      <SubScreenHeader title="Profile" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarWrap}>
          <ProfileIcon width={48} height={48} color={colors.primary} />
        </View>

        <AppText style={styles.title}>{user?.name || 'Guest'}</AppText>
        <AppText style={styles.email}>{user?.email || '-'}</AppText>

        <View style={styles.infoCard}>
          <AppText style={styles.label}>Mobile</AppText>
          <AppText style={styles.value}>{user?.mobile || '-'}</AppText>
        </View>

        <View style={styles.infoCard}>
          <AppText style={styles.label}>Account</AppText>
          <MenuRow
            label="Manage Address"
            onPress={() => navigation.navigate('AddressList')}
          />
          <MenuRow
            label="Manage Pet"
            onPress={() => navigation.navigate('ManagePet')}
          />
          <MenuRow
            label="Contact Us"
            onPress={() => navigation.navigate('Contact')}
            isLast
          />
        </View>

        <Button
          style={styles.logoutBtn}
          backgroundColor={colors.error}
          onPress={() => dispatch(logout())}>
          Logout
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  avatarWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFF5ED',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 8,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: colors.primaryText,
    marginBottom: 6,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuText: {
    fontSize: 16,
    color: colors.primaryText,
  },
  menuArrow: {
    fontSize: 22,
    color: colors.secondaryText,
  },
  logoutBtn: {
    marginTop: 12,
  },
});

export default ProfileScreen;
