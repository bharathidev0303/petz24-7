import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import SubScreenHeader from '../../components/view/SubScreenHeader';
import { useThemedStyles } from '../../theme/useThemedStyles';

const doctorImage = require('../../assets/booking-doctor.png');
const quickImage = require('../../assets/booking-quick.png');

const BookingCard = ({ image, title, description, buttonLabel, onPress }) => {
  const styles = useThemedStyles(createStyles);

  return (
  <View style={styles.card}>
    <View style={styles.imageWrap}>
      <Image source={image} style={styles.image} resizeMode="contain" />
    </View>
    <AppText style={styles.cardTitle}>{title}</AppText>
    <AppText style={styles.cardDescription}>{description}</AppText>
    <Button style={styles.cardButton} onPress={onPress}>
      {buttonLabel}
    </Button>
  </View>
  );
};

const BookingScreen = () => {
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();

  const handleDoctorBooking = () => {
    navigation.navigate('DoctorBooking');
  };

  const handleQuickBooking = () => {
    navigation.navigate('QuickBooking');
  };

  return (
    <View style={styles.container}>
      <SubScreenHeader title="Booking" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText style={styles.pageTitle}>Choose a Booking Type</AppText>

        <BookingCard
          image={doctorImage}
          title="Doctor Booking"
          description="Schedule a consultation with our certified vets for your pet’s wellness check & treatments."
          buttonLabel="Book Now"
          onPress={handleDoctorBooking}
        />

        <BookingCard
          image={quickImage}
          title="Quick Booking"
          description="Need something fast? Book grooming, urgent care or quick services with convenience."
          buttonLabel="Quick Book"
          onPress={handleQuickBooking}
        />
      </ScrollView>
    </View>
  );
};

const createStyles = colors => ({
  container: {
    flex: 1,
    backgroundColor: colors.homeBody,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageWrap: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.secondaryText,
    marginBottom: 16,
  },
  cardButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 24,
    minWidth: 140,
  },
});

export default BookingScreen;
