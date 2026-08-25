import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '../AppText';
import Button from './Button';
import NoInternetView from './NoInternetView';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { getUserErrorMessage, isNoInternetMessage } from '../../utils/apiError';

const RequestErrorState = ({ error, onRetry, fallbackMessage = 'Something went wrong. Please try again.' }) => {
  const styles = useThemedStyles(createStyles);
  if (isNoInternetMessage(error)) {
    return <NoInternetView onRetry={onRetry} />;
  }

  return (
    <View style={styles.container}>
      <AppText style={styles.errorText}>{getUserErrorMessage({ message: error }, fallbackMessage)}</AppText>
      {onRetry ? <Button onPress={onRetry}>Retry</Button> : null}
    </View>
  );
};

const createStyles = colors => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
});

export default RequestErrorState;
