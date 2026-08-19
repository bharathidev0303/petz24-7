import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/env';
import { store } from '../redux/store';
import { logout } from '../redux/slices/authSlice';

export let BASE_URL = API_CONFIG.BASE_URL;

export const setBaseUrl = (url) => {
  BASE_URL = url || API_CONFIG.BASE_URL;
};

class ApiClient {
  constructor() {
    this.token = null;
    this.refreshPromise = null;
  }

  async getToken() {
    if (this.token) return this.token;
    this.token = await AsyncStorage.getItem('authToken');
    return this.token;
  }

  async setToken(token) {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem('authToken', token);
    } else {
      await AsyncStorage.removeItem('authToken');
    }
  }

  async clearCachedToken() {
    store.dispatch(logout());
    await this.setToken(null);
  }

  async request(endpoint, options = {}, retry = false) {
    if (!BASE_URL) {
      throw new Error('API base URL is not configured');
    }

    const url = `${BASE_URL}${endpoint}`;
    const token = await this.getToken();
    const isFormData = options.body instanceof FormData;

    const config = {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    let response;
    let responseText = '';

    try {
      response = await fetch(url, config);
      responseText = await response.text();
    } catch {
      throw new Error('Network Error');
    }

    let data = {};
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { message: responseText || 'Invalid response' };
    }

    if (response.status === 401 && !retry) {
      await this.clearCachedToken();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const error = new Error(data?.message || 'API Error');
      error.status = response.status;
      error.response = data;
      throw error;
    }

    return data;
  }

  get(endpoint, params = {}) {
    const qs = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    return this.request(qs ? `${endpoint}?${qs}` : endpoint, { method: 'GET' });
  }

  post(endpoint, data, isFormData = false) {
    return this.request(endpoint, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, data) {
    return this.request(endpoint, {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }
}

export default new ApiClient();
