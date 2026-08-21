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
import { colors } from '../../styles/colors';
import { petsAPI } from '../../api/pets';
import { getUserPetImageUrl } from '../../config/env';
import { getUserErrorMessage } from '../../utils/apiError';

const formatAge = pet => {
  const parts = [];
  if (pet.age_year) parts.push(`${pet.age_year}y`);
  if (pet.age_month) parts.push(`${pet.age_month}m`);
  return parts.length ? parts.join(' ') : null;
};

const PetCard = ({ pet, onEdit, onDelete }) => {
  const imageUri = getUserPetImageUrl(pet.pet_img);
  const ageText = formatAge(pet);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTop}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.petImage} />
          ) : (
            <View style={[styles.petImage, styles.petImagePlaceholder]}>
              <AppText style={styles.petInitial}>{(pet.name || pet.pet_name || '?').charAt(0)}</AppText>
            </View>
          )}

          <View style={styles.cardInfo}>
            <AppText style={styles.petName}>{pet.name || 'Unnamed Pet'}</AppText>
            <AppText style={styles.metaText}>{pet.pet_name || '—'}</AppText>
            {pet.breed_name ? <AppText style={styles.metaText}>{pet.breed_name}</AppText> : null}
            <View style={styles.metaRow}>
              {pet.gender ? (
                <AppText style={styles.chip}>{pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}</AppText>
              ) : null}
              {ageText ? <AppText style={styles.chip}>{ageText}</AppText> : null}
              {pet.date_of_birth ? <AppText style={styles.chip}>{pet.date_of_birth}</AppText> : null}
            </View>
          </View>
        </View>

        <ListCardActions onEdit={() => onEdit(pet)} onDelete={() => onDelete(pet)} />
      </View>
    </View>
  );
};

const ManagePetScreen = () => {
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

const styles = StyleSheet.create({
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTop: {
    flex: 1,
    flexDirection: 'row',
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
  cardInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 4,
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
    fontSize: 12,
    color: colors.primaryText,
    backgroundColor: '#FFF5ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
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
