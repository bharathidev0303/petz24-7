import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import { colors } from '../../styles/colors';
import { logout } from '../../redux/slices/authSlice';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  return (
    <View style={styles.container}>
      <AppText style={styles.title}>Profile</AppText>
      <AppText style={styles.label}>Name</AppText>
      <AppText style={styles.value}>{user?.name || '-'}</AppText>
      <AppText style={styles.label}>Email</AppText>
      <AppText style={styles.value}>{user?.email || '-'}</AppText>

      <Button
        style={styles.logoutBtn}
        backgroundColor={colors.error}
        onPress={() => dispatch(logout())}>
        Logout
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: colors.primaryText,
  },
  label: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: colors.primaryText,
    marginBottom: 16,
  },
  logoutBtn: {
    marginTop: 24,
  },
});

export default ProfileScreen;
