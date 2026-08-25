export const normalizeVegNonVeg = value => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

  if (!normalized) return null;
  if (normalized.includes('non') && normalized.includes('veg')) return 'non-veg';
  if (normalized === 'veg' || normalized === 'vegetarian') return 'veg';
  return null;
};
