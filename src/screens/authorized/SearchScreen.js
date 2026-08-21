import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Keyboard,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import ScreenLayout from '../../components/view/ScreenLayout';
import PriceRangeSlider from '../../components/view/PriceRangeSlider';
import { useProductPreview } from '../../hooks/useProductPreview';
import { colors } from '../../styles/colors';
import { getAssetUrl } from '../../config/env';
import { Close } from '../../components/icons';
import { productsAPI } from '../../api/products';
import { TAB_BAR_STYLE } from '../../navigation/tabBarConfig';

const PAGE_SIZE = 10;
const MIN_SEARCH_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 350;

const parseFilterData = filterResponse => {
  const filterData = filterResponse?.filter || filterResponse?.data?.filter || filterResponse?.data || null;
  if (!filterData) return null;

  return {
    ...filterData,
    min_price: filterData.min_price ?? filterData.startPrice ?? 0,
    max_price: filterData.max_price ?? filterData.endPrice ?? 0,
    brands: filterData.brands || [],
    pet_counts: filterData.pet_counts || [],
    veg_counts: filterData.veg_counts || {},
  };
};

const formatVegLabel = value => {
  if (value === 'veg') return 'Veg';
  if (value === 'non-veg') return 'Non-Veg';
  return value.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

const getVegOptions = vegCounts =>
  Object.entries(vegCounts || {}).map(([id, cnt]) => ({
    id,
    label: formatVegLabel(id),
    cnt,
  }));

const SearchScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const collectionProductTypeId = route.params?.product_type_id;
  const collectionBrandText = route.params?.brandText;
  const collectionTypeName = route.params?.typeName;
  const isCollectionMode = Boolean(collectionProductTypeId && collectionBrandText);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPets, setSelectedPets] = useState([]);
  const [selectedVeg, setSelectedVeg] = useState([]);
  const [priceOrder, setPriceOrder] = useState('l2h');
  const [startPrice, setStartPrice] = useState(null);
  const [endPrice, setEndPrice] = useState(null);
  const [draftBrands, setDraftBrands] = useState([]);
  const [draftPets, setDraftPets] = useState([]);
  const [draftVeg, setDraftVeg] = useState([]);
  const [draftOrder, setDraftOrder] = useState('l2h');
  const [draftStartPrice, setDraftStartPrice] = useState(null);
  const [draftEndPrice, setDraftEndPrice] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  const [autoFocus, setAutoFocus] = useState(!isCollectionMode);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const { openPreview } = useProductPreview();
  const runSearchRef = useRef(null);
  const loadCollectionRef = useRef(null);
  const loadingMoreRef = useRef(false);

  const requestParams = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length >= MIN_SEARCH_LENGTH) {
      return {
        product_type_id: trimmed,
        brandText: 'search',
      };
    }
    if (isCollectionMode) {
      return {
        product_type_id: collectionProductTypeId,
        brandText: collectionBrandText,
      };
    }
    return null;
  }, [isCollectionMode, collectionProductTypeId, collectionBrandText, query]);

  useFocusEffect(
    useCallback(() => {
      if (isCollectionMode) {
        setAutoFocus(false);
        return () => setAutoFocus(false);
      }
      setAutoFocus(true);
      return () => setAutoFocus(false);
    }, [isCollectionMode]),
  );

  useEffect(() => {
    const parent = navigation.getParent();
    if (!parent) return;

    parent.setOptions({
      tabBarStyle: filtersVisible ? { display: 'none' } : TAB_BAR_STYLE,
    });

    return () => {
      parent.setOptions({ tabBarStyle: TAB_BAR_STYLE });
    };
  }, [filtersVisible, navigation]);

  const fetchProducts = async ({
    product_type_id,
    brandText,
    nextPage = 1,
    append = false,
    filterData = filters,
    brands = selectedBrands,
    pets = selectedPets,
    veg = selectedVeg,
    order = priceOrder,
    minPrice = startPrice,
    maxPrice = endPrice,
  }) => {
    const response = await productsAPI.getCollectionProducts({
      product_type_id,
      brandText,
      page: nextPage,
      limit: PAGE_SIZE,
      priceOrder: order || 'l2h',
      brand: brands,
      petId: pets,
      veg,
      ...(minPrice != null && maxPrice != null ? { startPrice: minPrice, endPrice: maxPrice } : {}),
    });

    const items = Array.isArray(response.data) ? response.data : response.products || [];
    setResults(prev => (append ? [...prev, ...items] : items));
    setHasMore(items.length >= PAGE_SIZE);
    setPage(nextPage);
  };

  const loadCollection = async (options = {}) => {
    const { isRefresh = false } = options;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    setSearched(true);
    setHasMore(false);
    setPage(1);
    setSelectedBrands([]);
    setSelectedPets([]);
    setSelectedVeg([]);
    setPriceOrder('l2h');
    setStartPrice(null);
    setEndPrice(null);

    try {
      const filterResponse = await productsAPI.getCollectionFilters({
        product_type_id: collectionProductTypeId,
        brandText: collectionBrandText,
      });

      const filterData = parseFilterData(filterResponse);
      setFilters(filterData);

      await fetchProducts({
        product_type_id: collectionProductTypeId,
        brandText: collectionBrandText,
        nextPage: 1,
        append: false,
        filterData,
        brands: [],
        pets: [],
        veg: [],
        order: 'l2h',
      });
    } catch (err) {
      setError(err.message || 'Failed to load products');
      setResults([]);
      setFilters(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  loadCollectionRef.current = loadCollection;

  const runSearch = async (searchText = query, options = {}) => {
    const { isRefresh = false, isAuto = false } = options;
    const trimmed = searchText.trim();
    if (trimmed.length < MIN_SEARCH_LENGTH) return;

    if (!isAuto) {
      Keyboard.dismiss();
    }
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    setSearched(true);
    setHasMore(false);
    setPage(1);
    setSelectedBrands([]);
    setSelectedPets([]);
    setSelectedVeg([]);
    setPriceOrder('l2h');
    setStartPrice(null);
    setEndPrice(null);

    try {
      const filterResponse = await productsAPI.getCollectionFilters({
        product_type_id: trimmed,
        brandText: 'search',
      });

      const filterData = parseFilterData(filterResponse);
      setFilters(filterData);

      await fetchProducts({
        product_type_id: trimmed,
        brandText: 'search',
        nextPage: 1,
        append: false,
        filterData,
        brands: [],
        pets: [],
        veg: [],
        order: 'l2h',
      });
    } catch (err) {
      setError(err.message || 'Search failed');
      setResults([]);
      setFilters(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  runSearchRef.current = runSearch;

  useFocusEffect(
    useCallback(() => {
      if (!isCollectionMode || query.trim().length > 0) return undefined;
      loadCollectionRef.current?.();
      return undefined;
    }, [isCollectionMode, collectionProductTypeId, collectionBrandText, query]),
  );

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length === 0) {
      if (!isCollectionMode) {
        setSearched(false);
        setResults([]);
        setFilters(null);
        setError(null);
        setLoading(false);
      }
      return undefined;
    }

    if (trimmed.length < MIN_SEARCH_LENGTH) {
      if (!isCollectionMode) {
        setSearched(false);
        setResults([]);
        setError(null);
        setLoading(false);
      }
      return undefined;
    }

    const timer = setTimeout(() => {
      runSearchRef.current?.(trimmed, { isAuto: true });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, isCollectionMode]);

  const applyFilters = async ({
    brands = selectedBrands,
    pets = selectedPets,
    veg = selectedVeg,
    order = priceOrder,
    minPrice = startPrice,
    maxPrice = endPrice,
  } = {}) => {
    if (!searched || !requestParams) return;

    setLoading(true);
    setError(null);
    setHasMore(false);
    setPage(1);

    try {
      await fetchProducts({
        product_type_id: requestParams.product_type_id,
        brandText: requestParams.brandText,
        nextPage: 1,
        append: false,
        brands,
        pets,
        veg,
        order,
        minPrice,
        maxPrice,
      });
    } catch (err) {
      setError(err.message || 'Could not apply filters');
    } finally {
      setLoading(false);
    }
  };

  const openFilters = () => {
    Keyboard.dismiss();
    setDraftBrands(selectedBrands);
    setDraftPets(selectedPets);
    setDraftVeg(selectedVeg);
    setDraftOrder(priceOrder);
    setDraftStartPrice(startPrice ?? filters?.min_price ?? 0);
    setDraftEndPrice(endPrice ?? filters?.max_price ?? 0);
    setFiltersVisible(true);
  };

  const closeFilters = () => setFiltersVisible(false);

  const resetDraftFilters = () => {
    setDraftBrands([]);
    setDraftPets([]);
    setDraftVeg([]);
    setDraftOrder('l2h');
    setDraftStartPrice(filters?.min_price ?? 0);
    setDraftEndPrice(filters?.max_price ?? 0);
  };

  const clearFilters = async () => {
    if (!filters) return;

    setDraftBrands([]);
    setDraftPets([]);
    setDraftVeg([]);
    setDraftOrder('l2h');
    setDraftStartPrice(filters?.min_price ?? 0);
    setDraftEndPrice(filters?.max_price ?? 0);
    setSelectedBrands([]);
    setSelectedPets([]);
    setSelectedVeg([]);
    setPriceOrder('l2h');
    setStartPrice(null);
    setEndPrice(null);
    closeFilters();

    await applyFilters({
      brands: [],
      pets: [],
      veg: [],
      order: 'l2h',
      minPrice: null,
      maxPrice: null,
    });
  };

  const handleApplyFilters = async () => {
    const priceChanged =
      filters &&
      (draftStartPrice !== filters.min_price || draftEndPrice !== filters.max_price);
    const nextStartPrice = priceChanged ? draftStartPrice : null;
    const nextEndPrice = priceChanged ? draftEndPrice : null;

    setSelectedBrands(draftBrands);
    setSelectedPets(draftPets);
    setSelectedVeg(draftVeg);
    setPriceOrder(draftOrder);
    setStartPrice(nextStartPrice);
    setEndPrice(nextEndPrice);
    closeFilters();
    await applyFilters({
      brands: draftBrands,
      pets: draftPets,
      veg: draftVeg,
      order: draftOrder,
      minPrice: nextStartPrice,
      maxPrice: nextEndPrice,
    });
  };

  const toggleDraftBrand = brandId => {
    const id = String(brandId);
    setDraftBrands(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  const toggleDraftPet = petId => {
    const id = String(petId);
    setDraftPets(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  const toggleDraftVeg = vegId => {
    setDraftVeg(prev => (prev.includes(vegId) ? prev.filter(item => item !== vegId) : [...prev, vegId]));
  };

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore || loading || loadingMore || !searched || !requestParams) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      await fetchProducts({
        product_type_id: requestParams.product_type_id,
        brandText: requestParams.brandText,
        nextPage: page + 1,
        append: true,
      });
    } catch {
      // keep existing results
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [
    hasMore,
    loading,
    loadingMore,
    page,
    searched,
    requestParams,
    filters,
    selectedBrands,
    selectedPets,
    selectedVeg,
    priceOrder,
    startPrice,
    endPrice,
  ]);

  const renderListFooter = () => {
    if (loadingMore) {
      return <ActivityIndicator color={colors.primary} style={styles.footerLoader} />;
    }
    if (!hasMore && results.length > 0) {
      return <AppText style={styles.endText}>No more products</AppText>;
    }
    return null;
  };

  const onRefresh = useCallback(() => {
    if (isCollectionMode && query.trim().length === 0) {
      loadCollectionRef.current?.({ isRefresh: true });
      return;
    }
    if (query.trim().length >= MIN_SEARCH_LENGTH) {
      runSearch(query, { isRefresh: true });
    }
  }, [isCollectionMode, query]);

  const priceRangeChanged =
    filters &&
    startPrice != null &&
    endPrice != null &&
    (startPrice !== filters.min_price || endPrice !== filters.max_price);

  const filterActive =
    selectedBrands.length > 0 ||
    selectedPets.length > 0 ||
    selectedVeg.length > 0 ||
    priceOrder === 'h2l' ||
    priceRangeChanged;

  const isBrandCollection = collectionBrandText === 'brand';
  const collectionMetaLabel = isBrandCollection ? 'Brand' : collectionBrandText;

  const emptyLabel =
    isCollectionMode && query.trim().length < MIN_SEARCH_LENGTH
      ? `No products found for ${collectionMetaLabel} · ${collectionTypeName || 'collection'}`
      : `No products found for "${query}"`;

  const showCollectionMeta =
    isCollectionMode && query.trim().length < MIN_SEARCH_LENGTH && collectionBrandText;

  const renderCollectionMeta = () => (
    <View style={styles.collectionMetaRow}>
      <View style={styles.collectionMeta}>
        <View style={styles.metaChip}>
          <AppText style={styles.metaChipText}>{collectionMetaLabel}</AppText>
        </View>
        {collectionTypeName ? (
          <>
            <AppText style={styles.metaDivider}>›</AppText>
            <View style={[styles.metaChip, styles.metaChipAccent]}>
              <AppText style={[styles.metaChipText, styles.metaChipTextAccent]}>
                {collectionTypeName}
              </AppText>
            </View>
          </>
        ) : null}
      </View>
    </View>
  );

  const renderClearFiltersBar = () => {
    if (!filterActive || !searched) return null;

    return (
      <View style={styles.clearBarWrap}>
        <AppText style={styles.clearBarLabel}>Filters applied</AppText>
        <TouchableOpacity activeOpacity={0.7} onPress={clearFilters} hitSlop={8}>
          <AppText style={styles.clearBarAction}>Clear filters</AppText>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFilterContent = () => {
    if (!filters) {
      return (
        <AppText style={styles.modalHint}>
          {isCollectionMode ? 'Loading filters...' : 'Search for products to see filters.'}
        </AppText>
      );
    }

    return (
      <ScrollView
        style={styles.modalScroll}
        contentContainerStyle={styles.modalContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator>
        <AppText style={styles.modalSectionTitle}>Sort by price</AppText>
        <View style={styles.modalChipRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.filterChip, draftOrder === 'l2h' && styles.filterChipActive]}
            onPress={() => setDraftOrder('l2h')}>
            <AppText style={[styles.filterChipText, draftOrder === 'l2h' && styles.filterChipTextActive]}>
              Low to High
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.filterChip, draftOrder === 'h2l' && styles.filterChipActive]}
            onPress={() => setDraftOrder('h2l')}>
            <AppText style={[styles.filterChipText, draftOrder === 'h2l' && styles.filterChipTextActive]}>
              High to Low
            </AppText>
          </TouchableOpacity>
        </View>

        <AppText style={styles.modalSectionTitle}>Price range</AppText>
        <PriceRangeSlider
          min={filters.min_price}
          max={filters.max_price}
          low={draftStartPrice ?? filters.min_price}
          high={draftEndPrice ?? filters.max_price}
          onLowChange={setDraftStartPrice}
          onHighChange={setDraftEndPrice}
        />

        {(filters.pet_counts || []).length ? (
          <>
            <AppText style={styles.modalSectionTitle}>Pet</AppText>
            <View style={styles.modalChipRow}>
              {filters.pet_counts.map(pet => {
                const petId = String(pet.pet_id);
                const active = draftPets.includes(petId);
                return (
                  <TouchableOpacity
                    key={petId}
                    activeOpacity={0.85}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => toggleDraftPet(petId)}>
                    <AppText style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {pet.pet_name} ({pet.cnt})
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : null}

        {getVegOptions(filters.veg_counts).length ? (
          <>
            <AppText style={styles.modalSectionTitle}>Food type</AppText>
            <View style={styles.modalChipRow}>
              {getVegOptions(filters.veg_counts).map(option => {
                const active = draftVeg.includes(option.id);
                return (
                  <TouchableOpacity
                    key={option.id}
                    activeOpacity={0.85}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => toggleDraftVeg(option.id)}>
                    <AppText style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {option.label} ({option.cnt})
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : null}

        {(filters.brands || []).length ? (
          <>
            <AppText style={styles.modalSectionTitle}>Brands</AppText>
            <View style={styles.modalChipRow}>
              {(filters.brands || []).map(brand => {
                const brandId = String(brand.brand_id);
                const active = draftBrands.includes(brandId);
                return (
                  <TouchableOpacity
                    key={brandId}
                    activeOpacity={0.85}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => toggleDraftBrand(brandId)}>
                    <AppText style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {brand.brand_name} ({brand.cnt})
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : null}
      </ScrollView>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => openPreview(item)}
      style={styles.resultCard}>
      {item.url || item.product_image ? (
        <Image
          source={{ uri: getAssetUrl(item.url || item.product_image) }}
          style={styles.resultImage}
        />
      ) : (
        <View style={[styles.resultImage, styles.imagePlaceholder]} />
      )}
      <View style={styles.resultInfo}>
        <AppText style={styles.brand}>{item.brand_name}</AppText>
        <AppText style={styles.name} numberOfLines={2}>
          {item.name || item.product_name}
        </AppText>
        <AppText style={styles.price}>
          Rs. {item.min_price ?? item.custom_price ?? item.price ?? item.quantity?.[0]?.price}
        </AppText>
      </View>
    </TouchableOpacity>
  );

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[colors.primary]}
      enabled={
        searched ||
        (isCollectionMode && query.trim().length === 0) ||
        query.trim().length >= MIN_SEARCH_LENGTH
      }
    />
  );

  const renderBody = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <ScrollView contentContainerStyle={styles.centered} refreshControl={refreshControl}>
          <AppText style={styles.error}>{error}</AppText>
        </ScrollView>
      );
    }

    if (!searched) {
      const trimmedLen = query.trim().length;
      return (
        <ScrollView contentContainerStyle={styles.centered}>
          <AppText style={styles.hint}>
            {trimmedLen > 0 && trimmedLen < MIN_SEARCH_LENGTH
              ? `Type at least ${MIN_SEARCH_LENGTH} characters to search`
              : 'Search for pet food, toys, brands & more'}
          </AppText>
        </ScrollView>
      );
    }

    if (!results.length) {
      return (
        <ScrollView contentContainerStyle={styles.flexGrow} refreshControl={refreshControl}>
          {renderClearFiltersBar()}
          <View style={styles.centered}>
            <AppText style={styles.hint}>{emptyLabel}</AppText>
          </View>
        </ScrollView>
      );
    }

    return (
      <FlatList
        data={results}
        keyExtractor={item => String(item.product_id)}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
        ListHeaderComponent={renderClearFiltersBar()}
        ListFooterComponent={renderListFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
      />
    );
  };

  const renderFiltersModal = () => (
    <Modal
      visible={filtersVisible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={closeFilters}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.modalBackdrop} onPress={closeFilters} />

        <View style={[styles.modalSheet, { paddingBottom: insets.bottom }]}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <AppText style={styles.modalTitle}>Filters</AppText>
            <View style={styles.modalHeaderActions}>
              {filters ? (
                <TouchableOpacity onPress={clearFilters} hitSlop={8}>
                  <AppText style={styles.clearLink}>Clear filters</AppText>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity onPress={closeFilters} hitSlop={8}>
                <Close width={20} height={20} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>
          </View>

          {renderFilterContent()}

          <View style={styles.modalFooter}>
            <Button
              backgroundColor={colors.white}
              textStyle={styles.resetBtnText}
              style={styles.resetBtn}
              onPress={resetDraftFilters}>
              Reset
            </Button>
            <Button style={styles.applyBtn} onPress={handleApplyFilters}>
              Apply Filters
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <ScreenLayout
        searchValue={query}
        onSearchChange={setQuery}
        onSearchSubmit={() => {
          if (query.trim().length >= MIN_SEARCH_LENGTH) {
            runSearch(query, { isAuto: false });
          }
        }}
        searchEditable
        autoFocusSearch={autoFocus}
        showLogo={false}
        showFilter
        onFilterPress={openFilters}
        filterActive={filterActive}
        headerBackgroundColor={colors.homeHeader}
        bodyBackgroundColor={colors.homeBody}
        searchBackgroundColor={colors.white}
        placeholder="Search products...">
        {showCollectionMeta ? renderCollectionMeta() : null}
        {renderBody()}
      </ScreenLayout>

      {renderFiltersModal()}
    </>
  );
};

const styles = StyleSheet.create({
  collectionMetaRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  collectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    backgroundColor: colors.inputBackground,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaChipAccent: {
    backgroundColor: '#FFF5ED',
    borderColor: '#FFE4CC',
  },
  metaChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryText,
  },
  metaChipTextAccent: {
    color: colors.primary,
  },
  metaDivider: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  flexGrow: {
    flexGrow: 1,
  },
  centered: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  hint: {
    fontSize: 15,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  error: {
    color: colors.error,
    textAlign: 'center',
  },
  clearBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearBarLabel: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  clearBarAction: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '88%',
    width: '100%',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: 10,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryText,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  clearLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  modalScroll: {
    flexGrow: 0,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  modalHint: {
    padding: 20,
    fontSize: 15,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 10,
    marginTop: 4,
  },
  modalChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  resetBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.button,
  },
  resetBtnText: {
    color: colors.button,
  },
  applyBtn: {
    flex: 2,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryText,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
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
  resultCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  resultImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
  imagePlaceholder: {
    backgroundColor: '#e8e8e8',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
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
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  footerLoader: {
    marginVertical: 16,
  },
});

export default SearchScreen;
