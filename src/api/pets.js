import { Platform } from 'react-native';
import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

const normalizeList = response => (Array.isArray(response) ? response : response?.data || []);

const normalizeFileUri = uri => {
  if (!uri) return uri;
  if (
    Platform.OS === 'android' &&
    !uri.startsWith('file://') &&
    !uri.startsWith('content://')
  ) {
    return `file://${uri}`;
  }
  return uri;
};

const appendEmptyPetImage = formData => {
  // Match web: filename="" + application/octet-stream + empty body.
  if (Platform.OS === 'android') {
    // Blob/data URIs break Android fetch; bundled 0-byte file sends the empty file part.
    formData.append('pet_img', {
      uri: 'file:///android_asset/empty.bin',
      name: '',
      type: 'application/octet-stream',
    });
    return;
  }

  if (typeof Blob !== 'undefined') {
    formData.append('pet_img', new Blob([], { type: 'application/octet-stream' }), '');
    return;
  }

  formData.append('pet_img', {
    uri: '',
    name: '',
    type: 'application/octet-stream',
  });
};

const appendPetImage = (formData, petImg) => {
  if (petImg?.uri) {
    formData.append('pet_img', {
      uri: normalizeFileUri(petImg.uri),
      name: petImg.name || 'pet.jpg',
      type: petImg.type || 'image/jpeg',
    });
    return;
  }

  appendEmptyPetImage(formData);
};

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

  appendPetImage(formData, fields.pet_img);

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
