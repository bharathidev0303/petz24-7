import React from 'react';
import { View, Image, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import AppText from '../AppText';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';
import { getUserPetImageUrl } from '../../config/env';

const SectionTitle = ({ title, subtitle, styles }) => (
  <View style={styles.sectionHeader}>
    <AppText style={styles.sectionTitle}>{title}</AppText>
    {subtitle ? <AppText style={styles.sectionSubtitle}>{subtitle}</AppText> : null}
  </View>
);

const SelectableCard = ({ selected, onPress, children, style, styles }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={[styles.selectCard, selected && styles.selectCardActive, style]}>
    {children}
  </TouchableOpacity>
);

const BookingPetSelector = ({
  title = 'Please select the pet for consultation:',
  subtitle = 'Choose one pet to continue.',
  pets = [],
  loading = false,
  selectedPet,
  onSelectPet,
  onAddPet,
}) => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  return (
    <View>
      <SectionTitle title={title} subtitle={subtitle} styles={styles} />

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <>
          {pets.map(pet => {
            const selected = selectedPet?.user_pety_id === pet.user_pety_id;
            const imageUri = getUserPetImageUrl(pet.pet_img);

            return (
              <SelectableCard
                key={pet.user_pety_id}
                selected={selected}
                onPress={() => onSelectPet?.(pet)}
                styles={styles}>
                <View style={styles.petRow}>
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.petImage} />
                  ) : (
                    <View style={[styles.petImage, styles.petImagePlaceholder]}>
                      <AppText style={styles.petInitial}>{(pet.name || '?').charAt(0)}</AppText>
                    </View>
                  )}
                  <View style={styles.petInfo}>
                    <AppText style={styles.cardTitle}>{pet.name || 'Unnamed Pet'}</AppText>
                    <AppText style={styles.cardMeta}>{pet.pet_name || '—'}</AppText>
                    {pet.breed_name ? (
                      <AppText style={styles.cardMeta}>{pet.breed_name}</AppText>
                    ) : null}
                  </View>
                  <View style={[styles.radio, selected && styles.radioSelected]} />
                </View>
              </SelectableCard>
            );
          })}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onAddPet}
            style={styles.addPetCard}>
            <View style={styles.addPetIconWrap}>
              <AppText style={styles.addPetIcon}>+</AppText>
            </View>
            <View style={styles.petInfo}>
              <AppText style={styles.addPetTitle}>Add Pet</AppText>
              <AppText style={styles.addPetSubtitle}>
                {pets.length
                  ? 'Register another pet for this booking'
                  : 'Add your first pet to continue booking'}
              </AppText>
            </View>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const createStyles = colors =>
  StyleSheet.create({
    sectionHeader: {
      marginBottom: 12,
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primaryText,
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: 13,
      color: colors.secondaryText,
      lineHeight: 18,
    },
    selectCard: {
      backgroundColor: colors.white,
      borderRadius: 14,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectCardActive: {
      borderColor: colors.primary,
      backgroundColor: '#FFF9F4',
    },
    petRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    petImage: {
      width: 56,
      height: 56,
      borderRadius: 12,
      backgroundColor: colors.lightGray,
    },
    petImagePlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFF5ED',
    },
    petInitial: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primary,
    },
    petInfo: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primaryText,
      marginBottom: 4,
    },
    cardMeta: {
      fontSize: 14,
      color: colors.secondaryText,
    },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
    },
    radioSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    addPetCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.white,
      borderRadius: 14,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.primary,
      borderStyle: 'dashed',
    },
    addPetIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 12,
      backgroundColor: '#FFF5ED',
      alignItems: 'center',
      justifyContent: 'center',
    },
    addPetIcon: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.primary,
      lineHeight: 30,
    },
    addPetTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 4,
    },
    addPetSubtitle: {
      fontSize: 13,
      color: colors.secondaryText,
      lineHeight: 18,
    },
    loader: {
      marginVertical: 24,
    },
  });

export default BookingPetSelector;
