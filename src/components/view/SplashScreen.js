import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, Dimensions, Image } from 'react-native';
import AppText from './AppText';
import { useThemedStyles } from '../../theme/useThemedStyles';

const { width } = Dimensions.get('window');
const logoSource = require('../../assets/splash-logo.png');

const SPLASH_TIMINGS = {
  logoFadeMs: 600,
  welcomeFadeMs: 700,
  progressMs: 500,
  loadingFadeMs: 200,
  holdBeforeFinishMs: 1800,
};

export default function SplashScreen({ onFinish }) {
  const styles = useThemedStyles(createStyles);
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const welcomeFade = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const loadingFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoFade, {
          toValue: 1,
          duration: SPLASH_TIMINGS.logoFadeMs,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]),
      Animated.timing(welcomeFade, {
        toValue: 1,
        duration: SPLASH_TIMINGS.welcomeFadeMs,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: SPLASH_TIMINGS.progressMs,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(loadingFade, {
        toValue: 1,
        duration: SPLASH_TIMINGS.loadingFadeMs,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onFinish) setTimeout(onFinish, SPLASH_TIMINGS.holdBeforeFinishMs);
    });
  }, [onFinish, logoFade, logoScale, welcomeFade, progressAnim, loadingFade]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.6],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: logoFade, transform: [{ scale: logoScale }] }}>
        <Image source={logoSource} style={styles.logoImage} resizeMode="contain" />
      </Animated.View>

      <Animated.View style={[styles.messageContainer, { opacity: welcomeFade }]}>
        <AppText style={styles.welcomeText}>Welcome to Petz 24x7</AppText>
        <AppText style={styles.tagline}>Your pet's favourite store</AppText>
      </Animated.View>

      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>

      <Animated.View style={[styles.loadingContainer, { opacity: loadingFade }]}>
        <AppText style={styles.loadingText}>Loading, please wait...</AppText>
      </Animated.View>
    </View>
  );
}

const createStyles = colors => {
  const screenWidth = Dimensions.get('window').width;
  const logoWidth = Math.min(screenWidth * 0.86, 320);
  const logoHeight = logoWidth * (342 / 1024);

  return {
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: logoWidth,
    height: logoHeight,
  },
  messageContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  tagline: {
    marginTop: 6,
    fontSize: 14,
    color: colors.secondaryText,
  },
  progressContainer: {
    width: width * 0.6,
    height: 6,
    backgroundColor: colors.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 40,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  loadingContainer: { marginTop: 20 },
  loadingText: {
    fontSize: 15,
    color: colors.secondaryText,
    fontWeight: '500',
  },
};
};
