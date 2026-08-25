import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import AppText from '../AppText';
import AppView from '../AppView';
import Downarrow from '../icons/downArrow';
import SearchableDropdownModal from '../modals/SearchableDropdownModal';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';

const FloatingDropdown = ({
  label,
  selected,
  error,
  disabled = false,
  style,
  labelStyle = { fontSize: 14 },
  isRequired = false,
  searchTitle,
  onSelect,
  options = [],
  onSearch,
  onAddNew,
  onPress,
  rightIcon = true,
}) => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const isFirstRender = useRef(true);
  const [isFocused, setIsFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  const value = useMemo(() => options?.find(e => e?.id == selected), [selected, options]);
  const animatedValue = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    Animated.timing(animatedValue, {
      toValue: visible || selected ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setIsFocused(visible);
  }, [visible, selected]);

  const localLabelStyle = {
    position: 'absolute',
    left: 16,
    top: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [14, -10] }),
    color: disabled ? '#bdbdbd' : isFocused ? colors.primary : '#999',
    backgroundColor: 'white',
    paddingLeft: 5,
    zIndex: 99,
  };

  return (
    <AppView marginVertical={10}>
      <TouchableOpacity
        onPress={() => (onPress ? onPress() : setVisible(true))}
        disabled={disabled}
        style={[
          styles.container,
          isFocused && !disabled && !error && styles.focusedContainer,
          error && styles.errorContainer,
          style,
        ]}>
        <Animated.Text style={[localLabelStyle, labelStyle]}>
          {label} {isRequired && <AppText style={styles.required}>*</AppText>}
        </Animated.Text>
        <View style={styles.row}>
          <AppText numberOfLines={1} ellipsizeMode="tail" style={styles.valueText}>
            {value?.name}
          </AppText>
          {rightIcon && (
            <View style={styles.iconWrap}>
              <Downarrow />
            </View>
          )}
        </View>
      </TouchableOpacity>

      <SearchableDropdownModal
        onAddNew={onAddNew}
        selectedId={selected}
        onSearch={onSearch}
        onSelect={onSelect}
        visible={visible}
        onClose={() => setVisible(false)}
        data={options}
        title={searchTitle || label}
      />

      {error && (
        <AppText fontFamily="Regular" style={styles.errorText} color="red">
          {error}
        </AppText>
      )}
    </AppView>
  );
};

const createStyles = colors => ({
  container: {
    borderWidth: 1.5,
    borderColor: '#E3E3E3',
    borderRadius: 12,
    paddingVertical: 17,
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  valueText: { paddingLeft: 20, flex: 1 },
  iconWrap: { paddingHorizontal: 20 },
  focusedContainer: { borderColor: colors.primary, borderWidth: 1.5 },
  errorContainer: { borderColor: 'red', borderWidth: 1 },
  required: { color: 'red', fontSize: 12 },
  errorText: { marginTop: 5, paddingLeft: 15, fontSize: 13 },
});

export default FloatingDropdown;
