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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import SubScreenHeader from '../../components/view/SubScreenHeader';
import BookingStepIndicator from '../../components/view/BookingStepIndicator';
import BookingPetSelector from '../../components/view/BookingPetSelector';
import { BackArrow, Calendar, Document, Doctor, Paw, Plan } from '../../components/icons';
import { AppToastService } from '../../components/view/AppToast';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';
import { petsAPI } from '../../api/pets';
import {
  bookingAPI,
  normalizeDoctorLanguages,
  normalizeDoctors,
  normalizePlans,
  normalizeTimeSlots,
} from '../../api/booking';
import { supportAPI } from '../../api/support';
import { getAssetUrl } from '../../config/env';
import { getUserErrorMessage } from '../../utils/apiError';
import {
  buildSlotInfo,
  formatBookingDate,
  formatDisplayDate,
  getNextSevenDays,
  isSameDay,
} from '../../utils/bookingForm';

const BOOKING_STEPS = [
  { id: 1, label: 'Select Pet(s)', Icon: Paw },
  { id: 2, label: 'Select Doctor', Icon: Doctor },
  { id: 3, label: 'Select Time Slot', Icon: Calendar },
  { id: 4, label: 'Select Plan', Icon: Plan },
  { id: 5, label: 'Review Booking', Icon: Document },
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
  const about = firstPresent(doctor, ['description', 'about', 'bio', 'details', 'doctor_details']);
  const language = firstPresent(doctor, ['language', 'language_name']);
  const image = getAssetUrl(
    firstPresent(doctor, ['doctor_img', 'doctor_image', 'image', 'profile_img', 'photo']),
  );

  return { name, designation, specialization, qualification, experience, about, language, image };
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

const DoctorBookingScreen = () => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { user } = useSelector(state => state.auth);

  const [step, setStep] = useState(1);
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [petProblem, setPetProblem] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [languageId, setLanguageId] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [loadingPets, setLoadingPets] = useState(true);
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [slots, setSlots] = useState([]);
  const [plans, setPlans] = useState([]);
  const [supportPhone, setSupportPhone] = useState('');
  const [supportEmail, setSupportEmail] = useState('');

  const dateOptions = useMemo(() => getNextSevenDays(), []);
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

  const loadSlots = useCallback(async date => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const response = await bookingAPI.getTimeSlots(date);
      setSlots(normalizeTimeSlots(response));
    } catch (err) {
      AppToastService.show(getUserErrorMessage(err, 'Could not load time slots'), 'error');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  const loadPlans = useCallback(async () => {
    if (!selectedPet) return;
    setLoadingPlans(true);
    setSelectedPlan(null);
    try {
      const response = await bookingAPI.getUserPetPlan({
        user_pet_name: selectedPet.name || '',
        user_pet_id: selectedPet.user_pety_id,
        pet_id: selectedPet.pet_id,
        plan_id: '0',
        doctor_id: selectedDoctor?.doctor_id || '0',
        doctor_name: selectedDoctor?.doctor_name || '',
        booking_date: selectedDate ? formatBookingDate(selectedDate) : '',
        slot_id: selectedSlot?.slot_id || '0',
        slot_info: buildSlotInfo(selectedSlot),
        pet_problem: petProblem,
        whatsapp_number: whatsapp,
        plan_type: '1',
      });
      setPlans(normalizePlans(response));
    } catch (err) {
      AppToastService.show(getUserErrorMessage(err, 'Could not load plans'), 'error');
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  }, [selectedPet, selectedDoctor, selectedDate, selectedSlot, petProblem, whatsapp]);

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
    if (step === 3) {
      loadSlots(selectedDate);
    }
  }, [step, selectedDate, loadSlots]);

  useEffect(() => {
    if (languageId) {
      loadDoctors(languageId);
    } else {
      setDoctors([]);
      setSelectedDoctor(null);
    }
  }, [languageId, loadDoctors]);

  useEffect(() => {
    if (step === 4) {
      loadPlans();
    }
  }, [step, loadPlans]);

  useEffect(() => {
    if (step === 6) {
      loadSupportDetails();
    }
  }, [step, loadSupportDetails]);

  const handleWhatsappChange = value => {
    setWhatsapp(value.replace(/\D/g, '').slice(0, 10));
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
      if (!selectedDate) {
        AppToastService.show('Please select a date', 'warning');
        return false;
      }
      if (!selectedSlot) {
        AppToastService.show('Please select a time slot', 'warning');
        return false;
      }
    }

    if (currentStep === 4) {
      if (!selectedPlan) {
        AppToastService.show('Please select a plan', 'warning');
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
    if (step === 6) {
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
    if (!user?.id || !selectedPet || !selectedDoctor || !selectedSlot || !selectedPlan) return;

    setSubmitting(true);
    try {
      await bookingAPI.addBooking({
        user_pet_name: selectedPet.name || '',
        user_pet_id: selectedPet.user_pety_id,
        pet_id: selectedPet.pet_id,
        plan_id: selectedPlan.plan_id,
        plan_info: selectedPlan,
        doctor_id: selectedDoctor.doctor_id,
        doctor_name: selectedDoctor.doctor_name,
        booking_date: formatBookingDate(selectedDate),
        slot_id: selectedSlot.slot_id,
        slot_info: buildSlotInfo(selectedSlot),
        pet_problem: petProblem.trim(),
        whatsapp_number: whatsapp,
        plan_type: '1',
        user_id: user.id,
      });

      setStep(6);
    } catch (err) {
      AppToastService.show(getUserErrorMessage(err, 'Could not complete booking'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepOne = () => (
    <BookingPetSelector
      subtitle="Choose one pet to continue with doctor booking."
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
                      {details.qualification ? (
                        <AppText style={styles.cardMeta}>{details.qualification}</AppText>
                      ) : null}
                      {details.experience ? (
                        <AppText style={styles.cardMeta}>{details.experience}</AppText>
                      ) : null}
                      {details.language ? (
                        <AppText style={styles.cardMeta}>{details.language}</AppText>
                      ) : null}
                      {details.about ? (
                        <AppText style={styles.doctorAbout} numberOfLines={3}>
                          {details.about}
                        </AppText>
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
      <SectionTitle
        title="Select Date"
        subtitle="Note: Date will be selectable for next 7 days"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
        {dateOptions.map(date => {
          const selected = isSameDay(date, selectedDate);
          return (
            <TouchableOpacity
              key={date.toISOString()}
              style={[styles.dateChip, selected && styles.dateChipSelected]}
              onPress={() => setSelectedDate(date)}>
              <AppText style={[styles.dateChipText, selected && styles.dateChipTextSelected]}>
                {formatDisplayDate(date)}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <SectionTitle title="Select Time Slot" />
      {loadingSlots ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : slots.length ? (
        <View style={styles.slotGrid}>
          {slots.map(slot => {
            const selected = selectedSlot?.slot_id === slot.slot_id;
            const label = buildSlotInfo(slot) || 'Slot';
            return (
              <TouchableOpacity
                key={String(slot.slot_id)}
                style={[styles.slotChip, selected && styles.slotChipSelected]}
                onPress={() => setSelectedSlot(slot)}>
                <AppText style={[styles.slotText, selected && styles.slotTextSelected]}>{label}</AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <AppText style={styles.emptyText}>No slots available for the selected date.</AppText>
      )}
    </View>
  );

  const renderStepFour = () => (
    <View>
      <SectionTitle title="Select Plan" subtitle="Choose a consultation plan for your pet." />
      {loadingPlans ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : plans.length ? (
        plans.map(plan => {
          const selected = selectedPlan?.plan_id === plan.plan_id;
          const planImage = plan.plan_img ? getAssetUrl(plan.plan_img, { userPet: true }) : null;
          return (
            <SelectableCard
              key={plan.plan_id}
              selected={selected}
              onPress={() => setSelectedPlan(plan)}>
              <View style={styles.planRow}>
                {planImage ? <Image source={{ uri: planImage }} style={styles.planImage} /> : null}
                <View style={styles.planInfo}>
                  <AppText style={styles.cardTitle}>{plan.plan_name}</AppText>
                  {plan.duration ? <AppText style={styles.cardMeta}>{plan.duration}</AppText> : null}
                  {plan.plan_price ? (
                    <AppText style={styles.planPrice}>Rs. {plan.plan_price}</AppText>
                  ) : null}
                </View>
              </View>
              {Array.isArray(plan.services) && plan.services.length ? (
                <View style={styles.serviceList}>
                  {plan.services.map((service, index) => (
                    <AppText key={`${plan.plan_id}-service-${index}`} style={styles.serviceText}>
                      • {service.service_name}
                    </AppText>
                  ))}
                </View>
              ) : null}
            </SelectableCard>
          );
        })
      ) : (
        <AppText style={styles.emptyText}>No plans available.</AppText>
      )}
    </View>
  );

  const renderStepFive = () => {
    const doctorDetails = getDoctorDetails(selectedDoctor);
    return (
    <View>
      <SectionTitle title="Review Booking" subtitle="Please review your booking details before payment." />
      <View style={styles.reviewCard}>
        <ReviewRow label="Pet" value={selectedPet?.name} />
        <ReviewRow label="Problem" value={petProblem} />
        <ReviewRow label="WhatsApp" value={whatsapp ? `+91 ${whatsapp}` : ''} />
        <ReviewRow label="Language" value={languageLabel} />
        <ReviewRow label="Doctor" value={doctorDetails.name} />
        <ReviewRow label="Designation" value={doctorDetails.designation} />
        <ReviewRow label="Specialization" value={doctorDetails.specialization} />
        <ReviewRow label="Qualification" value={doctorDetails.qualification} />
        <ReviewRow label="Experience" value={doctorDetails.experience} />
        <ReviewRow label="Date" value={formatDisplayDate(selectedDate)} />
        <ReviewRow label="Time Slot" value={buildSlotInfo(selectedSlot)} />
        <ReviewRow label="Plan" value={selectedPlan?.plan_name} />
        <ReviewRow
          label="Amount"
          value={selectedPlan?.plan_price ? `Rs. ${selectedPlan.plan_price}` : ''}
        />
      </View>
    </View>
    );
  };

  const renderStepSix = () => (
    <View style={styles.successWrap}>
      <View style={styles.successBadge}>
        <AppText style={styles.successBadgeText}>✓</AppText>
      </View>
      <AppText style={styles.successTitle}>Booking Confirmed</AppText>
      <AppText style={styles.successMessage}>
        Expect a call and a WhatsApp message (1 to 2 hrs).
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
    if (step === 3) return renderStepThree();
    if (step === 4) return renderStepFour();
    if (step === 5) return renderStepFive();
    return renderStepSix();
  };

  const showFooter = step >= 1 && step <= 5;
  const footerLabel = step === 5 ? 'Make Payment' : 'Continue';

  return (
    <View style={styles.container}>
      <SubScreenHeader title="Doctor Booking" onBack={handleBack} />

      {step <= 5 ? <BookingStepIndicator steps={BOOKING_STEPS} currentStep={step} /> : null}

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

              {step === 5 ? (
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

const createStyles = colors => ({
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
  doctorAbout: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
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
  textArea: {
    minHeight: 110,
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
  dateRow: {
    gap: 10,
    paddingBottom: 8,
    marginBottom: 8,
  },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  dateChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryText,
  },
  dateChipTextSelected: {
    color: colors.white,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotChip: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  slotChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  slotText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryText,
  },
  slotTextSelected: {
    color: colors.white,
  },
  planRow: {
    flexDirection: 'row',
    gap: 12,
  },
  planImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: colors.lightGray,
  },
  planInfo: {
    flex: 1,
  },
  planPrice: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
    color: colors.button,
  },
  serviceList: {
    marginTop: 12,
    gap: 4,
  },
  serviceText: {
    fontSize: 13,
    color: colors.secondaryText,
    lineHeight: 18,
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
  emptyWrap: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 24,
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

export default DoctorBookingScreen;
