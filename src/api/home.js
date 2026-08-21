import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

export const homeAPI = {
  getMenuItems: () => apiClient.get(ENDPOINTS.MENU_ITEMS),

  getHomeDynamicList: () => apiClient.get(ENDPOINTS.HOME_DYNAMIC_LIST),
};
