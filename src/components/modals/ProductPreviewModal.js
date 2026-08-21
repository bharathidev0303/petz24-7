import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '../view/AppText';
import Button from '../view/Button';
import { Close } from '../icons';
import { colors } from '../../styles/colors';
import { getAssetUrl } from '../../config/env';
import { productsAPI } from '../../api/products';
import { cartAPI } from '../../api/cart';
import { AppToastService } from '../view/AppToast';
import {
  getQuantityLabel,
  getQuantityVariant,
  resolveSelectedQuantity,
} from '../../utils/productQuantity';

const ProductPreviewModal = ({ visible, productId, previewProduct, onClose }) => {
  const insets = useSafeAreaInsets();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedQty, setSelectedQty] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!visible || !productId) {
      setDetails(null);
      setError(null);
      setSelectedQty(null);
      return;
    }

    let cancelled = false;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      setDetails(null);
      setSelectedQty(null);

      try {
        const response = await productsAPI.getProductDetails(productId);
        if (cancelled) return;

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
        if (!cancelled) {
          setError(err.message || 'Failed to load product');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDetails();

    return () => {
      cancelled = true;
    };
  }, [visible, productId, previewProduct?.quantity]);

  if (!visible) return null;

  const imageUrl =
    getAssetUrl(details?.images?.[0]?.url) ||
    getAssetUrl(previewProduct?.url || previewProduct?.product_image);

  const displayName = details?.name || previewProduct?.name || previewProduct?.product_name;
  const displayBrand = details?.brand_name || previewProduct?.brand_name;
  const displayPrice =
    selectedQty?.price ||
    previewProduct?.price ||
    previewProduct?.min_price ||
    details?.quantities?.[0]?.price;

  const handleAddToCart = async () => {
    const qty = resolveSelectedQuantity(selectedQty, previewProduct);

    if (!qty?.quantity) {
      AppToastService.show('Please select a quantity', 'warning');
      return;
    }

    setAdding(true);
    try {
      await cartAPI.addToCart({
        product_id: Number(productId),
        quantity: getQuantityLabel(qty.quantity) || qty.quantity,
        box_unit: 1,
      });
      AppToastService.show('Added to cart', 'success');
      onClose();
    } catch (err) {
      AppToastService.show(err.message || 'Could not add to cart', 'error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />

          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
            <Close width={22} height={22} color={colors.primaryText} />
          </Pressable>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]} />
            )}

            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <AppText style={styles.loadingText}>Loading details...</AppText>
              </View>
            ) : null}

            {error ? <AppText style={styles.error}>{error}</AppText> : null}

            {displayBrand ? <AppText style={styles.brand}>{displayBrand}</AppText> : null}
            {displayName ? <AppText style={styles.name}>{displayName}</AppText> : null}

            {details?.veg_nonveg ? (
              <View style={styles.badge}>
                <AppText style={styles.badgeText}>{details.veg_nonveg}</AppText>
              </View>
            ) : null}

            {details?.quantities?.length ? (
              <View style={styles.qtySection}>
                <AppText style={styles.sectionLabel}>Select quantity</AppText>
                <View style={styles.qtyRow}>
                  {details.quantities.map(qty => {
                    const isSelected =
                      selectedQty?.product_quantity_id === qty.product_quantity_id;
                    const outOfStock = Number(qty.stock) <= 0;

                    return (
                      <Pressable
                        key={qty.product_quantity_id}
                        disabled={outOfStock}
                        onPress={() => setSelectedQty(qty)}
                        style={[
                          styles.qtyChip,
                          isSelected && styles.qtyChipActive,
                          outOfStock && styles.qtyChipDisabled,
                        ]}>
                        <AppText
                          style={[
                            styles.qtyText,
                            isSelected && styles.qtyTextActive,
                            outOfStock && styles.qtyTextDisabled,
                          ]}>
                          {qty.quantity}
                        </AppText>
                        <AppText
                          style={[
                            styles.qtyPrice,
                            isSelected && styles.qtyTextActive,
                            outOfStock && styles.qtyTextDisabled,
                          ]}>
                          Rs. {qty.price}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : getQuantityLabel(previewProduct?.quantity) ? (
              <AppText style={styles.meta}>
                Qty: {getQuantityLabel(previewProduct.quantity)}
              </AppText>
            ) : null}

            {displayPrice ? <AppText style={styles.price}>Rs. {displayPrice}</AppText> : null}

            {details?.summery || details?.description ? (
              <View style={styles.descSection}>
                <AppText style={styles.sectionLabel}>About</AppText>
                <AppText style={styles.description}>
                  {details.summery || details.description}
                </AppText>
              </View>
            ) : null}

            <Button loading={adding} onPress={handleAddToCart} style={styles.cartBtn}>
              Add to Cart
            </Button>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingTop: 12,
    zIndex: 2,
    elevation: 8,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 3,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: colors.lightGray,
    marginBottom: 16,
  },
  imagePlaceholder: {
    backgroundColor: '#e8e8e8',
  },
  brand: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 10,
    paddingRight: 36,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF5ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  qtySection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 8,
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
  meta: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
  },
  descSection: {
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.secondaryText,
  },
  cartBtn: {
    marginTop: 4,
  },
  error: {
    color: colors.error,
    marginBottom: 12,
  },
});

export default ProductPreviewModal;
