import apiClient, { BASE_URL } from './apiClient';
import { ENDPOINTS } from './endpoints';
import { parseOrderItemsFromHtml, parseOrderMetaFromHtml } from '../utils/parseOrderHtml';
import { checkNetworkConnection } from '../hooks/useNetworkStatus';
import { APP_ERROR_CODES, createAppError } from '../utils/apiError';

export const ordersAPI = {
  getMyOrders: user_id =>
    apiClient.postUrlEncoded(ENDPOINTS.GET_MY_ORDERS, { user_id }),

  getMyBooking: user_id =>
    apiClient.postUrlEncoded(ENDPOINTS.GET_MY_BOOKING, { user_id }),

  getBookingInfo: ({ user_id, booking_id, booking_type }) =>
    apiClient.postUrlEncoded(ENDPOINTS.GET_BOOKING_INFO, {
      user_id,
      booking_id,
      booking_type,
    }),

  placeOrder: ({ user_id, address_id, order_type = 'cart' }) =>
    apiClient.postUrlEncoded(ENDPOINTS.PLACE_ORDER, {
      user_id,
      address_id,
      order_type,
    }),

  getOrderItems: async order_number => {
    if (!order_number) return { items: [], meta: {} };

    const hasNetwork = await checkNetworkConnection();
    if (!hasNetwork) {
      throw createAppError(APP_ERROR_CODES.NO_INTERNET);
    }

    const token = await apiClient.getToken();
    const url = `${BASE_URL}/order-response/${encodeURIComponent(order_number)}`;

    let response;
    try {
      response = await fetch(url, {
        headers: {
          Accept: 'text/html',
          ...(token ? { token } : {}),
        },
      });
    } catch (error) {
      throw createAppError(APP_ERROR_CODES.NO_INTERNET, error);
    }

    if (!response.ok) {
      throw createAppError(APP_ERROR_CODES.REQUEST_FAILED);
    }

    const html = await response.text();

    return {
      items: parseOrderItemsFromHtml(html),
      meta: parseOrderMetaFromHtml(html),
    };
  },
};
