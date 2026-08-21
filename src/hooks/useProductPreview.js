import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { normalizePreviewItem } from '../utils/productPreview';

export { normalizePreviewItem } from '../utils/productPreview';

export const useProductPreview = () => {
  const navigation = useNavigation();

  const openPreview = useCallback(
    item => {
      const normalized = normalizePreviewItem(item);
      if (!normalized) return;

      navigation.navigate('ProductDetail', {
        productId: String(normalized.product_id),
        previewProduct: normalized,
      });
    },
    [navigation],
  );

  return { openPreview };
};
