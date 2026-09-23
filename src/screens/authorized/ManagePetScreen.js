import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import SubScreenHeader from '../../components/view/SubScreenHeader';
import ListCardActions from '../../components/view/ListCardActions';
import ConfirmDialog from '../../components/modals/ConfirmDialog';
import RequestErrorState from '../../components/view/RequestErrorState';
import { AppToastService } from '../../components/view/AppToast';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';
import { petsAPI } from '../../api/pets';
import { getUserPetImageUrl } from '../../config/env';
import { getUserErrorMessage } from '../../utils/apiError';
import { parseCalendarDate } from '../../components/modals/CalendarModal';

const isValidPetDate = value => {
  const raw = String(value || '').trim();
  return raw && raw !== '0000-00-00' && !raw.startsWith('0000-00-00');
};

const computeAgeFromDob = dobStr => {
  const dob = parseCalendarDate(dobStr);
  if (!dob) return null;

  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();

  if (today.getDate() < dob.getDate()) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return {
    years: Math.max(years, 0),
    months: Math.max(months, 0),
  };
};

const formatGender = value => {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return null;
  if (raw === 'm' || raw.startsWith('male')) return 'Male';
  if (raw === 'f' || raw.startsWith('female')) return 'Female';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

const formatAge = pet => {
  const parts = [];
  const years = Number(pet.age_year);
  const months = Number(pet.age_month);

  if (Number.isFinite(years) && years > 0) parts.push(`${years}y`);
  if (Number.isFinite(months) && months > 0) parts.push(`${months}m`);

  if (!parts.length && isValidPetDate(pet.date_of_birth)) {
    const computed = computeAgeFromDob(pet.date_of_birth);
    if (computed?.years > 0) parts.push(`${computed.years}y`);
    if (computed?.months > 0) parts.push(`${computed.months}m`);
  }

  return parts.length ? parts.join(' ') : null;
};

const formatDob = value => {
  if (!isValidPetDate(value)) return null;

  const normalized = String(value).trim().replace(' ', 'T');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return String(value).trim();
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const PetCard = ({ pet, onEdit, onDelete }) => {
  const styles = useThemedStyles(createStyles);
  const imageUri = getUserPetImageUrl(pet.pet_img);
  const ageText = formatAge(pet);
  const genderText = formatGender(pet.gender);
  const dobText = formatDob(pet.date_of_birth);

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.petImage} />
        ) : (
          <View style={[styles.petImage, styles.petImagePlaceholder]}>
            <AppText style={styles.petInitial}>{(pet.name || pet.pet_name || '?').charAt(0)}</AppText>
          </View>
        )}

        <View style={styles.cardBody}>
          <View style={styles.titleRow}>
            <AppText style={styles.petName} numberOfLines={1}>
              {pet.name || 'Unnamed Pet'}
            </AppText>
            <ListCardActions onEdit={() => onEdit(pet)} onDelete={() => onDelete(pet)} />
          </View>

          <AppText style={styles.metaText} numberOfLines={1}>
            {pet.pet_name || '—'}
          </AppText>
          {pet.breed_name ? (
            <AppText style={styles.metaText} numberOfLines={1}>
              {pet.breed_name}
            </AppText>
          ) : null}

          {(genderText || ageText) ? (
            <View style={styles.metaRow}>
              {genderText ? (
                <View style={styles.chip}>
                  <AppText fontFamily="Regular" style={styles.chipText}>
                    {genderText}
                  </AppText>
                </View>
              ) : null}
              {ageText ? (
                <View style={styles.chip}>
                  <AppText fontFamily="Regular" style={styles.chipText}>
                    {ageText}
                  </AppText>
                </View>
              ) : null}
            </View>
          ) : null}

          {dobText ? (
            <AppText style={styles.dobText} numberOfLines={1}>
              DOB: {dobText}
            </AppText>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const ManagePetScreen = () => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const hasLoadedRef = useRef(false);
  const { user } = useSelector(state => state.auth);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPets = useCallback(
    async (isRefresh = false) => {
      if (!user?.id) return;

      if (isRefresh) {
        setRefreshing(true);
      } else if (!hasLoadedRef.current) {
        setLoading(true);
      }
      setError(null);

      try {
        const list = await petsAPI.getUserPetList(user.id);
        setPets(list);
        hasLoadedRef.current = true;
      } catch (err) {
        setError(getUserErrorMessage(err, 'Could not load pets'));
        if (!hasLoadedRef.current) {
          setPets([]);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    hasLoadedRef.current = false;
    setLoading(true);
    setError(null);
  }, [user?.id]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  useFocusEffect(
    useCallback(() => {
      if (hasLoadedRef.current) {
        fetchPets(true);
      }
    }, [fetchPets]),
  );

  const openAdd = () => {
    navigation.navigate('AddEditPet');
  };

  const openEdit = pet => {
    navigation.navigate('AddEditPet', { pet });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await petsAPI.deleteUserPet(deleteTarget.user_pety_id, deleteTarget.pet_img || '');
      AppToastService.show('Pet deleted successfully', 'success');
      setDeleteTarget(null);
      fetchPets(true);
    } catch (err) {
      AppToastService.show(getUserErrorMessage(err, 'Could not delete pet'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleBack = useCallback(() => {
    if (deleteTarget && !deleting) {
      setDeleteTarget(null);
      return;
    }
    navigation.goBack();
  }, [deleteTarget, deleting, navigation]);

  return (
    <View style={styles.container}>
      <SubScreenHeader title="Manage Pet" onBack={handleBack} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <RequestErrorState error={error} onRetry={() => fetchPets()} />
      ) : (
        <>
          <FlatList
            data={pets}
            keyExtractor={item => String(item.user_pety_id)}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchPets(true)}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <AppText style={styles.emptyText}>You have not added any pets yet.</AppText>
              </View>
            }
            renderItem={({ item }) => (
              <PetCard pet={item} onEdit={openEdit} onDelete={setDeleteTarget} />
            )}
          />

          <View style={styles.bottomBar}>
            <Button onPress={openAdd}>Add Pet</Button>
          </View>
        </>
      )}

      <ConfirmDialog
        visible={Boolean(deleteTarget)}
        title="Delete Pet"
        message={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.name || deleteTarget.pet_name || 'this pet'}?`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </View>
  );
};

const createStyles = colors => ({
  container: {
    flex: 1,
    backgroundColor: colors.homeBody,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  listContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  petImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
  },
  petImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5ED',
  },
  petInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  petName: {
    flex: 1,
    minWidth: 0,
    fontSize: 17,
    fontWeight: '700',
    color: colors.primaryText,
  },
  metaText: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  chip: {
    backgroundColor: '#FFF5ED',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 12,
    color: colors.primaryText,
    lineHeight: 16,
  },
  dobText: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 12,
    paddingTop: 4,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

export default ManagePetScreen;
