import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';
import AppText from '../../components/AppText';
import AppInput from '../../components/AppInput';
import SubScreenHeader from '../../components/view/SubScreenHeader';
import DropdownModal from '../../components/modals/dropdownModel';
import CalendarModal, { parseCalendarDate } from '../../components/modals/CalendarModal';
import Upload from '../../components/icons/Upload';
import { AppToastService } from '../../components/view/AppToast';
import { colors } from '../../styles/colors';
import { petsAPI } from '../../api/pets';
import { getUserPetImageUrl } from '../../config/env';
import { getUserErrorMessage } from '../../utils/apiError';

const EMPTY_FORM = {
  pet_id: '',
  breed_id: '',
  gender: '',
  date_of_birth: '',
  age_year: '',
  age_month: '',
  name: '',
  old_img: '',
};

const GENDER_OPTIONS = [
  { key: 'male', label: 'Male' },
  { key: 'female', label: 'Female' },
];

const computeAgeFromDob = dobStr => {
  const dob = parseCalendarDate(dobStr);
  if (!dob) return { age_year: '', age_month: '' };

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
    age_year: String(Math.max(years, 0)),
    age_month: String(Math.max(months, 0)),
  };
};

const SelectField = ({ label, required, value, displayValue, placeholder, onPress, error }) => (
  <View style={styles.field}>
    <AppText style={styles.label}>
      {label}
      {required ? <AppText style={styles.required}> *</AppText> : null}
    </AppText>
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.selectInput, error && styles.inputError]}
      onPress={onPress}>
      <AppText style={[styles.selectText, !displayValue && styles.placeholder]}>
        {displayValue || placeholder}
      </AppText>
      <AppText style={styles.chevron}>›</AppText>
    </TouchableOpacity>
    {error ? <AppText style={styles.errorText}>{error}</AppText> : null}
  </View>
);

const TextField = ({ label, value, onChangeText, placeholder, keyboardType, ...props }) => (
  <View style={styles.field}>
    <AppText style={styles.label}>{label}</AppText>
    <AppInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || label}
      placeholderTextColor={colors.secondaryText}
      keyboardType={keyboardType}
      style={styles.textInput}
      {...props}
    />
  </View>
);

const AddEditPetScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useSelector(state => state.auth);
  const initialPet = route.params?.pet;
  const isEdit = Boolean(initialPet?.user_pety_id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [petTypes, setPetTypes] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingBreeds, setLoadingBreeds] = useState(false);
  const [saving, setSaving] = useState(false);
  const [petTypeError, setPetTypeError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dropdown, setDropdown] = useState(null);

  const screenTitle = isEdit ? 'Edit Pet' : 'Add Pet';

  const loadBreeds = useCallback(async petId => {
    if (!petId) {
      setBreeds([]);
      return;
    }

    setLoadingBreeds(true);
    try {
      const list = await petsAPI.getBreedList(petId);
      setBreeds(list);
    } catch {
      setBreeds([]);
    } finally {
      setLoadingBreeds(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoadingMeta(true);
      try {
        const types = await petsAPI.getPetTypes();
        setPetTypes(types);

        if (initialPet) {
          const nextForm = {
            pet_id: String(initialPet.pet_id || ''),
            breed_id: String(initialPet.breed_id || ''),
            gender: initialPet.gender || '',
            date_of_birth: initialPet.date_of_birth || '',
            age_year: String(initialPet.age_year ?? ''),
            age_month: String(initialPet.age_month ?? ''),
            name: initialPet.name || '',
            old_img: initialPet.pet_img || '',
            user_pety_id: String(initialPet.user_pety_id || ''),
          };
          setForm(nextForm);
          setImagePreview(getUserPetImageUrl(initialPet.pet_img));
          await loadBreeds(nextForm.pet_id);
        }
      } catch (err) {
        AppToastService.show(getUserErrorMessage(err, 'Could not load pet options'), 'error');
      } finally {
        setLoadingMeta(false);
      }
    };

    init();
  }, [initialPet, loadBreeds]);

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (key === 'pet_id') {
      setPetTypeError('');
    }
  };

  const handlePetTypeSelect = item => {
    updateField('pet_id', String(item.key));
    updateField('breed_id', '');
    loadBreeds(item.key);
  };

  const petTypeLabel = useMemo(() => {
    const match = petTypes.find(p => String(p.pet_id) === String(form.pet_id));
    return match?.pet_name || initialPet?.pet_name || '';
  }, [petTypes, form.pet_id, initialPet?.pet_name]);

  const breedLabel = useMemo(() => {
    const match = breeds.find(b => String(b.breed_id) === String(form.breed_id));
    return match?.breed_name || initialPet?.breed_name || '';
  }, [breeds, form.breed_id, initialPet?.breed_name]);

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
      },
      response => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (!asset?.uri) return;

        setImageFile({
          uri: asset.uri,
          name: asset.fileName || `pet_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
        });
        setImagePreview(asset.uri);
      },
    );
  };

  const handleSave = async () => {
    if (!user?.id) {
      AppToastService.show('Please sign in to continue', 'warning');
      return;
    }

    if (!form.pet_id) {
      setPetTypeError('Pet type is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        user_id: user.id,
        pet_img: imageFile,
      };

      if (isEdit) {
        await petsAPI.updateUserPet(payload);
        AppToastService.show('Pet updated successfully', 'success');
      } else {
        await petsAPI.addUserPet(payload);
        AppToastService.show('Pet added successfully', 'success');
      }

      navigation.goBack();
    } catch (err) {
      AppToastService.show(getUserErrorMessage(err, 'Could not save pet'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDobSelect = dateStr => {
    const age = computeAgeFromDob(dateStr);
    setForm(prev => ({
      ...prev,
      date_of_birth: dateStr,
      age_year: age.age_year,
      age_month: age.age_month,
    }));
  };

  const handleBack = useCallback(() => {
    if (saving) return;
    if (dropdown) {
      setDropdown(null);
      return;
    }
    navigation.goBack();
  }, [saving, dropdown, navigation]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });

    return () => subscription.remove();
  }, [handleBack]);

  const petTypeOptions = petTypes.map(p => ({ key: p.pet_id, label: p.pet_name }));
  const breedOptions = breeds.map(b => ({ key: b.breed_id, label: b.breed_name }));

  return (
    <View style={styles.container}>
      <SubScreenHeader
        title={screenTitle}
        onBack={handleBack}
        rightAction={{
          label: isEdit ? 'Update' : 'Save',
          onPress: handleSave,
          loading: saving,
          disabled: loadingMeta,
        }}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        {loadingMeta ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <SelectField
              label="Pet Type"
              required
              value={form.pet_id}
              displayValue={petTypeLabel}
              placeholder="Select pet type"
              error={petTypeError}
              onPress={() => setDropdown('petType')}
            />

            <SelectField
              label="Breed"
              value={form.breed_id}
              displayValue={breedLabel}
              placeholder={form.pet_id ? 'Select breed' : 'Select pet type first'}
              onPress={() => form.pet_id && setDropdown('breed')}
            />

            <View style={styles.field}>
              <AppText style={styles.label}>Gender</AppText>
              <View style={styles.chipRow}>
                {GENDER_OPTIONS.map(option => {
                  const selected = form.gender === option.key;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      activeOpacity={0.85}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => updateField('gender', option.key)}>
                      <AppText style={[styles.chipText, selected && styles.chipTextSelected]}>
                        {option.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <SelectField
              label="Date of Birth"
              value={form.date_of_birth}
              displayValue={form.date_of_birth}
              placeholder="Select date of birth"
              onPress={() => setDropdown('date')}
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <TextField
                  label="Age (Years)"
                  value={form.age_year}
                  onChangeText={v => updateField('age_year', v.replace(/[^0-9]/g, ''))}
                  placeholder="Years"
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.halfField}>
                <TextField
                  label="Age (Months)"
                  value={form.age_month}
                  onChangeText={v => updateField('age_month', v.replace(/[^0-9]/g, ''))}
                  placeholder="Months"
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <TextField
              label="Name"
              value={form.name}
              onChangeText={v => updateField('name', v)}
              placeholder="Pet name"
            />

            <View style={styles.field}>
              <AppText style={styles.label}>Pet Image</AppText>
              {imagePreview ? (
                <View style={styles.imagePreviewWrap}>
                  <Image source={{ uri: imagePreview }} style={styles.previewImage} />
                  <TouchableOpacity style={styles.changeImageBtn} onPress={pickImage}>
                    <AppText style={styles.changeImageText}>Change Image</AppText>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadBox} onPress={pickImage} activeOpacity={0.85}>
                  <AppText style={styles.uploadText}>Upload pet image</AppText>
                  <Upload color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      <DropdownModal
        visible={dropdown === 'petType'}
        onClose={() => setDropdown(null)}
        title="Select Pet Type"
        data={petTypeOptions}
        selectedIds={form.pet_id ? [form.pet_id] : []}
        onSelect={handlePetTypeSelect}
        emptyText="No pet types available"
      />

      <DropdownModal
        visible={dropdown === 'breed'}
        onClose={() => setDropdown(null)}
        title="Select Breed"
        data={breedOptions}
        loading={loadingBreeds}
        selectedIds={form.breed_id ? [form.breed_id] : []}
        onSelect={item => updateField('breed_id', String(item.key))}
        emptyText="No breeds available"
      />

      <CalendarModal
        visible={dropdown === 'date'}
        onClose={() => setDropdown(null)}
        title="Select Date of Birth"
        value={form.date_of_birth}
        onSelect={handleDobSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.homeBody,
  },
  flex: {
    flex: 1,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  field: {
    marginBottom: 14,
  },
  halfField: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondaryText,
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: colors.white,
  },
  selectText: {
    flex: 1,
    fontSize: 15,
    color: colors.primaryText,
  },
  placeholder: {
    color: colors.secondaryText,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    minWidth: 88,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
    textAlign: 'center',
  },
  chipTextSelected: {
    color: colors.white,
  },
  chevron: {
    fontSize: 20,
    color: colors.secondaryText,
    marginLeft: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.primaryText,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: colors.error,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFF5ED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  uploadText: {
    fontSize: 14,
    color: colors.primaryText,
  },
  imagePreviewWrap: {
    alignItems: 'center',
    gap: 10,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
  },
  changeImageBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.button,
  },
  changeImageText: {
    color: colors.button,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default AddEditPetScreen;
