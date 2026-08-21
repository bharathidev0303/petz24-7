export const formatAddressLines = address => {
  if (!address) return '';

  const parts = [
    address.address_line,
    address.address_line_two,
    [address.city, address.state, address.postal_code].filter(Boolean).join(', '),
  ].filter(Boolean);

  return parts.join('\n');
};

export const formatAddressName = address =>
  [address?.fname, address?.lname].filter(Boolean).join(' ');
