import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import SubScreenHeader from '../../components/view/SubScreenHeader';
import ProductImageCarousel from '../../components/view/ProductImageCarousel';
import { Heart, VegNonVegIcon } from '../../components/icons';
import { AppToastService } from '../../components/view/AppToast';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';
import { getAssetUrl } from '../../config/env';
import { productsAPI } from '../../api/products';
import { cartAPI } from '../../api/cart';
import { wishlistAPI } from '../../api/wishlist';
import {
  getQuantityLabel,
  getQuantityVariant,
  resolveSelectedQuantity,
} from '../../utils/productQuantity';

const TABS = [
  { id: 'summary', label: 'Summary' },
  { id: 'description', label: 'Description' },
  { id: 'instruction', label: 'Instructions' },
];

const MAX_BOX_UNIT = 99;

const ProductDetailScreen = () => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { user } = useSelector(state => state.auth);
  const { productId, previewProduct } = route.params || {};

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQty, setSelectedQty] = useState(null);
  const [boxUnit, setBoxUnit] = useState(1);
  const [activeTab, setActiveTab] = useState('summary');
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await productsAPI.getProductDetails(productId);
      const data = response.data;
      setDetails(data);

      const previewQtyLabel = getQuantityLabel(previewProduct?.quantity);
      const previewVariant = getQuantityVariant(previewProduct?.quantity);
      const preferredQty = previewVariant
        ? data.quantities?.find(
            q => String(q.product_quantity_id) === String(previewVariant.product_quantity_id),
          )
        : previewQtyLabel
          ? data.quantities?.find(
              q => String(q.quantity).toLowerCase() === previewQtyLabel.toLowerCase(),
            )
          : null;
      const inStock = data.quantities?.find(q => Number(q.stock) > 0);
      setSelectedQty(preferredQty || inStock || data.quantities?.[0] || null);
    } catch (err) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [productId, previewProduct?.quantity]);

  const fetchWishlistStatus = useCallback(async () => {
    if (!user?.id || !productId) {
      setInWishlist(false);
      return;
    }

    try {
      const response = await wishlistAPI.checkProductInWishlist({
        product_id: productId,
        user_id: user.id,
      });
      setInWishlist(Boolean(response.in_wishlist));
    } catch {
      setInWishlist(false);
    }
  }, [productId, user?.id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    fetchWishlistStatus();
  }, [fetchWishlistStatus]);

  const requireLogin = () => {
    AppToastService.show('Please sign in to continue', 'warning');
    return false;
  };

  const getResolvedQuantity = () => {
    const qty = resolveSelectedQuantity(selectedQty, previewProduct);
    if (!qty?.quantity) return null;
    return {
      ...qty,
      quantity: getQuantityLabel(qty.quantity) || qty.quantity,
    };
  };

  const handleDecrease = () => {
    if (outOfStock) return;
    setBoxUnit(prev => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    if (outOfStock) return;
    setBoxUnit(prev => Math.min(MAX_BOX_UNIT, prev + 1));
  };

  const handleToggleWishlist = async () => {
    if (!user?.id) {
      requireLogin();
      return;
    }
    if (wishlistLoading) return;

    setWishlistLoading(true);
    try {
      const type = inWishlist ? 'remove' : 'add';
      const response = await wishlistAPI.updateWishlist({
        product_id: productId,
        user_id: user.id,
        type,
      });
      setInWishlist(type === 'add');
      AppToastService.show(
        response.message ||
          (type === 'add' ? 'Added to wishlist' : 'Removed from wishlist'),
        'success',
      );
    } catch (err) {
      AppToastService.show(err.message || 'Could not update wishlist', 'error');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const qty = getResolvedQuantity();
    if (!qty?.quantity) {
      AppToastService.show('Please select a quantity', 'warning');
      return;
    }

    setAddingToCart(true);
    try {
      await cartAPI.addToCart({
        product_id: Number(productId),
        quantity: qty.quantity,
        box_unit: boxUnit,
      });
      AppToastService.show('Added to cart', 'success');
    } catch (err) {
      AppToastService.show(err.message || 'Could not add to cart', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user?.id) {
      requireLogin();
      return;
    }

    const qty = getResolvedQuantity();
    if (!qty?.quantity) {
      AppToastService.show('Please select a quantity', 'warning');
      return;
    }

    setBuyingNow(true);
    try {
      await cartAPI.buyNow({
        product_id: Number(productId),
        user_id: user.id,
        quantity: qty.quantity,
        box_unit: boxUnit,
      });
      navigation.navigate('Checkout', { orderType: 'buy_now' });
    } catch (err) {
      AppToastService.show(err.message || 'Could not proceed to checkout', 'error');
    } finally {
      setBuyingNow(false);
    }
  };

  const productImages = useMemo(() => {
    const fromDetails = (details?.images || [])
      .map(img => getAssetUrl(img?.url))
      .filter(Boolean);

    if (fromDetails.length) return fromDetails;

    const fallback = getAssetUrl(previewProduct?.url || previewProduct?.product_image);
    return fallback ? [fallback] : [];
  }, [details?.images, previewProduct?.url, previewProduct?.product_image]);

  const displayName = details?.name || previewProduct?.name || previewProduct?.product_name;
  const displayBrand = details?.brand_name || previewProduct?.brand_name;
  const displayPrice =
    selectedQty?.price ||
    previewProduct?.price ||
    previewProduct?.min_price ||
    details?.quantities?.[0]?.price;

  const tabContent = {
    summary: details?.summery,
    description: details?.description,
    instruction: details?.instruction,
  }[activeTab];

  const outOfStock = selectedQty && Number(selectedQty.stock) <= 0;
  const canDecrease = !outOfStock && boxUnit > 1;
  const canIncrease = !outOfStock && boxUnit < MAX_BOX_UNIT;

  if (loading) {
    return (
      <View style={styles.screen}>
        <SubScreenHeader title="Product Details" onBack={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.screen}>
        <SubScreenHeader title="Product Details" onBack={() => navigation.goBack()} />
        <View style={styles.centered}>
          <AppText style={styles.errorText}>{error}</AppText>
          <Button style={styles.retryBtn} onPress={fetchDetails}>
            Retry
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <SubScreenHeader title="Product Details" onBack={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <ProductImageCarousel images={productImages} />

        {displayBrand ? (
          <AppText style={styles.brand} numberOfLines={2}>
            {displayBrand}
          </AppText>
        ) : null}
        {displayName ? <AppText style={styles.name}>{displayName}</AppText> : null}

        {details?.veg_nonveg ? (
          <View style={styles.badge}>
            <VegNonVegIcon value={details.veg_nonveg} size={18} />
          </View>
        ) : null}

        {displayPrice ? <AppText style={styles.price}>Rs. {displayPrice}</AppText> : null}

        {details?.quantities?.length ? (
          <View style={styles.section}>
            <AppText style={styles.sectionLabel}>Select size</AppText>
            <View style={styles.qtyRow}>
              {details.quantities.map(qty => {
                const isSelected =
                  selectedQty?.product_quantity_id === qty.product_quantity_id;
                const variantOutOfStock = Number(qty.stock) <= 0;

                return (
                  <Pressable
                    key={qty.product_quantity_id}
                    disabled={variantOutOfStock}
                    onPress={() => {
                      setSelectedQty(qty);
                      setBoxUnit(1);
                    }}
                    style={[
                      styles.qtyChip,
                      isSelected && styles.qtyChipActive,
                      variantOutOfStock && styles.qtyChipDisabled,
                    ]}>
                    <AppText
                      style={[
                        styles.qtyText,
                        isSelected && styles.qtyTextActive,
                        variantOutOfStock && styles.qtyTextDisabled,
                      ]}>
                      {qty.quantity}
                    </AppText>
                    <AppText
                      style={[
                        styles.qtyPrice,
                        isSelected && styles.qtyTextActive,
                        variantOutOfStock && styles.qtyTextDisabled,
                      ]}>
                      Rs. {qty.price}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <AppText style={styles.sectionLabel}>Quantity</AppText>
          <View style={styles.stepperRow}>
            <Pressable
              style={[styles.stepperBtn, !canDecrease && styles.stepperBtnDisabled]}
              onPress={handleDecrease}
              disabled={!canDecrease}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity">
              <AppText style={styles.stepperBtnText}>−</AppText>
            </Pressable>
            <AppText style={styles.stepperValue}>{boxUnit}</AppText>
            <Pressable
              style={[styles.stepperBtn, !canIncrease && styles.stepperBtnDisabled]}
              onPress={handleIncrease}
              disabled={!canIncrease}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Increase quantity">
              <AppText style={styles.stepperBtnText}>+</AppText>
            </Pressable>
          </View>
          {outOfStock ? <AppText style={styles.stockNote}>Out of stock</AppText> : null}
        </View>

        <View style={styles.tabBar}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[styles.tabItem, isActive && styles.tabItemActive]}>
                <AppText style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.tabPanel}>
          {tabContent ? (
            <AppText style={styles.tabContent}>{tabContent}</AppText>
          ) : (
            <AppText style={styles.emptyTab}>No content available.</AppText>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={styles.wishlistBtn}
          onPress={handleToggleWishlist}
          disabled={wishlistLoading}>
          {wishlistLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Heart
                width={22}
                height={22}
                color={inWishlist ? colors.primary : colors.secondaryText}
                filled={inWishlist}
              />
              <AppText style={[styles.wishlistText, inWishlist && styles.wishlistTextActive]}>
                {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </AppText>
            </>
          )}
        </Pressable>

        <View style={styles.actionRow}>
          <Button
            loading={addingToCart}
            disabled={outOfStock || buyingNow}
            backgroundColor={colors.white}
            style={styles.cartBtn}
            textStyle={styles.cartBtnText}
            onPress={handleAddToCart}>
            Add to Cart
          </Button>
          <Button
            loading={buyingNow}
            disabled={outOfStock || addingToCart}
            style={styles.buyBtn}
            onPress={handleBuyNow}>
            Buy Now
          </Button>
        </View>
      </View>
    </View>
  );
};

const createStyles = colors => ({
  screen: {
    flex: 1,
    backgroundColor: colors.homeBody,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  brand: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  price: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 10,
  },
  qtyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  qtyChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  qtyChipActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF5ED',
  },
  qtyChipDisabled: {
    opacity: 0.45,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryText,
  },
  qtyTextActive: {
    color: colors.primary,
  },
  qtyTextDisabled: {
    color: colors.secondaryText,
  },
  qtyPrice: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.4,
  },
  stepperBtnText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.primaryText,
    lineHeight: 24,
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryText,
    minWidth: 28,
    textAlign: 'center',
  },
  stockNote: {
    marginTop: 8,
    fontSize: 13,
    color: colors.error,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: '#FFF5ED',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  tabLabelActive: {
    color: colors.primary,
  },
  tabPanel: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
  },
  tabContent: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.secondaryText,
  },
  emptyTab: {
    fontSize: 14,
    color: colors.secondaryText,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  wishlistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    marginBottom: 10,
  },
  wishlistText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  wishlistTextActive: {
    color: colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cartBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.button,
  },
  cartBtnText: {
    color: colors.button,
  },
  buyBtn: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    minWidth: 120,
  },
});

export default ProductDetailScreen;
