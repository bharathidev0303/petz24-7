import { API_CONFIG, getAssetUrl } from '../config/env';
import apiClient, { getUserErrorMessage } from './apiClient';
import { ENDPOINTS } from './endpoints';

const formatSubscriptionDate = value => {
  if (!value) return '-';

  const normalized = String(value).trim().replace(' ', 'T');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatPlanPrice = value => {
  if (value === undefined || value === null || value === '') return '-';
  const raw = String(value).trim();
  if (raw.startsWith('₹')) return raw;
  const numeric = Number(raw);
  if (!Number.isNaN(numeric)) {
    return `₹${numeric}`;
  }
  return raw;
};

const formatDuration = value => {
  if (value === undefined || value === null || value === '') return '-';
  const raw = String(value).trim();
  if (/month/i.test(raw)) return raw;
  const numeric = Number(raw);
  if (!Number.isNaN(numeric)) {
    return `${numeric} Month(s)`;
  }
  return raw;
};

const pickPayload = response => {
  if (!response || typeof response !== 'object') return null;
  if (Array.isArray(response.data)) {
    return response.data[0] ?? null;
  }
  if (response.data && typeof response.data === 'object') return response.data;
  if (response.subscription && typeof response.subscription === 'object') {
    return response.subscription;
  }
  return null;
};

const isTruthyFlag = value =>
  value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true';

const emptySubscription = () => ({
  isActive: false,
  planName: '',
  planPrice: '',
  planImage: '',
  startDate: '',
  expiryDate: '',
  duration: '',
  statusLabel: 'Inactive',
  chatUrl: '',
  subscribeUrl: `${API_CONFIG.BASE_URL}/chatbooking`,
});

export const normalizeChatSubscription = response => {
  const payload = pickPayload(response);

  if (!payload || Object.keys(payload).length === 0) {
    return emptySubscription();
  }

  const isActive = isTruthyFlag(payload.flag);

  return {
    isActive,
    planName: String(payload.chat_plan_name ?? payload.plan_name ?? 'Standard').trim(),
    planPrice: formatPlanPrice(payload.chat_plan_price ?? payload.plan_price),
    planImage: getAssetUrl(payload.chat_plan_img) || '',
    startDate: formatSubscriptionDate(payload.start_date),
    expiryDate: formatSubscriptionDate(payload.end_date ?? payload.expiry_date),
    duration: formatDuration(payload.duration),
    statusLabel: isActive ? 'Active Subscription' : 'Inactive',
    chatUrl: String(payload.chat_url ?? payload.chat_link ?? payload.live_chat_url ?? '').trim(),
    subscribeUrl: `${API_CONFIG.BASE_URL}/chatbooking`,
  };
};

export const normalizeChatPlans = response => {
  const list = Array.isArray(response?.data) ? response.data : [];
  return list
    .filter(item => String(item?.flag ?? '1') === '1')
    .map(item => ({
      chat_plan_id: String(item.chat_plan_id ?? ''),
      chat_plan_name: String(item.chat_plan_name ?? '').trim(),
      chat_plan_img: getAssetUrl(item.chat_plan_img) || '',
      chat_plan_img_raw: String(item.chat_plan_img ?? '').trim(),
      chat_plan_duration: String(item.chat_plan_duration ?? ''),
      chat_plan_price: String(item.chat_plan_price ?? ''),
    }))
    .filter(item => item.chat_plan_id);
};

/** Plan snapshot for /add-chat-booking `plan_obj` (matches get-chat-plans fields). */
export const buildChatPlanObj = plan => ({
  chat_plan_id: plan?.chat_plan_id ?? '',
  chat_plan_name: plan?.chat_plan_name ?? '',
  chat_plan_img: plan?.chat_plan_img_raw ?? plan?.chat_plan_img ?? '',
  chat_plan_duration: plan?.chat_plan_duration ?? '',
  chat_plan_price: plan?.chat_plan_price ?? '',
});

export const buildChatBookingFormData = booking => {
  const formData = new FormData();
  const append = (key, value) => {
    formData.append(key, value != null ? String(value) : '');
  };

  append('user_pet_name', booking.user_pet_name);
  append('user_pet_id', booking.user_pet_id);
  append('pet_id', booking.pet_id);
  append('plan_id', booking.plan_id);
  append('plan_info', booking.plan_info);
  append('plan_obj', JSON.stringify(booking.plan_obj ?? {}));
  append('doctor_id', booking.doctor_id);
  append('doctor_name', booking.doctor_name);
  append('booking_date', booking.booking_date || '');
  append('slot_id', booking.slot_id || '0');
  append('slot_info', booking.slot_info || '');
  append('pet_problem', booking.pet_problem);
  append('whatsapp_number', booking.whatsapp_number);
  append('plan_type', '2');
  append('user_id', booking.user_id);

  if (booking.problem_img?.uri) {
    formData.append('problem_img', {
      uri: booking.problem_img.uri,
      name: booking.problem_img.name || 'problem.jpg',
      type: booking.problem_img.type || 'image/jpeg',
    });
  }

  return formData;
};

const isInactiveSubscriptionError = error => {
  const message = getUserErrorMessage(error, '').toLowerCase();
  return (
    error?.status === 404 ||
    message.includes('no subscription') ||
    message.includes('not subscribed') ||
    message.includes('not active') ||
    message.includes('subscription not found') ||
    message.includes('no active subscription')
  );
};

export const chatAPI = {
  getUserChatSubscription: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.GET_USER_CHAT_SUBSCRIPTION);
      return normalizeChatSubscription(response);
    } catch (error) {
      if (isInactiveSubscriptionError(error)) {
        return normalizeChatSubscription(null);
      }
      throw error;
    }
  },

  getChatPlans: async () => {
    const response = await apiClient.get(ENDPOINTS.GET_CHAT_PLANS);
    return normalizeChatPlans(response);
  },

  addChatBooking: booking =>
    apiClient.post(ENDPOINTS.ADD_CHAT_BOOKING, buildChatBookingFormData(booking), true),
};
