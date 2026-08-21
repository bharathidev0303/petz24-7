import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../api/auth';
import apiClient from '../../api/apiClient';
import { getUserErrorMessage } from '../../utils/apiError';

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(email, password);
      await apiClient.setToken(response.token);
      return response;
    } catch (error) {
      return rejectWithValue(getUserErrorMessage(error, 'Login failed. Please try again.'));
    }
  },
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authAPI.signup(payload);
      await apiClient.setToken(response.token);
      return response;
    } catch (error) {
      return rejectWithValue(getUserErrorMessage(error, 'Registration failed. Please try again.'));
    }
  },
);

export const checkAuthStatus = createAsyncThunk('auth/checkStatus', async () => {
  const token = await AsyncStorage.getItem('authToken');
  const userData = await AsyncStorage.getItem('userData');

  if (token && userData) {
    await apiClient.setToken(token);
    return {
      isAuthenticated: true,
      token,
      user: JSON.parse(userData),
    };
  }

  return { isAuthenticated: false };
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await authAPI.logout();
  await apiClient.setToken(null);
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    authInitialized: false,
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearAuth: state => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.loading = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.authInitialized = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(signup.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.authInitialized = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(checkAuthStatus.pending, state => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.authInitialized = true;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.token = action.payload.token || null;
        state.user = action.payload.user || null;
      })
      .addCase(checkAuthStatus.rejected, state => {
        state.loading = false;
        state.authInitialized = true;
        state.isAuthenticated = false;
      })
      .addCase(logout.fulfilled, state => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.loading = false;
      });
  },
});

export const { clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
