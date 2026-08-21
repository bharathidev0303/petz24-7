import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  TouchableOpacity,
  Image,
  ScrollView,
  BackHandler,
  Dimensions,
} from 'react-native';
import { TAB_BAR_HEIGHT_COMPACT } from '../../navigation/tabBarConfig';
import AppText from '../AppText';
import { Shop } from '../icons';
import { colors } from '../../styles/colors';
import { useMenuSheet } from '../../context/MenuSheetContext';
import { useMoreMenuNavigation } from '../../hooks/useMoreMenuNavigation';
import { homeAPI } from '../../api/home';
import { getAssetUrl } from '../../config/env';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.7;
const ITEMS_PER_ROW = 3;
const HANDLE_HEIGHT = 28;
const STATIC_ROW_HEIGHT = 96;
const SHEET_PADDING = 32;
const STATIC_SECTION_HEIGHT = HANDLE_HEIGHT + STATIC_ROW_HEIGHT + SHEET_PADDING;
const DYNAMIC_MAX_HEIGHT = MAX_SHEET_HEIGHT - STATIC_SECTION_HEIGHT;

const MenuSheetItem = ({ label, imageUri, Icon, onPress }) => (
  <TouchableOpacity activeOpacity={0.85} style={styles.item} onPress={onPress}>
    <View style={styles.iconCircle}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.petImage} resizeMode="cover" />
      ) : Icon ? (
        <Icon width={26} height={26} color={colors.primary} />
      ) : (
        <AppText style={styles.iconFallback}>{label.charAt(0)}</AppText>
      )}
    </View>
    <AppText style={styles.itemLabel} numberOfLines={2}>
      {label}
    </AppText>
  </TouchableOpacity>
);

const chunkItems = (items, size) => {
  const rows = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
};

const MenuBottomSheet = () => {
  const { visible, closeMenuSheet } = useMenuSheet();
  const menuNav = useMoreMenuNavigation(closeMenuSheet);
  const tabBarHeight = TAB_BAR_HEIGHT_COMPACT;
  const [menuPets, setMenuPets] = useState([]);
  const [hasBrands, setHasBrands] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(STATIC_SECTION_HEIGHT);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;

    homeAPI
      .getMenuItems()
      .then(response => {
        if (!mounted) return;
        const menu = response.data?.menu || [];
        const brands = Array.isArray(response.data?.brand)
          ? response.data.brand.filter(brand => brand.flag !== '0')
          : [];
        setMenuPets(menu);
        setHasBrands(brands.length > 0);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const dynamicItems = useMemo(() => {
    const items = menuPets.map(pet => ({
      id: `pet-${pet.pet_id}`,
      label: pet.pet_name,
      imageUri: pet.pet_img ? getAssetUrl(pet.pet_img) : null,
      petId: pet.pet_id,
      type: 'pet',
    }));

    if (hasBrands) {
      items.push({
        id: 'brands',
        label: 'Brands',
        Icon: Shop,
        type: 'brands',
      });
    }

    return items;
  }, [menuPets, hasBrands]);

  const handleDynamicItemPress = useCallback(
    item => {
      if (item.type === 'brands') {
        menuNav.goBrands();
        return;
      }
      menuNav.goPet(item.petId);
    },
    [menuNav],
  );

  useEffect(() => {
    if (!visible) return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      closeMenuSheet();
      return true;
    });

    return () => subscription.remove();
  }, [visible, closeMenuSheet]);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          friction: 9,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setModalVisible(false);
    });
  }, [visible, slideAnim, fadeAnim]);

  const dynamicRows = useMemo(
    () => chunkItems(dynamicItems, ITEMS_PER_ROW),
    [dynamicItems],
  );

  const staticRow = [
    {
      id: 'consultation',
      label: 'Consultation',
      onPress: menuNav.goConsultation,
    },
    {
      id: 'chat',
      label: 'Chat with Doctor',
      onPress: menuNav.goChatDoctor,
    },
    {
      id: 'vet-pharmacy',
      label: 'Vet Pharmacy',
      onPress: menuNav.goVetPharmacy,
    },
  ];

  const handleSheetLayout = useCallback(event => {
    const height = Math.min(event.nativeEvent.layout.height, MAX_SHEET_HEIGHT);
    setSheetHeight(height);
  }, []);

  if (!modalVisible) return null;

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Animated.View
        style={[styles.backdrop, { bottom: tabBarHeight, opacity: fadeAnim }]}
        pointerEvents={visible ? 'auto' : 'none'}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeMenuSheet} />
      </Animated.View>

      <Animated.View
        pointerEvents="auto"
        onLayout={handleSheetLayout}
        style={[
          styles.sheet,
          {
            bottom: tabBarHeight,
            maxHeight: MAX_SHEET_HEIGHT,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [sheetHeight, 0],
                }),
              },
            ],
          },
        ]}>
        <View style={styles.handle} />

        <ScrollView
          style={styles.dynamicScroll}
          contentContainerStyle={styles.dynamicScrollContent}
          showsVerticalScrollIndicator
          bounces={false}
          nestedScrollEnabled>
          {dynamicRows.map((row, rowIndex) => (
            <View
              key={`dynamic-row-${rowIndex}`}
              style={[styles.row, rowIndex > 0 ? styles.rowSpacing : null]}>
              {row.map(item => (
                <MenuSheetItem
                  key={item.id}
                  label={item.label}
                  imageUri={item.imageUri}
                  Icon={item.Icon}
                  onPress={() => handleDynamicItemPress(item)}
                />
              ))}
              {row.length < ITEMS_PER_ROW
                ? Array.from({ length: ITEMS_PER_ROW - row.length }).map((_, index) => (
                    <View key={`spacer-${rowIndex}-${index}`} style={styles.item} />
                  ))
                : null}
            </View>
          ))}
        </ScrollView>

        <View style={styles.staticSection}>
          <View style={styles.row}>
            {staticRow.map(item => (
              <MenuSheetItem
                key={item.id}
                label={item.label}
                imageUri={item.imageUri}
                Icon={item.Icon}
                onPress={item.onPress}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  dynamicScroll: {
    maxHeight: DYNAMIC_MAX_HEIGHT,
    flexGrow: 0,
  },
  dynamicScrollContent: {
    paddingBottom: 4,
  },
  staticSection: {
    paddingTop: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rowSpacing: {
    marginTop: 18,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF5ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFE4CC',
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  iconFallback: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryText,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default MenuBottomSheet;
