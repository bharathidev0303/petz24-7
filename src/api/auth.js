import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';

export const authAPI = {
  login: async (email, password) => {
    // Dummy login – replace with real endpoint when backend is ready
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const mockUser = {
      id: 1,
      name: 'Pet Owner',
      email,
    };

    const mockToken = `dummy-token-${Date.now()}`;

    await AsyncStorage.setItem('authToken', mockToken);
    await AsyncStorage.setItem('userData', JSON.stringify(mockUser));

    return {
      success: true,
      data: {
        token: mockToken,
        user: mockUser,
      },
    };
  },

  getProfile: async () => {
    return apiClient.get('/users/1');
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['authToken', 'userData']);
    return { success: true };
  },
};
