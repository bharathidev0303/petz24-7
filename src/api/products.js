import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

const appendArrayParams = (payload, key, values = []) => {
  if (!values?.length) return;
  payload[key] = values;
};

export const productsAPI = {
  getCollectionFilters: ({ pet_id, product_type_id, brandText = 'search' }) =>
    apiClient.postUrlEncoded(ENDPOINTS.COLLECTION_FILTERS, {
      pet_id,
      product_type_id,
      brandText,
    }),

  getCollectionProducts: ({
    pet_id,
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
      page,
      limit,
      priceOrder,
      brandText,
    };

    if (pet_id !== undefined && pet_id !== null && String(pet_id).length > 0) {
      payload.pet_id = pet_id;
    }
    if (product_type_id !== undefined && product_type_id !== null && String(product_type_id).length > 0) {
      payload.product_type_id = product_type_id;
    }

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
