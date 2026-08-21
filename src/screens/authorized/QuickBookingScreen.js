import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import SubScreenHeader from '../../components/view/SubScreenHeader';
import BookingStepIndicator from '../../components/view/BookingStepIndicator';
import { BackArrow, Document, Phone } from '../../components/icons';
import { AppToastService } from '../../components/view/AppToast';
import { colors } from '../../styles/colors';
import {
  bookingAPI,
  normalizeDoctorLanguages,
  normalizeDoctors,
} from '../../api/booking';
import { supportAPI } from '../../api/support';
import { getAssetUrl } from '../../config/env';
import { getUserErrorMessage } from '../../utils/apiError';

const QUICK_BOOKING_STEPS = [
  { id: 1, label: 'Contact Info', Icon: Phone },
  { id: 2, label: 'Review Booking', Icon: Document },
];

const QUICK_CONSULTATION_AMOUNT = 500;

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

const formatQuickBookingDate = date => {
  const value = date instanceof Date ? date : new Date(date);
  const month = value.toLocaleDateString('en-US', { month: 'short' });
  const day = value.getDate();
  const year = String(value.getFullYear()).slice(-2);
  return `${month} ${day}' ${year}`;
};

const parseSupportDetails = response => ({
  phone: response?.support_contact || response?.data?.support_contact || '9095561414',
  email: response?.support_email || response?.data?.support_email || 'petz247@gmail.com',
});

const SectionTitle = ({ title, subtitle }) => (
  <View style={styles.sectionHeader}>
    <AppText style={styles.sectionTitle}>{title}</AppText>
    {subtitle ? <AppText style={styles.sectionSubtitle}>{subtitle}</AppText> : null}
  </View>
);

const SelectableCard = ({ selected, onPress, children }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={[styles.selectCard, selected && styles.selectCardActive]}>
    {children}
  </TouchableOpacity>
);

const ReviewRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <View style={styles.reviewRow}>
      <AppText style={styles.reviewLabel}>{label}</AppText>
      <AppText style={styles.reviewValue}>{value}</AppText>
    </View>
  );
};

