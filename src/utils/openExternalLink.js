import { Alert, Linking } from 'react-native';

export const openExternalLink = async url => {
  const trimmed = String(url || '').trim();
  if (!trimmed) {
    Alert.alert('Link unavailable', 'This item does not have a valid link.');
    return;
  }

  try {
    await Linking.openURL(trimmed);
  } catch {
    Alert.alert('Unable to open link', 'Please try again later.');
  }
};

export const openCatalogueLink = item => openExternalLink(item?.catalogue_url);
