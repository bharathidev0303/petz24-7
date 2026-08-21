import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Search } from '../icons';
import { colors } from '../../styles/colors';

const CIRCLE_SIZE = 58;
const ICON_SIZE = 28;
const LIFT = 30;

const FloatingSearchTabIcon = ({ focused }) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.08 : 1,
      friction: 6,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }, [focused, scale]);

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.circle,
          focused && styles.circleFocused,
          { transform: [{ scale }] },
        ]}>
        <Search width={ICON_SIZE} height={ICON_SIZE} color={colors.white} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -LIFT,
    width: CIRCLE_SIZE + 8,
    height: CIRCLE_SIZE,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.white,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
  circleFocused: {
    backgroundColor: colors.primaryLight,
  },
});

export default FloatingSearchTabIcon;