const QuickBookingScreen = () => {
  const navigation = useNavigation();
  const { user } = useSelector(state => state.auth);

  const [step, setStep] = useState(1);
  const [whatsapp, setWhatsapp] = useState('');
  const [languageId, setLanguageId] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [languages, setLanguages] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [supportPhone, setSupportPhone] = useState('');
  const [supportEmail, setSupportEmail] = useState('');

  const bookingDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

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
    loadLanguages();
  }, [loadLanguages]);

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
      loadSupportDetails();
    }
  }, [step, loadSupportDetails]);

  const handleWhatsappChange = value => {
    setWhatsapp(value.replace(/\D/g, '').slice(0, 10));
  };

  const validateStep = currentStep => {
    if (currentStep === 1) {
      if (whatsapp.length !== 10) {
        AppToastService.show('Please enter a valid 10-digit mobile number', 'warning');
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
    if (step === 3) {
      navigation.navigate('Tabs', { screen: 'Home' });
      return;
    }
    if (step > 1) {
      setStep(prev => prev - 1);
      return;
    }
    navigation.goBack();
  };

  const handleMakePayment = async () => {
    if (!user?.id || !selectedDoctor || !languageId) return;

    setSubmitting(true);
    try {
      await bookingAPI.addQuickBooking({
        user_pet_name: '',
        user_pet_id: '0',
        pet_id: '0',
        plan_id: '0',
        doctor_id: selectedDoctor.doctor_id,
        doctor_name: selectedDoctor.doctor_name,
        booking_date: '',
        slot_id: '0',
        slot_info: '',
        pet_problem: '',
        whatsapp_number: whatsapp,
        language_id: languageId,
        language: languageLabel,
        user_id: user.id,
      });

      setStep(3);
    } catch (err) {
      AppToastService.show(getUserErrorMessage(err, 'Could not complete booking'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepOne = () => (
    <View>
      <SectionTitle
        title="Contact Information"
        subtitle="Enter your mobile number, preferred language, and select a doctor."
      />

      <SectionTitle title="Mobile Number" />
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
                  <View style={styles.doctorRow}>
                    {details.image ? (
                      <Image source={{ uri: details.image }} style={styles.doctorImage} />
                    ) : (
                      <View style={[styles.doctorImage, styles.doctorImagePlaceholder]}>
                        <AppText style={styles.doctorInitial}>{details.name.charAt(0)}</AppText>
                      </View>
                    )}
                    <View style={styles.doctorInfo}>
                      <AppText style={styles.cardTitle}>{details.name}</AppText>
                      {details.designation ? (
                        <AppText style={styles.designation}>{details.designation}</AppText>
                      ) : null}
                      {details.specialization ? (
                        <AppText style={styles.cardMeta}>{details.specialization}</AppText>
                      ) : null}
                      {details.qualification ? (
                        <AppText style={styles.cardMeta}>{details.qualification}</AppText>
                      ) : null}
                      {details.experience ? (
                        <AppText style={styles.cardMeta}>{details.experience}</AppText>
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

  const renderStepTwo = () => {
    const doctorDetails = getDoctorDetails(selectedDoctor);
    return (
      <View>
        <SectionTitle
          title="Review Booking"
          subtitle="Please review your booking details before payment."
        />
        <View style={styles.reviewCard}>
          <ReviewRow label="Booking Type" value="Quick Consultation" />
          <ReviewRow label="Doctor Name" value={doctorDetails.name} />
          <ReviewRow label="Booking Date" value={formatQuickBookingDate(bookingDate)} />
          <ReviewRow label="Language" value={languageLabel} />
          <ReviewRow label="Mobile" value={whatsapp ? `+91 ${whatsapp}` : ''} />
          <ReviewRow label="Amount" value={`₹ ${QUICK_CONSULTATION_AMOUNT}`} />
        </View>
      </View>
    );
  };

  const renderStepThree = () => (
    <View style={styles.successWrap}>
      <View style={styles.successBadge}>
        <AppText style={styles.successBadgeText}>✓</AppText>
      </View>
      <AppText style={styles.successTitle}>Booking Confirmed</AppText>
      <AppText style={styles.successMessage}>
        Our doctor will contact you within the next 30 minutes.
      </AppText>
      <AppText style={styles.successHelp}>For any help, contact us at:</AppText>
      <AppText style={styles.successContact}>{supportEmail}</AppText>
      <AppText style={styles.successContact}>{supportPhone}</AppText>
      <Button onPress={() => navigation.navigate('Tabs', { screen: 'Home' })} style={styles.homeBtn}>
        Go to Home
      </Button>
    </View>
  );

  const renderStepContent = () => {
    if (step === 1) return renderStepOne();
    if (step === 2) return renderStepTwo();
    return renderStepThree();
  };

  const showFooter = step >= 1 && step <= 2;
  const footerLabel = step === 2 ? 'Make Payment' : 'Continue';

  return (
    <View style={styles.container}>
      <SubScreenHeader title="Quick Booking" onBack={handleBack} />

      {step <= 2 ? <BookingStepIndicator steps={QUICK_BOOKING_STEPS} currentStep={step} /> : null}

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

              {step === 2 ? (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.homeBody,
  },
  body: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 24,
  },
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
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doctorImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
  },
  doctorImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5ED',
  },
  doctorInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  doctorInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 4,
  },
  designation: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.button,
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
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
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
  phoneInput: {
    flex: 1,
    marginBottom: 0,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
  },
  chipTextSelected: {
    color: colors.white,
  },
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
  reviewLabel: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryText,
  },
  successWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  successBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successBadgeText: {
    fontSize: 34,
    color: colors.white,
    fontWeight: '700',
  },
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
    marginBottom: 24,
  },
  successHelp: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 8,
    textAlign: 'center',
  },
  successContact: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.button,
    marginBottom: 6,
    textAlign: 'center',
  },
  homeBtn: {
    marginTop: 24,
    minWidth: 180,
  },
  loader: {
    marginVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginVertical: 12,
  },
  bottomBar: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    minWidth: 96,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryText,
  },
  primaryButton: {
    flex: 1,
  },
});

export default QuickBookingScreen;
