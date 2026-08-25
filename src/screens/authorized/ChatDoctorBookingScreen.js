import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import SubScreenHeader from '../../components/view/SubScreenHeader';
import BookingStepIndicator from '../../components/view/BookingStepIndicator';
import BookingPetSelector from '../../components/view/BookingPetSelector';
import { BackArrow, Document, Doctor, Paw, Plan } from '../../components/icons';
import { AppToastService } from '../../components/view/AppToast';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';
import { petsAPI } from '../../api/pets';
import {
  bookingAPI,
  normalizeDoctorLanguages,
  normalizeDoctors,
} from '../../api/booking';
import { chatAPI, buildChatPlanObj } from '../../api/chat';
import { supportAPI } from '../../api/support';
import { getAssetUrl } from '../../config/env';
import { getUserErrorMessage } from '../../utils/apiError';

const CHAT_BOOKING_STEPS = [
  { id: 1, label: 'Select Pet', Icon: Paw },
  { id: 2, label: 'Pet Problem', Icon: Doctor },
  { id: 3, label: 'Select Plan', Icon: Plan },
  { id: 4, label: 'Review Booking', Icon: Document },
];

const firstPresent = (source, keys) => {
  for (const key of keys) {
    const value = source?.[key];
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text && text !== '0') return text;
  }
  return '';
};

const getDoctorDetails = doctor => {
  const name = firstPresent(doctor, ['doctor_name', 'name']) || 'Doctor';
  const designation = firstPresent(doctor, ['designation', 'doctor_designation', 'title']);
  const specialization = firstPresent(doctor, ['specialization', 'speciality', 'department']);
  const qualification = firstPresent(doctor, ['qualification', 'degree', 'education']);
  const experienceRaw = firstPresent(doctor, [
    'experience',
    'experience_year',
    'experience_years',
    'exp',
  ]);
  const experience = experienceRaw
    ? /\d/.test(experienceRaw) && !/year|yr/i.test(experienceRaw)
      ? `${experienceRaw} years experience`
      : experienceRaw
    : '';
  const language = firstPresent(doctor, ['language', 'language_name']);
  const image = getAssetUrl(
    firstPresent(doctor, ['doctor_img', 'doctor_image', 'image', 'profile_img', 'photo']),
  );

  return { name, designation, specialization, qualification, experience, language, image };
};

const parseSupportDetails = response => ({
  phone: response?.support_contact || response?.data?.support_contact || '9095561414',
  email: response?.support_email || response?.data?.support_email || 'petz247@gmail.com',
});

const SectionTitle = ({ title, subtitle }) => {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.sectionHeader}>
      <AppText style={styles.sectionTitle}>{title}</AppText>
      {subtitle ? <AppText style={styles.sectionSubtitle}>{subtitle}</AppText> : null}
    </View>
  );
};

const SelectableCard = ({ selected, onPress, children, style }) => {
  const styles = useThemedStyles(createStyles);
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.selectCard, selected && styles.selectCardActive, style]}>
      {children}
    </TouchableOpacity>
  );
};

const ReviewRow = ({ label, value }) => {
  const styles = useThemedStyles(createStyles);
  if (!value) return null;
  return (
    <View style={styles.reviewRow}>
      <AppText style={styles.reviewLabel}>{label}</AppText>
      <AppText style={styles.reviewValue}>{value}</AppText>
    </View>
  );
};

