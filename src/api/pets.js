import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

const normalizeList = response => (Array.isArray(response) ? response : response?.data || []);

export const buildPetFormData = fields => {
  const formData = new FormData();

  const appendText = (key, value) => {
    formData.append(key, value != null ? String(value) : '');
  };

  appendText('pet_id', fields.pet_id);
  appendText('breed_id', fields.breed_id);
  appendText('date_of_birth', fields.date_of_birth);
  appendText('age_year', fields.age_year);
  appendText('age_month', fields.age_month);
  appendText('name', fields.name);
  appendText('gender', fields.gender);
  appendText('old_img', fields.old_img);
  appendText('user_id', fields.user_id);

  if (fields.user_pety_id) {
    appendText('user_pety_id', fields.user_pety_id);
  }

  if (fields.pet_img?.uri) {
    formData.append('pet_img', {
      uri: fields.pet_img.uri,
      name: fields.pet_img.name || 'pet.jpg',
      type: fields.pet_img.type || 'image/jpeg',
    });
  } else {
    // API expects pet_img field even when keeping the existing image
    formData.append('pet_img', '');
  }

  return formData;
};

const postPetForm = (endpoint, payload) =>
  apiClient.post(endpoint, buildPetFormData(payload), true);

export const petsAPI = {
  getPetTypes: async () => {
    const response = await apiClient.get(ENDPOINTS.GET_PET_LIST);
    return normalizeList(response).filter(item => item.flag !== '0');
  },

  getBreedList: async petID => {
    const response = await apiClient.postUrlEncoded(ENDPOINTS.GET_BREED_LIST, { petID });
    return normalizeList(response);
  },

  getUserPetList: async user_id => {
    const response = await apiClient.postUrlEncoded(ENDPOINTS.GET_USER_PET_LIST, { user_id });
    return normalizeList(response);
  },

  addUserPet: payload => postPetForm(ENDPOINTS.ADD_USER_PET, payload),

  updateUserPet: payload => postPetForm(ENDPOINTS.UPDATE_USER_PET, payload),

  deleteUserPet: (user_pety_id, pet_img) =>
    apiClient.postUrlEncoded(ENDPOINTS.DELETE_USER_PET, { user_pety_id, pet_img }),
};
