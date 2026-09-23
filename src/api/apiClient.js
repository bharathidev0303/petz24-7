import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/env';
import { store } from '../redux/store';
import { clearAuth } from '../redux/slices/authSlice';
import { checkNetworkConnection } from '../hooks/useNetworkStatus';
import {
  APP_ERROR_CODES,
  createAppError,
  getUserErrorMessage,
} from '../utils/apiError';

export let BASE_URL = API_CONFIG.BASE_URL;

export const setBaseUrl = url => {
  BASE_URL = url || API_CONFIG.BASE_URL;
};

export const toUrlEncoded = params => {
  const parts = [];
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach(item => {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
      });
      return;
    }
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  });
  return parts.join('&');
};

export const toFormData = params => {
  const formData = new FormData();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach(item => formData.append(key, String(item)));
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
};

const LOG_PREFIX = '[API]';

const maskToken = token => {
  if (!token) return null;
  if (token.length <= 8) return '****';
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
};

const sanitizeHeaders = headers => {
  const safe = { ...headers };
  if (safe.token) {
    safe.token = maskToken(safe.token);
  }
  if (safe.Authorization) {
    safe.Authorization = maskToken(safe.Authorization);
  }
  return safe;
};

const parseRequestBody = body => {
  if (!body) return null;

  if (body instanceof FormData) {
    if (body._parts) {
      return body._parts.reduce((acc, [key, value]) => {
        if (acc[key] === undefined) {
          acc[key] = value;
        } else if (Array.isArray(acc[key])) {
          acc[key].push(value);
        } else {
          acc[key] = [acc[key], value];
        }
        return acc;
      }, {});
    }
    return '[FormData]';
  }

  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }

  return body;
};

const logRequest = ({ method, url, headers, body }) => {
  console.group(`${LOG_PREFIX} REQUEST ${method} ${url}`);
  console.log('Headers:', sanitizeHeaders(headers));
  console.log('Body:', parseRequestBody(body));
  console.groupEnd();
};

const logResponse = ({ method, url, status, durationMs, data, responseText }) => {
  console.group(`${LOG_PREFIX} RESPONSE ${method} ${url} | ${status} | ${durationMs}ms`);
  if (data && Object.keys(data).length) {
    console.log('Data:', data);
  } else {
    console.log('Raw:', responseText || '(empty)');
  }
  console.groupEnd();
};

const logError = ({ method, url, status, durationMs, message, data, responseText }) => {
  console.group(`${LOG_PREFIX} ERROR ${method} ${url} | ${status || 'NETWORK'} | ${durationMs}ms`);
  console.log('Message:', message);
  if (data && Object.keys(data).length) {
    console.log('Data:', data);
  } else if (responseText) {
    console.log('Raw:', responseText);
  }
  console.groupEnd();
};

class ApiClient {
  constructor() {
    this.token = null;
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
    await AsyncStorage.multiRemove(['authToken', 'userData']);
    await this.setToken(null);
    store.dispatch(clearAuth());
  }

  async request(endpoint, options = {}, retry = false) {
    if (!BASE_URL) {
      throw createAppError(APP_ERROR_CODES.REQUEST_FAILED);
    }

    const hasNetwork = await checkNetworkConnection();
    if (!hasNetwork) {
      throw createAppError(APP_ERROR_CODES.NO_INTERNET);
    }

    const method = (options.method || 'GET').toUpperCase();
    const url = `${BASE_URL}${endpoint}`;
    const token = await this.getToken();
    const isFormData = options.body instanceof FormData;
    const startedAt = Date.now();

    const config = {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    };

    if (token) {
      config.headers.token = token;
    }

    logRequest({
      method,
      url,
      headers: config.headers,
      body: config.body,
    });

    let response;
    let responseText = '';

    try {
      response = await fetch(url, config);
      responseText = await response.text();
    } catch (error) {
      logError({
        method,
        url,
        status: null,
        durationMs: Date.now() - startedAt,
        message: error?.message || 'Network Error',
      });
      throw createAppError(APP_ERROR_CODES.REQUEST_FAILED, error);
    }

    let data = {};
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { message: responseText || 'Invalid response' };
    }

    const durationMs = Date.now() - startedAt;

    if (response.status === 401 && !retry) {
      logError({
        method,
        url,
        status: response.status,
        durationMs,
        message: 'Session expired',
        data,
        responseText,
      });
      await this.clearCachedToken();
      throw createAppError(APP_ERROR_CODES.SESSION_EXPIRED);
    }

    if (data.status === false) {
      const apiMessage = data.message || 'Request failed';
      const error = createAppError(APP_ERROR_CODES.REQUEST_FAILED);
      error.status = data.code || response.status;
      error.response = data;
      logError({
        method,
        url,
        status: error.status,
        durationMs,
        message: apiMessage,
        data,
        responseText,
      });
      throw error;
    }

    if (!response.ok) {
      const apiMessage = data?.message || 'API Error';
      const error = createAppError(APP_ERROR_CODES.REQUEST_FAILED);
      error.status = response.status;
      error.response = data;
      logError({
        method,
        url,
        status: response.status,
        durationMs,
        message: apiMessage,
        data,
        responseText,
      });
      throw error;
    }

    logResponse({
      method,
      url,
      status: response.status,
      durationMs,
      data,
      responseText,
    });

    return data;
  }

  get(endpoint, params = {}) {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
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

  postForm(endpoint, params) {
    const body = params instanceof FormData ? params : toFormData(params);
    return this.post(endpoint, body, true);
  }

  postUrlEncoded(endpoint, params) {
    return this.request(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: toUrlEncoded(params),
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
export { getUserErrorMessage };
