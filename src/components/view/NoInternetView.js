import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '../AppText';
import Button from './Button';
import { colors } from '../../styles/colors';
import { APP_ERROR_MESSAGES, APP_ERROR_CODES } from '../../utils/apiError';

const NoInternetView = ({ onRetry, compact = false }) => (
  <View style={[styles.container, compact && styles.compact]}>
    <AppText style={styles.title}>No internet connection</AppText>
    <AppText style={styles.subtitle}>
      {APP_ERROR_MESSAGES[APP_ERROR_CODES.NO_INTERNET]}
    </AppText>
    {onRetry ? <Button onPress={onRetry}>Try again</Button> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  compact: {
    flex: 0,
    paddingVertical: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryText,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default NoInternetView;
