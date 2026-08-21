import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';
import { formatBookingDate, normalizeList, toNestedUrlEncoded } from '../utils/bookingForm';

export const bookingAPI = {
  getDoctorLanguages: () => apiClient.get(ENDPOINTS.GET_DOCTOR_LANGUAGE),

  getDoctors: language_id =>
    apiClient.postUrlEncoded(ENDPOINTS.GET_DOCTORS, { language_id }),

  getTimeSlots: date =>
    apiClient.postUrlEncoded(ENDPOINTS.GET_TIME_SLOT, {
      date: formatBookingDate(date),
    }),

  getUserPetPlan: params => apiClient.postUrlEncoded(ENDPOINTS.GET_USER_PET_PLAN, params),

  addBooking: params =>
    apiClient.request(ENDPOINTS.ADD_BOOKING, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: toNestedUrlEncoded(params),
    }),

  addQuickBooking: params => apiClient.postUrlEncoded(ENDPOINTS.ADD_QUICK_BOOKING, params),
};

export const normalizeDoctors = response => normalizeList(response);

export const normalizeDoctorLanguages = response =>
  normalizeList(response)
    .filter(item => String(item?.flag ?? '1') === '1')
    .map(item => ({
      id: String(item.language_id ?? ''),
      label: String(item.language_name ?? '').trim(),
    }))
    .filter(item => item.id && item.label);

export const normalizeTimeSlots = response => normalizeList(response);

export const normalizePlans = response => normalizeList(response);
