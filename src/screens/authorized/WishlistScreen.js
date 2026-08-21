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
import SubScreenHeader from '../../components/view/SubScreenHeader';
import { useProductPreview } from '../../hooks/useProductPreview';
import { AppToastService } from '../../components/view/AppToast';
import { Heart, Close } from '../../components/icons';
import { colors } from '../../styles/colors';
import { getAssetUrl } from '../../config/env';
import { wishlistAPI } from '../../api/wishlist';

const WishlistScreen = () => {
  const navigation = useNavigation();
  const { openPreview } = useProductPreview();
  const { user } = useSelector(state => state.auth);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const fetchWishlist = useCallback(
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
        const response = await wishlistAPI.getWishlistProducts(user.id);
        setItems(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.message || 'Could not load wishlist');
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
      fetchWishlist();
    }, [fetchWishlist]),
  );

  const handleRemove = async productId => {
    if (!user?.id || removingId) return;

    setRemovingId(productId);
    try {
      await wishlistAPI.updateWishlist({
        product_id: productId,
        user_id: user.id,
        type: 'remove',
      });
      setItems(prev => prev.filter(item => String(item.product_id) !== String(productId)));
      AppToastService.show('Removed from wishlist', 'success');
    } catch (err) {
      AppToastService.show(err.message || 'Could not remove item', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  const renderItem = ({ item }) => {
    const isRemoving = String(removingId) === String(item.product_id);

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
            {item.veg_nonveg ? (
              <AppText style={styles.tag}>{item.veg_nonveg}</AppText>
            ) : null}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.removeBtn}
          disabled={isRemoving}
          onPress={() => handleRemove(item.product_id)}>
          {isRemoving ? (
            <ActivityIndicator size="small" color={colors.error} />
          ) : (
            <Close width={18} height={18} color={colors.error} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderBody = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (!user?.id) {
      return (
        <View style={styles.centered}>
          <View style={styles.iconWrap}>
            <Heart width={56} height={56} color={colors.primary} filled />
          </View>
          <AppText style={styles.emptyTitle}>Sign in to view wishlist</AppText>
          <AppText style={styles.emptyText}>Save products you love and find them here later.</AppText>
        </View>
      );
    }

    if (error && !items.length) {
      return (
        <View style={styles.centered}>
          <AppText style={styles.error}>{error}</AppText>
          <TouchableOpacity onPress={() => fetchWishlist()}>
            <AppText style={styles.retry}>Tap to retry</AppText>
          </TouchableOpacity>
        </View>
      );
    }

    if (!items.length) {
      return (
        <View style={styles.centered}>
          <View style={styles.iconWrap}>
            <Heart width={56} height={56} color={colors.primary} />
          </View>
          <AppText style={styles.emptyTitle}>Your wishlist is empty</AppText>
          <AppText style={styles.emptyText}>Tap the heart on products to save them here.</AppText>
        </View>
      );
    }

    return (
      <FlatList
        data={items}
        keyExtractor={item => String(item.product_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchWishlist(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <SubScreenHeader title="Wishlist" onBack={() => navigation.goBack()} />
      {renderBody()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
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
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
  },
  error: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 8,
  },
  retry: {
    color: colors.primary,
    fontWeight: '600',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
  imagePlaceholder: {
    backgroundColor: '#e8e8e8',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
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
  tag: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    backgroundColor: '#FFF0F0',
  },
});

export default WishlistScreen;
