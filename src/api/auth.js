import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

const mapUser = data => ({
  id: data.user_id,
  firstName: data.first_name,
  lastName: data.last_name,
  name: [data.first_name, data.last_name].filter(Boolean).join(' '),
  email: data.email_id,
  mobile: data.mobile_number,
});

export const authAPI = {
  login: async (email_id, password) => {
    const response = await apiClient.post(ENDPOINTS.LOGIN, { email_id, password });
    const user = mapUser(response.data);

    await AsyncStorage.setItem('authToken', response.data.token);
    await AsyncStorage.setItem('userData', JSON.stringify(user));

    return {
      token: response.data.token,
      user,
    };
  },

  signup: async ({ first_name, last_name, email_id, mobile_number, password }) => {
    const response = await apiClient.post(ENDPOINTS.SIGNUP, {
      first_name,
      last_name,
      email_id,
      mobile_number,
      password,
    });
    const user = mapUser(response.data);

    await AsyncStorage.setItem('authToken', response.data.token);
    await AsyncStorage.setItem('userData', JSON.stringify(user));

    return {
      token: response.data.token,
      user,
    };
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['authToken', 'userData']);
    return { success: true };
  },
};
