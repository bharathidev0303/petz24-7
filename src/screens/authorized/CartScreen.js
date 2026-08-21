import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AppText from '../../components/AppText';
import ScreenLayout from '../../components/view/ScreenLayout';
import { useProductPreview } from '../../hooks/useProductPreview';
import { AppToastService } from '../../components/view/AppToast';
import { Cart as CartIcon, Close } from '../../components/icons';
import Button from '../../components/Button';
import { colors } from '../../styles/colors';
import { getAssetUrl } from '../../config/env';
import { cartAPI } from '../../api/cart';

const getLineTotal = item => {
  const price = Number(item.product_price) || 0;
  const units = Number(item.box_unit) || 1;
  return price * units;
};

const CartScreen = () => {
  const navigation = useNavigation();
  const { openPreview } = useProductPreview();
  const { user } = useSelector(state => state.auth);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const fetchCart = useCallback(
    async (isRefresh = false) => {
      if (!user?.id) {
        setItems([]);
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
        const response = await cartAPI.getCartItems(user.id);
        setItems(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.message || 'Could not load cart');
        setItems([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id],
  );

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart]),
  );

  const subtotal = items.reduce((sum, item) => sum + getLineTotal(item), 0);

  const handleRemove = async cartId => {
    if (!user?.id || removingId) return;

    setRemovingId(cartId);
    try {
      await cartAPI.removeCartItem({ user_id: user.id, cart_id: cartId });
      setItems(prev => prev.filter(item => String(item.cart_id) !== String(cartId)));
      AppToastService.show('Item removed from cart', 'success');
    } catch (err) {
      AppToastService.show(err.message || 'Could not remove item', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  const renderItem = ({ item }) => {
    const isRemoving = String(removingId) === String(item.cart_id);

    return (
      <View style={styles.itemCard}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => openPreview(item)}
          style={styles.itemPressable}>
          {item.product_image ? (
            <Image source={{ uri: getAssetUrl(item.product_image) }} style={styles.itemImage} />
          ) : (
            <View style={[styles.itemImage, styles.imagePlaceholder]} />
          )}
          <View style={styles.itemInfo}>
            <AppText style={styles.brand}>{item.brand_name}</AppText>
            <AppText style={styles.name} numberOfLines={2}>
              {item.product_name}
            </AppText>
            <AppText style={styles.variant}>
              {item.quantity} · Qty {item.box_unit}
            </AppText>
            <View style={styles.priceRow}>
              <AppText style={styles.price}>Rs. {getLineTotal(item)}</AppText>
              {Number(item.stock) <= 0 ? (
                <AppText style={styles.outOfStock}>Out of stock</AppText>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => handleRemove(item.cart_id)}
          disabled={isRemoving}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          {isRemoving ? (
            <ActivityIndicator size="small" color={colors.secondaryText} />
          ) : (
            <Close width={18} height={18} color={colors.secondaryText} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenLayout
        showSearch={false}
        title="Cart"
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
        title="Cart"
        headerBackgroundColor={colors.homeHeader}
        bodyBackgroundColor={colors.homeBody}>
        <View style={styles.centered}>
          <View style={styles.iconWrap}>
            <CartIcon width={56} height={56} color={colors.primary} />
          </View>
          <AppText style={styles.title}>Sign in to view your cart</AppText>
          <AppText style={styles.subtitle}>
            Log in to see items you have added and continue checkout.
          </AppText>
        </View>
      </ScreenLayout>
    );
  }

  if (error) {
    return (
      <ScreenLayout
        showSearch={false}
        title="Cart"
        headerBackgroundColor={colors.homeHeader}
        bodyBackgroundColor={colors.homeBody}>
        <View style={styles.centered}>
          <AppText style={styles.title}>{error}</AppText>
          <AppText style={styles.subtitle} onPress={() => fetchCart()}>
            Tap to retry
          </AppText>
        </View>
      </ScreenLayout>
    );
  }

  if (!items.length) {
    return (
      <ScreenLayout
        showSearch={false}
        title="Cart"
        headerBackgroundColor={colors.homeHeader}
        bodyBackgroundColor={colors.homeBody}>
        <View style={styles.centered}>
          <View style={styles.iconWrap}>
            <CartIcon width={56} height={56} color={colors.primary} />
          </View>
          <AppText style={styles.title}>Your cart is empty</AppText>
          <AppText style={styles.subtitle}>
            Add pet food, toys, and essentials from the shop to see them here.
          </AppText>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      showSearch={false}
      title="Cart"
      headerBackgroundColor={colors.homeHeader}
      bodyBackgroundColor={colors.homeBody}>
      <View style={styles.page}>
        <FlatList
          data={items}
          keyExtractor={item => String(item.cart_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchCart(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListFooterComponent={
            <View style={styles.footer}>
              <View style={styles.totalRow}>
                <AppText style={styles.totalLabel}>Subtotal</AppText>
                <AppText style={styles.totalValue}>Rs. {subtotal}</AppText>
              </View>
              <AppText style={styles.footerNote}>
                {items.length} item{items.length === 1 ? '' : 's'} in cart
              </AppText>
            </View>
          }
        />

        <View style={styles.checkoutBar}>
          <Button onPress={() => navigation.navigate('Checkout')}>Checkout</Button>
        </View>
      </View>
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
    paddingBottom: 120,
  },
  page: {
    flex: 1,
  },
  checkoutBar: {
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
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  itemPressable: {
    flex: 1,
    flexDirection: 'row',
  },
  itemImage: {
    width: 88,
    height: 88,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
  },
  imagePlaceholder: {
    backgroundColor: '#E8ECF0',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
    paddingRight: 8,
  },
  removeBtn: {
    alignSelf: 'flex-start',
    padding: 4,
    marginTop: 2,
  },
  brand: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 4,
  },
  variant: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  outOfStock: {
    fontSize: 12,
    color: '#D14343',
    fontWeight: '600',
  },
  footer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E4EA',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primaryText,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  footerNote: {
    fontSize: 13,
    color: colors.secondaryText,
  },
});

export default CartScreen;
