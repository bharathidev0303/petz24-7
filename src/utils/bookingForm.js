const appendEncoded = (parts, key, value) => {
  if (value === undefined || value === null) return;

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (typeof item === 'object' && item !== null) {
        appendEncoded(parts, `${key}[${index}]`, item);
      } else {
        parts.push(`${encodeURIComponent(`${key}[${index}]`)}=${encodeURIComponent(String(item))}`);
      }
    });
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([childKey, childValue]) => {
      appendEncoded(parts, `${key}[${childKey}]`, childValue);
    });
    return;
  }

  parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
};

export const toNestedUrlEncoded = params => {
  const parts = [];
  Object.entries(params).forEach(([key, value]) => appendEncoded(parts, key, value));
  return parts.join('&');
};

export const formatBookingDate = date => {
  const value = date instanceof Date ? date : new Date(date);
  value.setHours(0, 0, 0, 0);
  return value.toString();
};

export const getNextSevenDays = () => {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let index = 0; index < 7; index += 1) {
    const day = new Date(today);
    day.setDate(today.getDate() + index);
    days.push(day);
  }

  return days;
};

export const formatDisplayDate = date => {
  const value = date instanceof Date ? date : new Date(date);
  return value.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

export const isSameDay = (left, right) => {
  const a = left instanceof Date ? left : new Date(left);
  const b = right instanceof Date ? right : new Date(right);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

export const buildSlotInfo = slot => {
  if (slot?.slot_info) return String(slot.slot_info).trim();
  if (slot?.from_time && slot?.to_time) return `${slot.from_time} - ${slot.to_time}`;
  if (slot?.slot_time) return String(slot.slot_time);
  return '';
};

export const normalizeList = response =>
  Array.isArray(response) ? response : response?.data || response?.plans || [];
