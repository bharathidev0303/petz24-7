import React from 'react';
import { View, Image } from 'react-native';
import AppText from './AppText';
import Button from './Button';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';

const aboutImage = require('../../assets/home/about-image.png');

const IMAGE_ASPECT_RATIO = 679 / 538;
const CARD_MIN_HEIGHT = 440;

const HomeOnlineConsultation = ({ onBookPress }) => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  return (
    <View style={[styles.banner, { backgroundColor: colors.consultationCard }]}>
      <View style={styles.imageWrap}>
        <Image source={aboutImage} style={styles.image} resizeMode="contain" />
      </View>

      <View style={styles.textOverlay}>
        <AppText style={styles.overline}>ONLINE CONSULTATION</AppText>
        <AppText style={styles.titleBold}>CONNECT WITH</AppText>
        <AppText style={styles.titleLight}>expert vets</AppText>
        <AppText style={styles.description}>
          Consult experienced veterinarians from anywhere through secure online appointments
          and get trusted guidance for your pet's health.
        </AppText>
        <Button onPress={onBookPress} style={styles.button}>
          Book now
        </Button>
      </View>
    </View>
  );
};

const createStyles = colors => ({
  banner: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 28,
    width: '100%',
    minHeight: CARD_MIN_HEIGHT,
    position: 'relative',
  },
  imageWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 118,
    width: '100%',
    aspectRatio: IMAGE_ASPECT_RATIO,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
  },
  overline: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.primaryText,
    marginBottom: 8,
  },
  titleBold: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryText,
    lineHeight: 26,
  },
  titleLight: {
    fontSize: 22,
    fontWeight: '400',
    color: colors.primaryText,
    lineHeight: 26,
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.secondaryText,
    marginBottom: 14,
  },
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});

export default HomeOnlineConsultation;
