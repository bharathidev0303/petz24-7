import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

export const cartAPI = {
  addToCart: ({ product_id, quantity, box_unit }) =>
    apiClient.post(ENDPOINTS.ADD_TO_CART, {
      product_id,
      quantity,
      box_unit,
    }),

  getCartItems: user_id =>
    apiClient.postUrlEncoded(ENDPOINTS.GET_CART_ITEMS, { user_id }),

  removeCartItem: ({ user_id, cart_id }) =>
    apiClient.postUrlEncoded(ENDPOINTS.REMOVE_CART_ITEM, { user_id, cart_id }),

  buyNow: ({ product_id, user_id, quantity, box_unit = 1 }) =>
    apiClient.postUrlEncoded(ENDPOINTS.BUY_NOW, {
      product_id,
      user_id,
      quantity,
      box_unit,
    }),
};
