export const API_CONFIG = {
  BASE_URL: 'https://petz24.kainsotech.com',
  TIMEOUT: 30000,
};

export const getAssetUrl = (path, options = {}) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;

  let normalized = path.replace(/^\//, '');

  // User-uploaded pet photos are served from /uploads/pet/, not /admin/uploads/pet/
  if (options.userPet && normalized.startsWith('uploads/')) {
    return `${API_CONFIG.BASE_URL}/${normalized}`;
  }

  // API returns relative paths like "uploads/product/..." but files are served from "/admin/uploads/..."
  if (normalized.startsWith('uploads/')) {
    normalized = `admin/${normalized}`;
  }

  return `${API_CONFIG.BASE_URL}/${normalized}`;
};

export const getUserPetImageUrl = path => getAssetUrl(path, { userPet: true });
