import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

export const wishlistAPI = {
  checkProductInWishlist: ({ product_id, user_id }) =>
    apiClient.postUrlEncoded(ENDPOINTS.CHECK_WISHLIST, { product_id, user_id }),

  updateWishlist: ({ product_id, user_id, type }) =>
    apiClient.postUrlEncoded(ENDPOINTS.UPDATE_WISHLIST, { product_id, user_id, type }),

  getWishlistProducts: user_id =>
    apiClient.postUrlEncoded(ENDPOINTS.GET_WISHLIST, { user_id }),
};
