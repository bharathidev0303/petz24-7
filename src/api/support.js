import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

export const supportAPI = {
  getSupportDetails: () => apiClient.get(ENDPOINTS.GET_SUPPORT_DETAILS),
};
