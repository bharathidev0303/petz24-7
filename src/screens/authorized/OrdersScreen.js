import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AppText from '../../components/AppText';
import ScreenLayout from '../../components/view/ScreenLayout';
import { Orders as OrdersIcon } from '../../components/icons';
import { colors } from '../../styles/colors';
import { ordersAPI } from '../../api/orders';

const PAGE_SIZE = 10;

const statusColor = status => {
  if (status === 'Cancelled') return colors.error;
  if (status === 'Shipped' || status === 'Confirmed') return colors.success;
  return colors.primary;
};

const OrdersScreen = () => {
  const navigation = useNavigation();
  const { user } = useSelector(state => state.auth);
  const [allOrders, setAllOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const visibleOrders = useMemo(
    () => allOrders.slice(0, page * PAGE_SIZE),
    [allOrders, page],
  );
  const hasMore = visibleOrders.length < allOrders.length;

  const fetchOrders = useCallback(
    async (isRefresh = false) => {
      if (!user?.id) {
        setAllOrders([]);
        setPage(1);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await ordersAPI.getMyOrders(user.id);
        setAllOrders(Array.isArray(response.orders) ? response.orders : []);
        setPage(1);
      } catch (err) {
        setError(err.message || 'Could not load orders');
        setAllOrders([]);
        setPage(1);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id],
  );

  const loadMore = useCallback(() => {
    if (!hasMore || loading || refreshing) return;
    setPage(prev => prev + 1);
  }, [hasMore, loading, refreshing]);

  const renderListFooter = () => {
    if (!hasMore && visibleOrders.length > 0) {
      return <AppText style={styles.endText}>No more orders</AppText>;
    }
    return null;
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { order: item })}>
      <View style={styles.orderHeader}>
        <AppText style={styles.orderNumber}>{item.order_number}</AppText>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor(item.order_status)}20` }]}>
          <AppText style={[styles.statusText, { color: statusColor(item.order_status) }]}>
            {item.order_status}
          </AppText>
        </View>
      </View>
      <AppText style={styles.meta}>{item.order_date}</AppText>
      <View style={styles.footerRow}>
        <AppText style={styles.meta}>
          {item.total_items} item{item.total_items === '1' ? '' : 's'}
        </AppText>
        <AppText style={styles.total}>Rs. {item.grand_total}</AppText>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScreenLayout
        showSearch={false}
        title="My Orders"
        headerBackgroundColor={colors.homeHeader}
        bodyBackgroundColor={colors.homeBody}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenLayout>
    );
  }

  if (!user?.id) {
    return (
      <ScreenLayout
        showSearch={false}
        title="My Orders"
        headerBackgroundColor={colors.homeHeader}
        bodyBackgroundColor={colors.homeBody}>
        <View style={styles.centered}>
          <View style={styles.iconWrap}>
            <OrdersIcon width={56} height={56} color={colors.primary} />
          </View>
          <AppText style={styles.title}>Sign in to view orders</AppText>
          <AppText style={styles.subtitle}>Your order history will appear here after login.</AppText>
        </View>
      </ScreenLayout>
    );
  }

  if (error) {
    return (
      <ScreenLayout
        showSearch={false}
        title="My Orders"
        headerBackgroundColor={colors.homeHeader}
        bodyBackgroundColor={colors.homeBody}>
        <View style={styles.centered}>
          <AppText style={styles.title}>{error}</AppText>
          <AppText style={styles.subtitle} onPress={() => fetchOrders()}>
            Tap to retry
          </AppText>
        </View>
      </ScreenLayout>
    );
  }

  if (!allOrders.length) {
    return (
      <ScreenLayout
        showSearch={false}
        title="My Orders"
        headerBackgroundColor={colors.homeHeader}
        bodyBackgroundColor={colors.homeBody}>
        <View style={styles.centered}>
          <View style={styles.iconWrap}>
            <OrdersIcon width={56} height={56} color={colors.primary} />
          </View>
          <AppText style={styles.title}>No orders yet</AppText>
          <AppText style={styles.subtitle}>
            Your product orders will appear here once you place them.
          </AppText>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      showSearch={false}
      title="My Orders"
      headerBackgroundColor={colors.homeHeader}
      bodyBackgroundColor={colors.homeBody}>
      <FlatList
        data={visibleOrders}
        keyExtractor={item => String(item.order_id)}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchOrders(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
        ListFooterComponent={renderListFooter}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
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
    fontSize: 22,
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
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  list: {
    flex: 1,
  },
  endText: {
    textAlign: 'center',
    color: colors.secondaryText,
    fontSize: 13,
    marginVertical: 16,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryText,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  meta: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default OrdersScreen;
