import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

const normalizeAddressList = response =>
  Array.isArray(response) ? response : response?.data || [];

export const addressAPI = {
  getUserAddress: async user_id => {
    const response = await apiClient.postUrlEncoded(ENDPOINTS.GET_USER_ADDRESS, { user_id });
    return normalizeAddressList(response);
  },

  addUserAddress: payload =>
    apiClient.postForm(ENDPOINTS.ADD_USER_ADDRESS, payload),

  updateUserAddress: payload =>
    apiClient.postForm(ENDPOINTS.UPDATE_USER_ADDRESS, payload),

  deleteUserAddress: userAddressID =>
    apiClient.postUrlEncoded(ENDPOINTS.DELETE_USER_ADDRESS, { userAddressID }),
};
