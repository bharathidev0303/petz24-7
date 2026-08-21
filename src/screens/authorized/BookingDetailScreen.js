import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AppText from '../../components/AppText';
import SubScreenHeader from '../../components/view/SubScreenHeader';
import RequestErrorState from '../../components/view/RequestErrorState';
import { colors } from '../../styles/colors';
import { ordersAPI } from '../../api/orders';
import { getAssetUrl } from '../../config/env';
import { getUserErrorMessage } from '../../utils/apiError';

const BOOKING_TITLES = {
  slot: 'Slot Booking Details',
  quick: 'Quick Booking Details',
  chat: 'Chat Booking Details',
};

const stageColor = stage => {
  const value = String(stage || '').toLowerCase();
  if (value === 'done' || value === 'completed') return colors.success;
  if (value === 'cancelled' || value === 'canceled') return colors.error;
  return colors.primary;
};

const capitalize = value =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : '';

const parseBookingMeta = value => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const formatValue = value => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};

const InfoRow = ({ label, value }) => {
  const formatted = formatValue(value);
  if (!formatted) return null;

  return (
    <View style={styles.infoRow}>
      <AppText style={styles.infoLabel}>{label}</AppText>
      <AppText style={styles.infoValue}>{formatted}</AppText>
    </View>
  );
};

const normalizeBookingInfo = (response, bookingType) => {
  const payload =
    response?.data && typeof response.data === 'object' && !Array.isArray(response.data)
      ? response.data
      : response;

  const meta = parseBookingMeta(payload?.booking_json);
  const merged = { ...meta, ...payload };

  const rows = [];

  const push = (label, value) => {
    const formatted = formatValue(value);
    if (formatted) rows.push({ label, value: formatted });
  };

  if (bookingType === 'slot') {
    push('Plan', merged.plan_name);
    push('Date', merged.booking_date);
    if (merged.from_time || merged.to_time) {
      push(
        'Time',
        merged.from_time && merged.to_time
          ? `${merged.from_time} - ${merged.to_time}`
          : merged.from_time || merged.to_time,
      );
    }
    push('Doctor', merged.doctor_name);
    push('Amount', merged.amount || merged.plan_amount || merged.total_amount);
    push('Booking ID', merged.booking_id);
  }

  if (bookingType === 'quick') {
    push('Doctor', merged.doctor_name);
    push('Date', merged.booking_date || merged.created_at);
    push('Language', merged.language);
    push('WhatsApp', merged.whatsapp_number);
    push('Amount', merged.amount || merged.plan_amount || merged.total_amount);
    push('Payment status', capitalize(merged.payment_status));
    push('Booking status', capitalize(merged.booking_status));
    push('Booking ID', merged.qb_id || merged.booking_id);
  }

  if (bookingType === 'chat') {
    push('Pet', merged.user_pet_name);
    push('Doctor', merged.doctor_name);
    push('Problem', merged.pet_problem);
    push('WhatsApp', merged.whatsapp_number);
    push('Amount', merged.amount || merged.plan_amount || merged.total_amount);
    push('Payment status', capitalize(merged.payment_status));
    push('Booking status', capitalize(merged.booking_status));
    push('Booking ID', merged.cb_id || merged.booking_id);
  }

  push('Created at', merged.created_at);
  push('Updated at', merged.updated_at);

  const problemImage = merged.pet_problem_img
    ? getAssetUrl(
        String(merged.pet_problem_img).startsWith('uploads/')
          ? merged.pet_problem_img
          : `uploads/chat/${merged.pet_problem_img}`,
      )
    : null;

  return {
    stage: merged.booking_stage || merged.stage,
    rows,
    notes: merged.notes || merged.description || merged.booking_notes,
    problemImage,
  };
};

const BookingDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useSelector(state => state.auth);
  const bookingId = route.params?.bookingId;
  const bookingType = route.params?.bookingType;
  const preview = route.params?.booking;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);

  const title = BOOKING_TITLES[bookingType] || 'Booking Details';

  const fetchDetails = useCallback(async () => {
    if (!user?.id || !bookingId || !bookingType) return;

    setLoading(true);
    setError(null);

    try {
      const response = await ordersAPI.getBookingInfo({
        user_id: user.id,
        booking_id: bookingId,
        booking_type: bookingType,
      });
      setDetail(normalizeBookingInfo(response, bookingType));
    } catch (err) {
      setError(getUserErrorMessage(err, 'Could not load booking details'));
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id, bookingId, bookingType]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const fallbackDetail = useMemo(() => {
    if (!preview || detail) return null;
    return normalizeBookingInfo(preview, bookingType);
  }, [preview, detail, bookingType]);

  const content = detail || fallbackDetail;
  const statusColor = stageColor(content?.stage);

  if (!bookingId || !bookingType) {
    return (
      <View style={styles.container}>
        <SubScreenHeader title={title} onBack={() => navigation.goBack()} />
        <View style={styles.centered}>
          <AppText style={styles.errorText}>Booking not found</AppText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SubScreenHeader title={title} onBack={() => navigation.goBack()} />

      {loading && !content ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error && !content ? (
        <RequestErrorState error={error} onRetry={fetchDetails} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            {content?.stage ? (
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                <AppText style={[styles.statusText, { color: statusColor }]}>
                  {content.stage}
                </AppText>
              </View>
            ) : null}

            {content?.rows?.length ? (
              content.rows.map(row => (
                <InfoRow key={row.label} label={row.label} value={row.value} />
              ))
            ) : (
              <AppText style={styles.bodyText}>No booking details available.</AppText>
            )}
          </View>

          {content?.problemImage ? (
            <View style={styles.card}>
              <AppText style={styles.sectionTitle}>Problem image</AppText>
              <Image
                source={{ uri: content.problemImage }}
                style={styles.problemImage}
                resizeMode="cover"
              />
            </View>
          ) : null}

          {content?.notes ? (
            <View style={styles.card}>
              <AppText style={styles.sectionTitle}>Notes</AppText>
              <AppText style={styles.bodyText}>{content.notes}</AppText>
            </View>
          ) : null}
        </ScrollView>
      )}
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
    gap: 16,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 12,
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.secondaryText,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 21,
  },
  problemImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    backgroundColor: colors.lightGray,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default BookingDetailScreen;
