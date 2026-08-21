export const getQuantityLabel = value => {
  if (value == null || value === '') return null;
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return getQuantityLabel(value[0]);
  if (typeof value === 'object' && value.quantity != null) return String(value.quantity);
  return null;
};

export const getQuantityVariant = value => {
  if (value == null) return null;
  if (typeof value === 'object' && !Array.isArray(value) && value.product_quantity_id != null) {
    return value;
  }
  if (Array.isArray(value)) {
    const variant = value.find(v => v?.product_quantity_id != null) || value[0];
    return variant?.product_quantity_id != null ? variant : null;
  }
  return null;
};

export const resolveSelectedQuantity = (selectedQty, previewProduct) => {
  if (selectedQty?.quantity) return selectedQty;

  const variant = getQuantityVariant(previewProduct?.quantity);
  if (variant) return variant;

  const label = getQuantityLabel(previewProduct?.quantity);
  if (label) {
    return {
      quantity: label,
      price: previewProduct?.price ?? previewProduct?.min_price,
    };
  }

  return null;
};
