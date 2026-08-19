import { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import AppText from './AppText';

const { width } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const logoFade = useRef(new Animated.Value(0)).current;
  const welcomeFade = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const loadingFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoFade, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(welcomeFade, { toValue: 1, duration: 500, delay: 300, useNativeDriver: true }),
      ]),
      Animated.timing(progressAnim, { toValue: 1, duration: 500, easing: Easing.linear, useNativeDriver: false }),
      Animated.timing(loadingFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      if (onFinish) setTimeout(onFinish, 500);
    });
  }, [onFinish]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.6],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: logoFade }}>
        <View style={styles.logo}>
          <AppText style={styles.logoText}>🐾</AppText>
        </View>
      </Animated.View>

      <Animated.View style={[styles.messageContainer, { opacity: welcomeFade }]}>
        <AppText style={styles.welcomeText}>Welcome to petz24-7</AppText>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF5ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 48 },
  messageContainer: { marginTop: 20 },
  welcomeText: { fontSize: 20, fontWeight: '700', color: '#F7941E', letterSpacing: 0.5 },
  progressContainer: {
    width: width * 0.6,
    height: 6,
    backgroundColor: '#EFEFEF',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 40,
  },
  progressBar: { height: 6, backgroundColor: '#F7941E', borderRadius: 3 },
  loadingContainer: { marginTop: 20 },
  loadingText: { fontSize: 15, color: '#666', fontWeight: '500' },
});
