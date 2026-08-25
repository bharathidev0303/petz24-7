import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import SubScreenHeader from '../../components/view/SubScreenHeader';
import { Orders as OrdersIcon } from '../../components/icons';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';

const OrderProcessingScreen = () => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { orderNumber, orderId, message } = route.params || {};

  const order = {
    order_id: orderId,
    order_number: orderNumber,
    order_status: 'Placed',
    order_date: new Date().toLocaleDateString('en-GB'),
  };

  return (
    <View style={styles.container}>
      <SubScreenHeader title="Order Status" onBack={() => navigation.navigate('Tabs', { screen: 'Home' })} />

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <OrdersIcon width={56} height={56} color={colors.primary} />
        </View>

        <AppText style={styles.title}>Order placed successfully</AppText>
        <AppText style={styles.subtitle}>
          {message || 'Your order is being processed and will be updated soon.'}
        </AppText>

        {orderNumber ? (
          <View style={styles.orderCard}>
            <AppText style={styles.orderLabel}>Order number</AppText>
            <AppText style={styles.orderNumber}>{orderNumber}</AppText>
            <AppText style={styles.processingNote}>Processing your order...</AppText>
          </View>
        ) : null}

        <Button
          style={styles.primaryBtn}
          onPress={() =>
            navigation.replace('OrderDetail', {
              order,
            })
          }>
          View order details
        </Button>

        <Button
          backgroundColor={colors.white}
          textStyle={styles.secondaryBtnText}
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}>
          Continue shopping
        </Button>
      </View>
    </View>
  );
};

const createStyles = colors => ({
  container: {
    flex: 1,
    backgroundColor: colors.homeBody,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFF5ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  orderCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  orderLabel: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  processingNote: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  primaryBtn: {
    width: '100%',
    marginBottom: 12,
  },
  secondaryBtn: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.button,
  },
  secondaryBtnText: {
    color: colors.button,
  },
});

export default OrderProcessingScreen;
