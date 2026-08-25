import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import SubScreenHeader from '../../components/view/SubScreenHeader';
import AddressCard from '../../components/view/AddressCard';
import { AppToastService } from '../../components/view/AppToast';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';
import { addressAPI } from '../../api/address';
import { ordersAPI } from '../../api/orders';

const CheckoutScreen = () => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const orderType = route.params?.orderType || 'cart';
  const { user } = useSelector(state => state.auth);
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);

  const fetchAddresses = useCallback(
    async (isRefresh = false) => {
      if (!user?.id) return;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const list = await addressAPI.getUserAddress(user.id);
        setAddresses(list);
        setSelectedId(prev => {
          if (prev && list.some(item => String(item.address_id) === String(prev))) {
            return prev;
          }
          return list[0]?.address_id || null;
        });
      } catch (err) {
        setError(err.message || 'Could not load addresses');
        setAddresses([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id],
  );

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [fetchAddresses]),
  );

  const handlePlaceOrder = async () => {
    if (!user?.id || !selectedId || placing) return;

    setPlacing(true);
    try {
      const response = await ordersAPI.placeOrder({
        user_id: user.id,
        address_id: selectedId,
        order_type: orderType,
      });

      navigation.replace('OrderProcessing', {
        orderId: response.order_id,
        orderNumber: response.order_number,
        message: response.message,
      });
    } catch (err) {
      AppToastService.show(err.message || 'Could not place order', 'error');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SubScreenHeader title="Checkout" onBack={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SubScreenHeader title="Checkout" onBack={() => navigation.goBack()} />

      {error ? (
        <View style={styles.centered}>
          <AppText style={styles.errorText}>{error}</AppText>
          <Button onPress={() => fetchAddresses()}>Retry</Button>
        </View>
      ) : (
        <>
          <FlatList
            data={addresses}
            keyExtractor={item => String(item.address_id)}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchAddresses(true)}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            ListHeaderComponent={
              <AppText style={styles.sectionTitle}>Select delivery address</AppText>
            }
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <AppText style={styles.emptyText}>No saved addresses yet.</AppText>
                <Button onPress={() => navigation.navigate('AddAddress')}>Add Address</Button>
              </View>
            }
            renderItem={({ item }) => (
              <AddressCard
                address={item}
                selected={String(selectedId) === String(item.address_id)}
                onPress={() => setSelectedId(item.address_id)}
              />
            )}
            ListFooterComponent={
              addresses.length ? (
                <Button
                  style={styles.addBtn}
                  backgroundColor={colors.white}
                  textStyle={styles.addBtnText}
                  onPress={() => navigation.navigate('AddAddress')}>
                  + Add new address
                </Button>
              ) : null
            }
          />

          {addresses.length ? (
            <View style={styles.bottomBar}>
              <Button loading={placing} onPress={handlePlaceOrder}>
                Place Order
              </Button>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
};

const createStyles = colors => ({
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
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 12,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  addBtn: {
    borderWidth: 1,
    borderColor: colors.button,
    marginTop: 4,
  },
  addBtnText: {
    color: colors.button,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

export default CheckoutScreen;
