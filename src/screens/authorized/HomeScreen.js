import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import AppText from '../../components/AppText';
import { colors } from '../../styles/colors';

const HomeScreen = () => {
  const { user } = useSelector(state => state.auth);

  return (
    <View style={styles.container}>
      <AppText style={styles.title}>Home</AppText>
      <AppText style={styles.subtitle}>
        Welcome, {user?.name || 'Guest'}!
      </AppText>
      <AppText style={styles.body}>
        Redux, API client, and navigation are wired up.
      </AppText>
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
    color: colors.primaryText,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.primary,
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    color: colors.secondaryText,
    lineHeight: 22,
  },
});

export default HomeScreen;
