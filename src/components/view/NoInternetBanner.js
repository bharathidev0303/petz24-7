import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '../AppText';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useThemedStyles } from '../../theme/useThemedStyles';

const NoInternetBanner = () => {
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const { isOffline } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <View pointerEvents="none" style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.banner}>
        <AppText style={styles.title}>No internet connection</AppText>
        <AppText style={styles.subtitle}>Check your network and try again.</AppText>
      </View>
    </View>
  );
};

const createStyles = colors => ({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10000,
    elevation: 10000,
    paddingHorizontal: 16,
  },
  banner: {
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  title: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    color: colors.white,
    fontSize: 13,
    opacity: 0.95,
  },
});

export default NoInternetBanner;
