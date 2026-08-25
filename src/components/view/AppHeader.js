import React, { useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Image, Pressable, Animated, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Filter, Close } from '../icons';
import AppText from './AppText';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';

const logoSource = require('../../assets/app-logo.png');

const AppHeader = ({
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  onSearchPress,
  onLogoPress,
  placeholder = 'Search pet food, toys & more...',
  showSearch = true,
  searchEditable = true,
  autoFocusSearch = false,
  backgroundColor,
  searchBackgroundColor,
  title,
  showLogo = true,
  showFilter = false,
  onFilterPress,
  filterActive = false,
}) => {
  const styles = useThemedStyles(createStyles);
  const { colors, isDark } = useTheme();
  const resolvedBackground = backgroundColor ?? colors.homeHeader;
  const resolvedSearchBackground = searchBackgroundColor ?? colors.inputBackground;
  const insets = useSafeAreaInsets();
  const inputRef = useRef(null);
  const logoScale = useRef(new Animated.Value(1)).current;

  const handleLogoPress = () => {
    onLogoPress?.();
    Animated.sequence([
      Animated.spring(logoScale, {
        toValue: 0.9,
        friction: 4,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (autoFocusSearch && searchEditable) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [autoFocusSearch, searchEditable]);

  const handleSearchPress = () => {
    if (!searchEditable && onSearchPress) {
      onSearchPress();
    }
  };

  const handleClearSearch = () => {
    onSearchChange?.('');
    inputRef.current?.focus();
  };

  const showClearSearch = searchEditable && searchValue.length > 0;

  return (
    <>
      <StatusBar
        backgroundColor={resolvedBackground}
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent={false}
      />
      <View style={[styles.container, { paddingTop: insets.top + 8, backgroundColor: resolvedBackground }]}>
        <View style={styles.row}>
          {showLogo ? (
            <Pressable onPress={handleLogoPress} hitSlop={8}>
              <Animated.View style={{ transform: [{ scale: logoScale }] }}>
                <Image source={logoSource} style={styles.logo} resizeMode="contain" />
              </Animated.View>
            </Pressable>
          ) : null}

          {showSearch ? (
            <Pressable
              style={[styles.searchRow, { backgroundColor: resolvedSearchBackground }]}
              onPress={handleSearchPress}
              disabled={searchEditable}>
              <Search width={18} height={18} color={colors.gray} />
              <TextInput
                ref={inputRef}
                style={styles.searchInput}
                placeholder={placeholder}
                placeholderTextColor={colors.gray}
                value={searchValue}
                onChangeText={onSearchChange}
                onSubmitEditing={onSearchSubmit}
                returnKeyType="search"
                editable={searchEditable}
                pointerEvents={searchEditable ? 'auto' : 'none'}
              />
              {showClearSearch ? (
                <Pressable
                  onPress={handleClearSearch}
                  hitSlop={8}
                  style={styles.clearBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search">
                  <Close width={18} height={18} color={colors.secondaryText} />
                </Pressable>
              ) : null}
            </Pressable>
          ) : title ? (
            <View style={styles.titleWrap}>
              <AppText style={styles.title}>{title}</AppText>
            </View>
          ) : null}

          {showFilter ? (
            <Pressable
              onPress={onFilterPress}
              hitSlop={8}
              style={[styles.filterBtn, filterActive && styles.filterBtnActive]}>
              <Filter
                width={22}
                height={22}
                color={filterActive ? colors.white : colors.primaryText}
              />
            </Pressable>
          ) : null}
        </View>
      </View>
    </>
  );
};

const createStyles = colors => ({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 96,
    height: 32,
  },
  searchRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.primaryText,
    padding: 0,
  },
  clearBtn: {
    padding: 2,
    marginLeft: 4,
  },
  titleWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryText,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});

export default AppHeader;
