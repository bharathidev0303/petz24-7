import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AppText from '../../components/AppText';
import ScreenLayout from '../../components/view/ScreenLayout';
import { useProductPreview } from '../../hooks/useProductPreview';
import { colors } from '../../styles/colors';
import { getAssetUrl } from '../../config/env';
import { homeAPI } from '../../api/home';
import { getQuantityLabel } from '../../utils/productQuantity';

const ProductCard = ({ item, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={() => onPress(item)}
    style={styles.productCard}>
    {item.url ? (
      <Image source={{ uri: getAssetUrl(item.url) }} style={styles.productImage} />
    ) : (
      <View style={[styles.productImage, styles.imagePlaceholder]} />
    )}
    <AppText style={styles.brand}>{item.brand_name}</AppText>
    <AppText style={styles.productName} numberOfLines={2}>
      {item.name}
    </AppText>
    <AppText style={styles.quantity}>
      Qty: {getQuantityLabel(item.quantity) || '—'}
    </AppText>
    <AppText style={styles.price}>Rs. {item.price}</AppText>
  </TouchableOpacity>
);

const Section = ({ title, data, onProductPress }) => {
  if (!data?.length) return null;

  return (
    <View style={styles.section}>
      <AppText style={styles.sectionTitle}>{title}</AppText>
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}>
        {data.map(item =>
          item.product_id ? (
            <ProductCard
              key={`${title}-${item.product_id}`}
              item={item}
              onPress={onProductPress}
            />
          ) : (
            <View key={`${title}-${item.catalogue_id}`} style={styles.catalogueCard}>
              {item.catalogue_image ? (
                <Image
                  source={{ uri: getAssetUrl(item.catalogue_image) }}
                  style={styles.catalogueImage}
                />
              ) : null}
              <AppText style={styles.catalogueName} numberOfLines={1}>
                {item.catalogue_name}
              </AppText>
            </View>
          ),
        )}
      </ScrollView>
    </View>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useSelector(state => state.auth);
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { openPreview } = useProductPreview();

  const fetchHome = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await homeAPI.getHomeDynamicList();
      setHomeData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load home data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHome();
  }, [fetchHome]);

  const onRefresh = useCallback(() => {
    fetchHome(true);
  }, [fetchHome]);

  const openSearch = () => {
    navigation.navigate('Search', {
      product_type_id: undefined,
      brandText: undefined,
      typeName: undefined,
    });
  };

  const renderContent = () => {
    if (loading && !homeData) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (error && !homeData) {
      return (
        <ScrollView
          contentContainerStyle={styles.centeredScroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }>
          <AppText style={styles.error}>{error}</AppText>
          <AppText style={styles.refreshHint}>Pull down to retry</AppText>
        </ScrollView>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }>
        <View style={styles.welcomeBanner}>
          <AppText style={styles.subtitle}>Welcome, {user?.name || 'Guest'}!</AppText>
        </View>

        <Section title="Featured Products" data={homeData?.products} onProductPress={openPreview} />
        <Section title="New Arrivals" data={homeData?.newProducts} onProductPress={openPreview} />
        <Section title="Catalogues" data={homeData?.catalogues} onProductPress={openPreview} />
        <Section title="Quick Links" data={homeData?.quickLinks} onProductPress={openPreview} />
        <Section title="Health Tips" data={homeData?.healthTips} onProductPress={openPreview} />
      </ScrollView>
    );
  };

  return (
    <ScreenLayout
      searchEditable={false}
      onSearchPress={openSearch}
      headerBackgroundColor={colors.homeHeader}
      bodyBackgroundColor={colors.homeBody}
      searchBackgroundColor={colors.white}>
      {renderContent()}
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.homeBody,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.homeBody,
  },
  centeredScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.homeBody,
  },
  refreshHint: {
    marginTop: 8,
    fontSize: 13,
    color: colors.secondaryText,
  },
  welcomeBanner: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE0C2',
  },
  subtitle: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 12,
  },
  listContent: {
    gap: 12,
  },
  productCard: {
    width: 160,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholder: {
    backgroundColor: '#e8e8e8',
  },
  brand: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 4,
    minHeight: 36,
  },
  quantity: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  catalogueCard: {
    width: 120,
    marginRight: 12,
    alignItems: 'center',
  },
  catalogueImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  catalogueName: {
    fontSize: 13,
    color: colors.primaryText,
    textAlign: 'center',
  },
  error: {
    color: colors.error,
    textAlign: 'center',
  },
});

export default HomeScreen;
