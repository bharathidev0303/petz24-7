import { Alert } from 'react-native';
import { getTawkDirectChatUrl, isTawkConfigured } from '../config/tawk';

export const resolveTawkChatUrl = (preferredUrl, ids = {}) => {
  const fromApi = String(preferredUrl || '').trim();
  if (fromApi) return fromApi;

  const propertyId = String(ids.propertyId || '').trim();
  const widgetId = String(ids.widgetId || '').trim();
  if (propertyId && widgetId) {
    return `https://tawk.to/chat/${propertyId}/${widgetId}`;
  }

  return getTawkDirectChatUrl();
};

export const openTawkChat = (navigation, options = {}) => {
  const chatUrl = resolveTawkChatUrl(options.chatUrl, {
    propertyId: options.tawkPropertyId,
    widgetId: options.tawkWidgetId,
  });

  if (!chatUrl) {
    Alert.alert(
      'Chat unavailable',
      'Tawk chat is not configured yet. Add your Widget ID in src/config/tawk.js (or set DIRECT_CHAT_URL).',
    );
    return false;
  }

  navigation.navigate('TawkChat', {
    chatUrl,
    visitor: options.visitor,
  });
  return true;
};

export const canOpenTawkChat = (preferredUrl = '') =>
  Boolean(resolveTawkChatUrl(preferredUrl)) || isTawkConfigured();
