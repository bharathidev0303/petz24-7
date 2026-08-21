import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

const AnimatedMenuItem = ({ index, visible, onPress, children, style }) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(progress, {
        toValue: 1,
        delay: index * 60,
        friction: 7,
        tension: 90,
        useNativeDriver: true,
      }).start();
      return;
    }

    progress.setValue(0);
  }, [visible, index, progress]);

  const animatedStyle = {
    opacity: progress,
    transform: [
      {
        translateX: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [-24, 0],
        }),
      },
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.96, 1],
        }),
      },
    ],
  };

  return (
    <Animated.View style={animatedStyle} pointerEvents="box-none">
      <Pressable
        onPress={onPress}
        hitSlop={8}
        android_ripple={{ color: 'rgba(255, 154, 62, 0.15)' }}
        style={({ pressed }) => [style, pressed && styles.pressed]}>
        {children}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
    backgroundColor: '#FFF5ED',
  },
});

export default AnimatedMenuItem;
