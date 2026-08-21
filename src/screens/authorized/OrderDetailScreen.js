import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppText from '../../components/AppText';
import SubScreenHeader from '../../components/view/SubScreenHeader';
import { colors } from '../../styles/colors';
import { ordersAPI } from '../../api/orders';

const orderItemsCache = new Map();

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <AppText style={styles.infoLabel}>{label}</AppText>
    <AppText style={styles.infoValue}>{value || '-'}</AppText>
  </View>
);

const OrderDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const order = route.params?.order;
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({});
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState(null);
  const loadedOrderRef = useRef(null);

  useEffect(() => {
    if (!order?.order_number) return;

    const cacheKey = String(order.order_number);
    const cached = orderItemsCache.get(cacheKey);
    if (cached) {
      setItems(cached.items);
      setMeta(cached.meta);
      loadedOrderRef.current = cacheKey;
      return;
    }

    if (loadedOrderRef.current === cacheKey) return;

    let active = true;
    setLoadingItems(true);
    setItemsError(null);

    ordersAPI
      .getOrderItems(order.order_number)
      .then(response => {
        if (!active) return;
        orderItemsCache.set(cacheKey, response);
        loadedOrderRef.current = cacheKey;
        setItems(response.items || []);
        setMeta(response.meta || {});
      })
      .catch(err => {
        if (!active) return;
        setItemsError(err.message || 'Could not load order items');
        setItems([]);
      })
      .finally(() => {
        if (active) setLoadingItems(false);
      });

    return () => {
      active = false;
    };
  }, [order?.order_number]);

  if (!order) {
    return (
      <View style={styles.container}>
        <SubScreenHeader title="Order Details" onBack={() => navigation.goBack()} />
        <View style={styles.centered}>
          <AppText style={styles.errorText}>Order not found</AppText>
        </View>
      </View>
    );
  }

  const statusColor =
    order.order_status === 'Cancelled'
      ? colors.error
      : order.order_status === 'Shipped' || order.order_status === 'Confirmed'
        ? colors.success
        : colors.primary;

  return (
    <View style={styles.container}>
      <SubScreenHeader title="Order Details" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <AppText style={styles.orderNumber}>{order.order_number}</AppText>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <AppText style={[styles.statusText, { color: statusColor }]}>
              {order.order_status || 'Placed'}
            </AppText>
          </View>

          {order.order_date ? <InfoRow label="Order date" value={order.order_date} /> : null}
          {order.total_items ? <InfoRow label="Total items" value={order.total_items} /> : null}
          {order.grand_total ? <InfoRow label="Grand total" value={`Rs. ${order.grand_total}`} /> : null}
          {order.order_id ? <InfoRow label="Order ID" value={String(order.order_id)} /> : null}
        </View>

        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>Order items</AppText>

          {loadingItems ? (
            <ActivityIndicator color={colors.primary} style={styles.itemsLoader} />
          ) : itemsError ? (
            <AppText style={styles.errorText}>{itemsError}</AppText>
          ) : items.length ? (
            items.map((item, index) => (
              <View
                key={`${item.product_name}-${index}`}
                style={[styles.itemRow, index === items.length - 1 && styles.itemRowLast]}>
                <View style={styles.itemInfo}>
                  <AppText style={styles.itemName}>{item.product_name}</AppText>
                  <AppText style={styles.itemQty}>{item.quantity}</AppText>
                </View>
                <AppText style={styles.itemTotal}>{item.total}</AppText>
              </View>
            ))
          ) : (
            <AppText style={styles.bodyText}>No items found for this order.</AppText>
          )}
        </View>

        {meta.message || meta.payment_mode || meta.payment_status ? (
          <View style={styles.card}>
            <AppText style={styles.sectionTitle}>Payment</AppText>
            {meta.message ? <AppText style={styles.bodyText}>{meta.message}</AppText> : null}
            {meta.payment_mode ? (
              <InfoRow label="Payment mode" value={meta.payment_mode} />
            ) : null}
            {meta.payment_status ? (
              <InfoRow label="Payment status" value={meta.payment_status} />
            ) : null}
            {meta.shipping_charge ? (
              <InfoRow label="Shipping charge" value={meta.shipping_charge} />
            ) : null}
          </View>
        ) : null}

        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>Order status</AppText>
          <AppText style={styles.bodyText}>
            Your order is currently marked as {(order.order_status || 'Placed').toLowerCase()}.
            We will notify you when the status changes.
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.homeBody,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 10,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
    maxWidth: '58%',
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 21,
  },
  itemsLoader: {
    marginVertical: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  itemRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 4,
  },
  itemQty: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
  },
});

export default OrderDetailScreen;
