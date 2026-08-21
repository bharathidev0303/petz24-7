import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppText from '../../components/AppText';
import SubScreenHeader from '../../components/view/SubScreenHeader';
import { colors } from '../../styles/colors';
import { getAssetUrl } from '../../config/env';
import { homeAPI } from '../../api/home';

const ShopScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const focusPetId = route.params?.focusPetId;
  const focusSection = route.params?.focusSection;
  const [menu, setMenu] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const showBrands = focusSection === 'brands' || (!focusPetId && focusSection !== 'pets');
  const showPets = focusSection !== 'brands';

  const visiblePets = useMemo(() => {
    if (!showPets) return [];
    if (focusPetId) {
      return menu.filter(pet => String(pet.pet_id) === String(focusPetId));
    }
    return menu;
  }, [menu, focusPetId, showPets]);

  const screenTitle = useMemo(() => {
    if (focusSection === 'brands') return 'Brands';
    if (visiblePets.length === 1) return visiblePets[0].pet_name;
    if (focusPetId) return 'Shop';
    return 'Shop';
  }, [focusSection, visiblePets, focusPetId]);

  const fetchMenu = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await homeAPI.getMenuItems();
      setMenu(response.data?.menu || []);
      setBrands(
        Array.isArray(response.data?.brand)
          ? response.data.brand.filter(brand => brand.flag !== '0')
          : [],
      );
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const onRefresh = useCallback(() => {
    fetchMenu(true);
  }, [fetchMenu]);

  const openCollection = useCallback(
    (pet, category) => {
      if (!category?.product_category_id) return;

      navigation.navigate('Search', {
        product_type_id: category.product_category_id,
        brandText: pet.pet_name,
        typeName: category.category,
      });
    },
    [navigation],
  );

  const openTypeCollection = useCallback(
    (pet, type) => {
      const category = type.categories?.[0];
      if (!category) return;
      openCollection(pet, category);
    },
    [openCollection],
  );

  const openBrandCollection = useCallback(
    brand => {
      if (!brand?.brand_id) return;

      navigation.navigate('Search', {
        product_type_id: brand.brand_id,
        brandText: 'brand',
        typeName: brand.brand_name,
      });
    },
    [navigation],
  );

  return (
    <View style={styles.container}>
      <SubScreenHeader title={screenTitle} onBack={() => navigation.goBack()} />

      {loading && !menu.length && !brands.length ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error && !menu.length && !brands.length ? (
        <ScrollView
          contentContainerStyle={styles.centeredScroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }>
          <AppText style={styles.error}>{error}</AppText>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }>
          {!focusPetId && focusSection !== 'brands' ? (
            <AppText style={styles.title}>{screenTitle}</AppText>
          ) : null}

          {showBrands && brands.length > 0 ? (
            <View style={styles.brandSection}>
              <AppText style={styles.sectionTitle}>Shop by Brand</AppText>
              <View style={styles.brandGrid}>
                {brands.map(brand => (
                  <TouchableOpacity
                    key={brand.brand_id}
                    activeOpacity={0.85}
                    style={styles.brandCard}
                    onPress={() => openBrandCollection(brand)}>
                    {brand.brand_logo ? (
                      <Image
                        source={{ uri: getAssetUrl(brand.brand_logo) }}
                        style={styles.brandLogo}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={[styles.brandLogo, styles.brandLogoPlaceholder]} />
                    )}
                    <AppText style={styles.brandName} numberOfLines={2}>
                      {brand.brand_name}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {showPets && visiblePets.length > 0 && !focusPetId ? (
            <AppText style={styles.sectionTitle}>Shop by Pet</AppText>
          ) : null}

          {showPets && visiblePets.length === 0 && focusPetId && !loading ? (
            <View style={styles.emptyWrap}>
              <AppText style={styles.emptyText}>No categories found for this pet.</AppText>
            </View>
          ) : null}

          {showPets
            ? visiblePets.map(pet => (
                <View key={pet.pet_id} style={styles.petSection}>
                  {!focusPetId ? (
                    <View style={styles.petHeader}>
                      {pet.pet_img ? (
                        <Image source={{ uri: getAssetUrl(pet.pet_img) }} style={styles.petImage} />
                      ) : null}
                      <AppText style={styles.petName}>{pet.pet_name}</AppText>
                    </View>
                  ) : null}

                  {pet.types?.map(type => (
                    <View key={type.product_type_id} style={styles.typeBlock}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => openTypeCollection(pet, type)}>
                        <AppText style={styles.typeTitle}>{type.type}</AppText>
                      </TouchableOpacity>
                      <View style={styles.categoryRow}>
                        {type.categories?.map(category => (
                          <TouchableOpacity
                            key={category.product_category_id}
                            activeOpacity={0.85}
                            style={styles.categoryChip}
                            onPress={() => openCollection(pet, category)}>
                            <AppText style={styles.categoryText}>{category.category}</AppText>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              ))
            : null}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  },
  centeredScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 12,
  },
  brandSection: {
    marginBottom: 24,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  brandCard: {
    width: '48%',
    alignItems: 'center',
  },
  brandLogo: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  brandLogoPlaceholder: {
    backgroundColor: colors.lightGray,
  },
  brandName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryText,
    textAlign: 'center',
    lineHeight: 18,
    minHeight: 36,
  },
  petSection: {
    marginBottom: 24,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  petHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  petImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.lightGray,
  },
  petName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  typeBlock: {
    marginBottom: 12,
  },
  typeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 13,
    color: colors.primaryText,
  },
  error: {
    color: colors.error,
    textAlign: 'center',
  },
  emptyWrap: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: colors.secondaryText,
    textAlign: 'center',
  },
});

export default ShopScreen;
