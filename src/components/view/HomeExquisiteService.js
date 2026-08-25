import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AppText from './AppText';
import { Doctor, ContactUs, Phone, Shield } from '../icons';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';

const heroImage = require('../../assets/home/exquisite_service.png');
const serviceImages = {
  productOrders: require('../../assets/home/s-image01.png'),
  fastDelivery: require('../../assets/home/s-image02.png'),
  petWellness: require('../../assets/home/s-image03.png'),
  qualitySupport: require('../../assets/home/s-image04.png'),
};

const SIDE_FEATURES = [
  {
    id: 'quality-support',
    title: 'Quality support',
    subtitle: 'Always online 24/7',
    Icon: Shield,
  },
  {
    id: 'doctor-booking',
    title: 'Doctor Booking',
    subtitle: 'Schedule vet appointments',
    Icon: Doctor,
  },
  {
    id: 'online-consultation',
    title: 'Online Consultation',
    subtitle: 'Connect vets instantly',
    Icon: Phone,
  },
  {
    id: 'chat-doctor',
    title: 'Chat with Doctor',
    subtitle: 'Message experts anytime',
    Icon: ContactUs,
  },
];

const SERVICE_CARDS = [
  {
    id: 'product-orders',
    title: 'Product Orders',
    subtitle: 'Shop pet essentials products',
    image: serviceImages.productOrders,
  },
  {
    id: 'fast-delivery',
    title: 'Fast Delivery',
    subtitle: 'Doorstep orders delivered',
    image: serviceImages.fastDelivery,
  },
  {
    id: 'quality-support-card',
    title: 'Quality Support',
    subtitle: 'Available twenty four-seven',
    image: serviceImages.qualitySupport,
  },
  {
    id: 'pet-wellness',
    title: 'Pet Wellness',
    subtitle: 'Complete care solutions',
    image: serviceImages.petWellness,
  },
];

const FeatureItem = ({ title, subtitle, Icon, onPress }) => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  return (
  <TouchableOpacity
    activeOpacity={onPress ? 0.85 : 1}
    onPress={onPress}
    style={styles.featureItem}
    disabled={!onPress}>
    <View style={styles.featureIconCircle}>
      <Icon width={22} height={22} color={colors.primaryText} />
    </View>
    <View style={styles.featureTextWrap}>
      <AppText style={styles.featureTitle}>{title}</AppText>
      <AppText style={styles.featureSubtitle}>{subtitle}</AppText>
    </View>
  </TouchableOpacity>
  );
};

const ServiceCard = ({ title, subtitle, image, onPress }) => {
  const styles = useThemedStyles(createStyles);

  return (
  <TouchableOpacity
    activeOpacity={onPress ? 0.85 : 1}
    onPress={onPress}
    style={styles.serviceCard}
    disabled={!onPress}>
    <Image source={image} style={styles.serviceCardImage} resizeMode="contain" />
    <AppText style={styles.serviceCardTitle}>{title}</AppText>
    <AppText style={styles.serviceCardSubtitle}>{subtitle}</AppText>
  </TouchableOpacity>
  );
};

const HomeExquisiteService = ({
  onQualitySupportPress,
  onDoctorBookingPress,
  onOnlineConsultationPress,
  onChatDoctorPress,
  onProductOrdersPress,
  onFastDeliveryPress,
  onQualitySupportCardPress,
  onPetWellnessPress,
}) => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const featureHandlers = {
    'quality-support': onQualitySupportPress,
    'doctor-booking': onDoctorBookingPress,
    'online-consultation': onOnlineConsultationPress,
    'chat-doctor': onChatDoctorPress,
  };

  const cardHandlers = {
    'product-orders': onProductOrdersPress,
    'fast-delivery': onFastDeliveryPress,
    'quality-support-card': onQualitySupportCardPress,
    'pet-wellness': onPetWellnessPress,
  };

  return (
    <View style={styles.section}>
      <AppText style={styles.sectionTitle}>Exquisite service</AppText>

      <Image source={heroImage} style={styles.heroImage} resizeMode="contain" />

      <View style={styles.featureGrid}>
        {SIDE_FEATURES.map(feature => (
          <FeatureItem
            key={feature.id}
            title={feature.title}
            subtitle={feature.subtitle}
            Icon={feature.Icon}
            onPress={featureHandlers[feature.id]}
          />
        ))}
      </View>

      <View style={styles.serviceCardGrid}>
        {SERVICE_CARDS.map(card => (
          <ServiceCard
            key={card.id}
            title={card.title}
            subtitle={card.subtitle}
            image={card.image}
            onPress={cardHandlers[card.id]}
          />
        ))}
      </View>
    </View>
  );
};

const createStyles = colors => ({
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: 16,
  },
  heroImage: {
    width: '100%',
    height: 220,
    marginBottom: 20,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  featureItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    minWidth: 0,
  },
  featureIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  featureTextWrap: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.secondaryText,
  },
  serviceCardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceCardImage: {
    width: 56,
    height: 56,
    marginBottom: 12,
  },
  serviceCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: 6,
  },
  serviceCardSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.secondaryText,
    textAlign: 'center',
  },
});

export default HomeExquisiteService;
