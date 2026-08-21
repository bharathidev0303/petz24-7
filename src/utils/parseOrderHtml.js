export const parseOrderItemsFromHtml = html => {
  if (!html) return [];

  const items = [];
  const rowPattern =
    /<td class="product-name">\s*<a[^>]*>([^<]*)<\/a>\s*<\/td>\s*<td class="product-quantity">([^<]*)<\/td>\s*<td class="product-total">([^<]*)<\/td>/gi;

  let match = rowPattern.exec(html);
  while (match) {
    items.push({
      product_name: match[1].trim(),
      quantity: match[2].trim(),
      total: match[3].trim(),
    });
    match = rowPattern.exec(html);
  }

  return items;
};

export const parseOrderMetaFromHtml = html => {
  if (!html) return {};

  const pick = pattern => {
    const result = html.match(pattern);
    return result?.[1]?.trim() || null;
  };

  return {
    payment_mode: pick(/Mode of payment<\/span>\s*<span class="o-price">\s*([^<]+)/i),
    payment_status: pick(/Payment Status<\/span>\s*<span class="o-price">\s*([^<]+)/i),
    shipping_charge: pick(/Shipping charge<\/span>\s*<span class="o-price">\s*([^<]+)/i),
    message: pick(/class="order-s">([^<]+)/i),
  };
};
