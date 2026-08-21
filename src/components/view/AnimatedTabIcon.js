import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

const AnimatedTabIcon = ({ focused, color, size, Icon }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.18 : 1,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: focused ? -3 : 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(bounce, {
          toValue: 0,
          friction: 4,
          tension: 120,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [focused, scale, bounce]);

  return (
    <Animated.View style={{ transform: [{ scale }, { translateY: bounce }] }}>
      <Icon width={size} height={size} color={color} />
    </Animated.View>
  );
};

export default AnimatedTabIcon;
