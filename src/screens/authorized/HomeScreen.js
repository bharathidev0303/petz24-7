import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AppText from '../../components/AppText';
import ScreenLayout from '../../components/view/ScreenLayout';
import HomeBannerCarousel from '../../components/view/HomeBannerCarousel';
import HomeQuickServices from '../../components/view/HomeQuickServices';
import HomeExquisiteService from '../../components/view/HomeExquisiteService';
import HomeOnlineConsultation from '../../components/view/HomeOnlineConsultation';
import { useProductPreview } from '../../hooks/useProductPreview';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';
import { getAssetUrl } from '../../config/env';
import { homeAPI } from '../../api/home';
import { getQuantityLabel } from '../../utils/productQuantity';
import { VegNonVegIcon } from '../../components/icons';
import { openCatalogueLink } from '../../utils/openExternalLink';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BODY_HORIZONTAL_PADDING = 32;
const HEALTH_TIP_GAP = 10;
const HEALTH_TIP_COUNT = 3;
const HEALTH_TIP_CARD_WIDTH =
  (SCREEN_WIDTH - BODY_HORIZONTAL_PADDING - HEALTH_TIP_GAP * (HEALTH_TIP_COUNT - 1)) /
  HEALTH_TIP_COUNT;

const ProductCard = ({ item, onPress, showNewBadge = false }) => {
  const styles = useThemedStyles(createStyles);

  return (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={() => onPress(item)}
    style={styles.productCard}>
    {showNewBadge ? (
      <View style={styles.newBadge}>
        <AppText style={styles.newBadgeText}>NEW</AppText>
      </View>
    ) : null}
    <View style={styles.imageWrap}>
      {item.url ? (
        <Image source={{ uri: getAssetUrl(item.url) }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImage, styles.imagePlaceholder]} />
      )}
      {item.veg_nonveg ? (
        <View style={styles.vegIconWrap}>
          <VegNonVegIcon value={item.veg_nonveg} size={14} />
        </View>
      ) : null}
    </View>
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
};

const Section = ({ title, data, onProductPress, onCataloguePress, showNewBadge = false }) => {
  const styles = useThemedStyles(createStyles);
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
              showNewBadge={showNewBadge}
            />
          ) : (
            <TouchableOpacity
              key={`${title}-${item.catalogue_id}`}
              activeOpacity={onCataloguePress ? 0.85 : 1}
              onPress={() => onCataloguePress?.(item)}
              disabled={!onCataloguePress}
              style={styles.catalogueCard}>
              {item.catalogue_image ? (
                <Image
                  source={{ uri: getAssetUrl(item.catalogue_image) }}
                  style={styles.catalogueImage}
                />
              ) : null}
              <AppText style={styles.catalogueName} numberOfLines={1}>
                {item.catalogue_name}
              </AppText>
            </TouchableOpacity>
          ),
        )}
      </ScrollView>
    </View>
  );
};

const HealthTipsSection = ({ data }) => {
  const styles = useThemedStyles(createStyles);
  const tips = (data || []).slice(0, HEALTH_TIP_COUNT);
  if (!tips.length) return null;

  return (
    <View style={styles.section}>
      <AppText style={styles.sectionTitle}>Health Tips</AppText>
      <View style={styles.healthTipsRow}>
        {tips.map(item => (
          <TouchableOpacity
            key={item.catalogue_id}
            activeOpacity={0.85}
            onPress={() => openCatalogueLink(item)}
            style={styles.healthTipCard}>
            {item.catalogue_image ? (
              <Image
                source={{ uri: getAssetUrl(item.catalogue_image) }}
                style={styles.healthTipImage}
              />
            ) : (
              <View style={[styles.healthTipImage, styles.imagePlaceholder]} />
            )}
            <AppText style={styles.healthTipName} numberOfLines={1}>
              {item.catalogue_name}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const HomeScreen = () => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
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

  const openDoctorConsultation = () => {
    navigation.navigate('Booking');
  };

  const openChatWithDoctor = () => {
    navigation.navigate('ChatDoctor');
  };

  const openVetPharmacy = () => {
    navigation.navigate('StaticContent', { contentKey: 'vetPharmacy' });
  };

  const openContact = () => {
    navigation.navigate('Contact');
  };

  const openShop = () => {
    navigation.navigate('Shop');
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
        <View style={styles.welcomeRow}>
          <AppText style={styles.welcomeText}>Welcome, {user?.name || 'Guest'}!</AppText>
        </View>

        <HomeBannerCarousel banners={homeData?.banners} />

        <View style={styles.bodyContent}>
          <HomeQuickServices
            onConsultationPress={openDoctorConsultation}
            onChatPress={openChatWithDoctor}
            onPharmacyPress={openVetPharmacy}
          />

          <Section title="Featured Products" data={homeData?.products} onProductPress={openPreview} />
          <Section title="New Arrivals" data={homeData?.newProducts} onProductPress={openPreview} showNewBadge />

          <HomeExquisiteService
            onQualitySupportPress={openContact}
            onDoctorBookingPress={openDoctorConsultation}
            onOnlineConsultationPress={openDoctorConsultation}
            onChatDoctorPress={openChatWithDoctor}
            onProductOrdersPress={openShop}
            onFastDeliveryPress={openShop}
            onQualitySupportCardPress={openContact}
            onPetWellnessPress={openDoctorConsultation}
          />

          <HealthTipsSection data={homeData?.healthTips} />

          <HomeOnlineConsultation onBookPress={openDoctorConsultation} />
        </View>
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

const createStyles = colors => ({
  scrollView: {
    flex: 1,
    backgroundColor: colors.homeBody,
  },
  content: {
    paddingBottom: 12,
  },
  bodyContent: {
    paddingHorizontal: 16,
  },
  welcomeRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
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
  section: {
    marginBottom: 20,
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
    position: 'relative',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  imageWrap: {
    position: 'relative',
    marginBottom: 8,
  },
  vegIconWrap: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: colors.white,
    borderRadius: 4,
    padding: 2,
  },
  newBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    zIndex: 1,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.4,
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
  healthTipsRow: {
    flexDirection: 'row',
    gap: HEALTH_TIP_GAP,
  },
  healthTipCard: {
    width: HEALTH_TIP_CARD_WIDTH,
    alignItems: 'center',
  },
  healthTipImage: {
    width: HEALTH_TIP_CARD_WIDTH - 8,
    height: HEALTH_TIP_CARD_WIDTH - 8,
    borderRadius: (HEALTH_TIP_CARD_WIDTH - 8) / 2,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  healthTipName: {
    fontSize: 13,
    color: colors.primaryText,
    textAlign: 'center',
    width: '100%',
  },
  error: {
    color: colors.error,
    textAlign: 'center',
  },
});

export default HomeScreen;