const ChatDoctorBookingScreen = () => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { user } = useSelector(state => state.auth);

  const [step, setStep] = useState(1);
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [petProblem, setPetProblem] = useState('');
  const [problemImage, setProblemImage] = useState(null);
  const [problemPreview, setProblemPreview] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [languageId, setLanguageId] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [loadingPets, setLoadingPets] = useState(true);
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [plans, setPlans] = useState([]);
  const [supportPhone, setSupportPhone] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [bookingStatusMessage, setBookingStatusMessage] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const languageLabel = languages.find(item => item.id === languageId)?.label || '';

  const loadLanguages = useCallback(async () => {
    setLoadingLanguages(true);
    try {
      const response = await bookingAPI.getDoctorLanguages();
      setLanguages(normalizeDoctorLanguages(response));
    } catch (err) {
      AppToastService.show(getUserErrorMessage(err, 'Could not load languages'), 'error');
      setLanguages([]);
    } finally {
      setLoadingLanguages(false);
    }
  }, []);

  const loadPets = useCallback(async () => {
    if (!user?.id) return;
    setLoadingPets(true);
    try {
      const list = await petsAPI.getUserPetList(user.id);
      setPets(list);
    } catch (err) {
      AppToastService.show(getUserErrorMessage(err, 'Could not load pets'), 'error');
      setPets([]);
    } finally {
      setLoadingPets(false);
    }
  }, [user?.id]);

  const loadDoctors = useCallback(async langId => {
    if (!langId) return;
    setLoadingDoctors(true);
    setSelectedDoctor(null);
    try {
      const response = await bookingAPI.getDoctors(langId);
      setDoctors(normalizeDoctors(response));
    } catch (err) {
      AppToastService.show(getUserErrorMessage(err, 'Could not load doctors'), 'error');
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  }, []);

  const loadPlans = useCallback(async () => {
    setLoadingPlans(true);
    setSelectedPlan(null);
    try {
      const list = await chatAPI.getChatPlans();
      setPlans(list);
    } catch (err) {
      AppToastService.show(getUserErrorMessage(err, 'Could not load chat plans'), 'error');
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  const loadSupportDetails = useCallback(async () => {
    try {
      const response = await supportAPI.getSupportDetails();
      const details = parseSupportDetails(response);
      setSupportPhone(details.phone);
      setSupportEmail(details.email);
    } catch {
      const fallback = parseSupportDetails({});
      setSupportPhone(fallback.phone);
      setSupportEmail(fallback.email);
    }
  }, []);

  useEffect(() => {
    loadPets();
    loadLanguages();
  }, [loadPets, loadLanguages]);

  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [loadPets]),
  );

  useEffect(() => {
    if (languageId) {
      loadDoctors(languageId);
    } else {
      setDoctors([]);
      setSelectedDoctor(null);
    }
  }, [languageId, loadDoctors]);

  useEffect(() => {
    if (step === 3) {
      loadPlans();
    }
  }, [step, loadPlans]);

  useEffect(() => {
    if (step === 5) {
      loadSupportDetails();
    }
  }, [step, loadSupportDetails]);

  const handleWhatsappChange = value => {
    setWhatsapp(value.replace(/\D/g, '').slice(0, 10));
  };

  const pickProblemImage = () => {
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

        setProblemImage({
          uri: asset.uri,
          name: asset.fileName || `problem_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
        });
        setProblemPreview(asset.uri);
      },
    );
  };

  const clearProblemImage = () => {
    setProblemImage(null);
    setProblemPreview('');
  };

  const validateStep = currentStep => {
    if (currentStep === 1) {
      if (!selectedPet) {
        AppToastService.show('Please select a pet', 'warning');
        return false;
      }
    }

    if (currentStep === 2) {
      if (!petProblem.trim()) {
        AppToastService.show('Please describe the pet problem', 'warning');
        return false;
      }
      if (whatsapp.length !== 10) {
        AppToastService.show('Please enter a valid 10-digit WhatsApp number', 'warning');
        return false;
      }
      if (!languageId) {
        AppToastService.show('Please select a preferred language', 'warning');
        return false;
      }
      if (!selectedDoctor) {
        AppToastService.show('Please select a doctor', 'warning');
        return false;
      }
    }

    if (currentStep === 3) {
      if (!selectedPlan) {
        AppToastService.show('Please select a chat plan', 'warning');
        return false;
      }
    }

    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep(prev => prev + 1);
  };

  const goPrevious = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
      return;
    }
    navigation.goBack();
  };

  const handleBack = () => {
    if (step === 5) {
      navigation.navigate('ChatDoctor');
      return;
    }
    if (step > 1) {
      setStep(prev => prev - 1);
      return;
    }
    navigation.goBack();
  };

  const handleMakePayment = async () => {
    if (!user?.id || !selectedPet || !selectedDoctor || !selectedPlan) return;

    setSubmitting(true);
    try {
      const response = await chatAPI.addChatBooking({
        user_id: user.id,
        user_pet_name: selectedPet.name || '',
        user_pet_id: selectedPet.user_pety_id,
        pet_id: selectedPet.pet_id,
        plan_id: selectedPlan.chat_plan_id,
        plan_info: selectedPlan.chat_plan_duration,
        plan_obj: buildChatPlanObj(selectedPlan),
        doctor_id: selectedDoctor.doctor_id,
        doctor_name: selectedDoctor.doctor_name,
        booking_date: '',
        slot_id: '0',
        slot_info: '',
        pet_problem: petProblem.trim(),
        whatsapp_number: whatsapp,
        problem_img: problemImage,
      });

      const success = response?.code === 200 || response?.status === true;
      setBookingSuccess(success);
      setBookingStatusMessage(
        response?.message ||
          response?.msg ||
          (success ? 'Chat booking confirmed successfully.' : 'Could not complete chat booking.'),
      );
      setStep(5);
    } catch (err) {
      setBookingSuccess(false);
      setBookingStatusMessage(getUserErrorMessage(err, 'Could not complete chat booking'));
      setStep(5);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepOne = () => (
    <BookingPetSelector
      subtitle="Choose one pet to continue with chat booking."
      pets={pets}
      loading={loadingPets}
      selectedPet={selectedPet}
      onSelectPet={setSelectedPet}
      onAddPet={() => navigation.navigate('AddEditPet')}
    />
  );

  const renderStepTwo = () => (
    <View>
      <SectionTitle title="Describe Pet Problem" />
      <TextInput
        value={petProblem}
        onChangeText={setPetProblem}
        placeholder="Describe your pet's problem"
        placeholderTextColor={colors.secondaryText}
        multiline
        textAlignVertical="top"
        style={[styles.input, styles.textArea]}
      />

      <SectionTitle title="Pet Problem Image (Optional)" />
      {problemPreview ? (
        <View style={styles.imagePreviewWrap}>
          <Image source={{ uri: problemPreview }} style={styles.problemPreview} resizeMode="cover" />
          <TouchableOpacity onPress={clearProblemImage} style={styles.removeImageBtn}>
            <AppText style={styles.removeImageText}>Remove</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadBtn} onPress={pickProblemImage} activeOpacity={0.85}>
          <AppText style={styles.uploadBtnText}>Upload Image</AppText>
        </TouchableOpacity>
      )}

      <SectionTitle title="WhatsApp Number" />
      <View style={styles.phoneRow}>
        <AppText style={styles.phonePrefix}>+91</AppText>
        <TextInput
          value={whatsapp}
          onChangeText={handleWhatsappChange}
          placeholder="10 digit mobile number"
          placeholderTextColor={colors.secondaryText}
          keyboardType="phone-pad"
          maxLength={10}
          style={[styles.input, styles.phoneInput]}
        />
      </View>

      <SectionTitle title="Preferred Doctor Language" />
      {loadingLanguages ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : languages.length ? (
        <View style={styles.chipRow}>
          {languages.map(option => {
            const selected = languageId === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setLanguageId(option.id)}>
                <AppText style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {option.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <AppText style={styles.emptyText}>No languages available.</AppText>
      )}

      {languageId ? (
        <>
          <SectionTitle title={`Doctor List${languageLabel ? ` (${languageLabel})` : ''}`} />
          {loadingDoctors ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : doctors.length ? (
            doctors.map(doctor => {
              const selected = selectedDoctor?.doctor_id === doctor.doctor_id;
              const details = getDoctorDetails(doctor);
              return (
                <SelectableCard
                  key={doctor.doctor_id}
                  selected={selected}
                  onPress={() => setSelectedDoctor(doctor)}>
                  <View style={styles.petRow}>
                    {details.image ? (
                      <Image source={{ uri: details.image }} style={styles.petImage} />
                    ) : (
                      <View style={[styles.petImage, styles.petImagePlaceholder]}>
                        <AppText style={styles.petInitial}>{details.name.charAt(0)}</AppText>
                      </View>
                    )}
                    <View style={styles.petInfo}>
                      <AppText style={styles.cardTitle}>{details.name}</AppText>
                      {details.designation ? (
                        <AppText style={styles.designation}>{details.designation}</AppText>
                      ) : null}
                      {details.specialization ? (
                        <AppText style={styles.cardMeta}>{details.specialization}</AppText>
                      ) : null}
                    </View>
                    <View style={[styles.radio, selected && styles.radioSelected]} />
                  </View>
                </SelectableCard>
              );
            })
          ) : (
            <AppText style={styles.emptyText}>No doctors available for this language.</AppText>
          )}
        </>
      ) : null}
    </View>
  );

  const renderStepThree = () => (
    <View>
      <SectionTitle title="Select Plan" subtitle="Choose a chat subscription plan for your pet." />
      {loadingPlans ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : plans.length ? (
        plans.map(plan => {
          const selected = selectedPlan?.chat_plan_id === plan.chat_plan_id;
          return (
            <SelectableCard
              key={plan.chat_plan_id}
              selected={selected}
              onPress={() => setSelectedPlan(plan)}
              style={styles.planCard}>
              {plan.chat_plan_img ? (
                <Image source={{ uri: plan.chat_plan_img }} style={styles.chatPlanImage} resizeMode="contain" />
              ) : null}
              <View style={styles.planInfo}>
                <AppText style={styles.cardTitle}>{plan.chat_plan_name}</AppText>
                <AppText style={styles.cardMeta}>{plan.chat_plan_duration} Month(s)</AppText>
                <AppText style={styles.planPrice}>₹{plan.chat_plan_price}</AppText>
              </View>
            </SelectableCard>
          );
        })
      ) : (
        <AppText style={styles.emptyText}>No chat plans available.</AppText>
      )}
    </View>
  );

  const renderStepFour = () => {
    const doctorDetails = getDoctorDetails(selectedDoctor);
    return (
      <View>
        <SectionTitle
          title="Review Booking"
          subtitle="Please review your chat booking details before payment."
        />
        <View style={styles.reviewCard}>
          <ReviewRow label="Pet" value={selectedPet?.name} />
          <ReviewRow label="Problem" value={petProblem} />
          <ReviewRow label="WhatsApp" value={whatsapp ? `+91 ${whatsapp}` : ''} />
          <ReviewRow label="Language" value={languageLabel} />
          <ReviewRow label="Doctor" value={doctorDetails.name} />
          <ReviewRow
            label="Plan"
            value={
              selectedPlan
                ? `${selectedPlan.chat_plan_name} - ${selectedPlan.chat_plan_duration} Month(s)`
                : ''
            }
          />
          <ReviewRow
            label="Amount"
            value={selectedPlan?.chat_plan_price ? `₹ ${selectedPlan.chat_plan_price}` : ''}
          />
        </View>
      </View>
    );
  };

  const renderStepFive = () => (
    <View style={styles.successWrap}>
      <View style={[styles.successBadge, !bookingSuccess && styles.successBadgeError]}>
        <AppText style={styles.successBadgeText}>{bookingSuccess ? '✓' : '!'}</AppText>
      </View>
      <AppText style={styles.successTitle}>
        {bookingSuccess ? 'Booking Confirmed' : 'Booking Failed'}
      </AppText>
      <AppText style={styles.successMessage}>{bookingStatusMessage}</AppText>
      {bookingSuccess ? (
        <AppText style={styles.successMessage}>
          You will be redirected to chat support once payment is processed.
        </AppText>
      ) : null}
      <AppText style={styles.successHelp}>For any help, contact us at:</AppText>
      <AppText style={styles.successContact}>{supportEmail}</AppText>
      <AppText style={styles.successContact}>{supportPhone}</AppText>
      <Button
        onPress={() => navigation.navigate('ChatDoctor')}
        style={styles.homeBtn}>
        {bookingSuccess ? 'Back to Chat' : 'Try Again'}
      </Button>
    </View>
  );

  const renderStepContent = () => {
    if (step === 1) return renderStepOne();
    if (step === 2) return renderStepTwo();
    if (step === 3) return renderStepThree();
    if (step === 4) return renderStepFour();
    return renderStepFive();
  };

  const showFooter = step >= 1 && step <= 4;
  const footerLabel = step === 4 ? 'Make Payment' : 'Continue';

  return (
    <View style={styles.container}>
      <SubScreenHeader title="Chat Booking" onBack={handleBack} />

      {step <= 4 ? <BookingStepIndicator steps={CHAT_BOOKING_STEPS} currentStep={step} /> : null}

      <View style={styles.body}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {renderStepContent()}
          </ScrollView>
        </KeyboardAvoidingView>

        {showFooter ? (
          <View style={styles.bottomBar}>
            <View style={styles.footerRow}>
              {step > 1 ? (
                <TouchableOpacity style={styles.backButton} onPress={goPrevious} activeOpacity={0.85}>
                  <BackArrow />
                  <AppText style={styles.backButtonText}>Back</AppText>
                </TouchableOpacity>
              ) : null}

              {step === 4 ? (
                <Button loading={submitting} onPress={handleMakePayment} style={styles.primaryButton}>
                  {footerLabel}
                </Button>
              ) : (
                <Button onPress={goNext} style={styles.primaryButton}>
                  {footerLabel}
                </Button>
              )}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const createStyles = colors =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.homeBody },
    body: { flex: 1 },
    flex: { flex: 1 },
    content: { flexGrow: 1, padding: 16, paddingBottom: 24 },
    sectionHeader: { marginBottom: 12, marginTop: 4 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.primaryText, marginBottom: 4 },
    sectionSubtitle: { fontSize: 13, color: colors.secondaryText, lineHeight: 18 },
    selectCard: {
      backgroundColor: colors.white,
      borderRadius: 14,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectCardActive: { borderColor: colors.primary, backgroundColor: '#FFF9F4' },
    petRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    petImage: { width: 56, height: 56, borderRadius: 12, backgroundColor: colors.lightGray },
    petImagePlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF5ED' },
    petInitial: { fontSize: 20, fontWeight: '700', color: colors.primary },
    petInfo: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: colors.primaryText, marginBottom: 4 },
    designation: { fontSize: 14, fontWeight: '600', color: colors.button, marginBottom: 4 },
    cardMeta: { fontSize: 14, color: colors.secondaryText },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
    },
    radioSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
    input: {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: colors.primaryText,
      marginBottom: 16,
    },
    textArea: { minHeight: 110 },
    phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    phonePrefix: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primaryText,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    phoneInput: { flex: 1, marginBottom: 0 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.white,
    },
    chipSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
    chipText: { fontSize: 14, fontWeight: '600', color: colors.primaryText },
    chipTextSelected: { color: colors.white },
    uploadBtn: {
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
      borderRadius: 12,
      paddingVertical: 18,
      alignItems: 'center',
      marginBottom: 16,
      backgroundColor: colors.white,
    },
    uploadBtnText: { fontSize: 14, fontWeight: '600', color: colors.button },
    imagePreviewWrap: { marginBottom: 16 },
    problemPreview: {
      width: '100%',
      height: 180,
      borderRadius: 12,
      backgroundColor: colors.lightGray,
    },
    removeImageBtn: { alignSelf: 'flex-start', marginTop: 8 },
    removeImageText: { fontSize: 14, fontWeight: '600', color: colors.error },
    planCard: { overflow: 'hidden', padding: 0 },
    chatPlanImage: {
      width: '100%',
      height: 160,
      backgroundColor: colors.lightGray,
    },
    planInfo: { padding: 14 },
    planPrice: { marginTop: 6, fontSize: 18, fontWeight: '700', color: colors.button },
    reviewCard: {
      backgroundColor: colors.white,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reviewRow: {
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    reviewLabel: { fontSize: 13, color: colors.secondaryText, marginBottom: 4 },
    reviewValue: { fontSize: 15, fontWeight: '600', color: colors.primaryText },
    successWrap: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 16 },
    successBadge: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.success,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    successBadgeError: { backgroundColor: colors.error },
    successBadgeText: { fontSize: 34, color: colors.white, fontWeight: '700' },
    successTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primaryText,
      marginBottom: 12,
      textAlign: 'center',
    },
    successMessage: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.secondaryText,
      textAlign: 'center',
      marginBottom: 12,
    },
    successHelp: { fontSize: 14, color: colors.secondaryText, marginBottom: 8, textAlign: 'center' },
    successContact: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.button,
      marginBottom: 6,
      textAlign: 'center',
    },
    homeBtn: { marginTop: 24, minWidth: 180 },
    loader: { marginVertical: 24 },
    emptyWrap: { alignItems: 'center', gap: 16, paddingVertical: 24 },
    emptyText: { fontSize: 14, color: colors.secondaryText, textAlign: 'center' },
    bottomBar: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.white,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    footerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 12,
      paddingHorizontal: 8,
    },
    backButtonText: { fontSize: 15, fontWeight: '600', color: colors.primaryText },
    primaryButton: { flex: 1 },
  });

export default ChatDoctorBookingScreen;
