import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

const appendArrayParams = (payload, key, values = []) => {
  if (!values?.length) return;
  payload[key] = values;
};

export const productsAPI = {
  getCollectionFilters: ({ product_type_id, brandText = 'search' }) =>
    apiClient.postUrlEncoded(ENDPOINTS.COLLECTION_FILTERS, {
      product_type_id,
      brandText,
    }),

  getCollectionProducts: ({
    product_type_id,
    brandText = 'search',
    page = 1,
    limit = 10,
    startPrice,
    endPrice,
    priceOrder = 'l2h',
    brand = [],
    petId = [],
    veg = [],
  }) => {
    const payload = {
      product_type_id,
      page,
      limit,
      priceOrder,
      brandText,
    };

    if (startPrice !== undefined && startPrice !== null) {
      payload.startPrice = startPrice;
    }
    if (endPrice !== undefined && endPrice !== null) {
      payload.endPrice = endPrice;
    }

    appendArrayParams(payload, 'brand[]', brand);
    appendArrayParams(payload, 'petId[]', petId);
    appendArrayParams(payload, 'veg[]', veg);

    return apiClient.postUrlEncoded(ENDPOINTS.COLLECTION_PRODUCTS, payload);
  },

  getProductDetails: product_id =>
    apiClient.post(ENDPOINTS.PRODUCT_DETAILS, { product_id: Number(product_id) }),
};
