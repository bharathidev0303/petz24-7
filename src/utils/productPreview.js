export const normalizePreviewItem = item => {
  if (!item) return null;

  const productId = item.product_id ?? item.id;
  if (!productId) return null;

  return {
    ...item,
    product_id: productId,
    name: item.name || item.product_name,
    url: item.url || item.product_image,
    product_image: item.product_image || item.url,
    min_price: item.min_price ?? item.product_price ?? item.custom_price ?? item.price,
  };
};
