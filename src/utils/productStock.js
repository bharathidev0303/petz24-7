export const LOW_STOCK_THRESHOLD = 5;
export const MAX_ORDER_QUANTITY = 99;

export const parseStock = value => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
};

export const isOutOfStock = stock => parseStock(stock) <= 0;

export const getMaxOrderQuantity = stock =>
  Math.min(MAX_ORDER_QUANTITY, Math.max(parseStock(stock), 0));

export const clampOrderQuantity = (quantity, stock) => {
  const max = getMaxOrderQuantity(stock);
  if (max <= 0) return 1;

  const parsed = Number(quantity);
  const safeQuantity = Number.isFinite(parsed) ? parsed : 1;
  return Math.min(Math.max(1, safeQuantity), max);
};

export const getStockMessage = (stock, { lowStockThreshold = LOW_STOCK_THRESHOLD } = {}) => {
  const available = parseStock(stock);
  if (available <= 0) return 'Out of stock';
  if (available <= lowStockThreshold) return `Only ${available} left in Stock!`;
  return null;
};

export const isLowStock = (stock, { lowStockThreshold = LOW_STOCK_THRESHOLD } = {}) => {
  const available = parseStock(stock);
  return available > 0 && available <= lowStockThreshold;
};

export const validateOrderQuantity = (quantity, stock) => {
  const available = parseStock(stock);
  const requested = Number(quantity) || 0;

  if (available <= 0) {
    return { valid: false, message: 'This item is out of stock' };
  }

  if (requested > available) {
    return {
      valid: false,
      message:
        available === 1
          ? 'Only 1 item left in stock'
          : `Only ${available} items left in stock`,
    };
  }

  return { valid: true };
};
