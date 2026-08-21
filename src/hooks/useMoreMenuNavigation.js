import { useCallback } from 'react';
import { Alert } from 'react-native';
import { navigateInMainApp, navigateToTab } from '../navigation/navigateFromSidebar';

export const useMoreMenuNavigation = onClose => {
  const run = useCallback(
    action => {
      onClose?.();
      const delay = onClose ? 220 : 0;
      setTimeout(() => {
        action();
      }, delay);
    },
    [onClose],
  );

  return {
    goDog: () => run(() => navigateInMainApp('Shop', { focusPetId: '1' })),
    goCat: () => run(() => navigateInMainApp('Shop', { focusPetId: '2' })),
    goPet: petId => run(() => navigateInMainApp('Shop', { focusPetId: String(petId) })),
    goBrands: () => run(() => navigateInMainApp('Shop', { focusSection: 'brands' })),
    goConsultation: () => run(() => navigateInMainApp('Booking')),
    goChatDoctor: () =>
      run(() => Alert.alert('Coming soon', 'Chat with a doctor will be available shortly.')),
    goProfile: () => run(() => navigateInMainApp('Profile')),
    goOrders: () => run(() => navigateToTab('Orders')),
    goMyBooking: () => run(() => navigateInMainApp('MyBooking')),
    goAddresses: () => run(() => navigateInMainApp('AddressList')),
    goWishlist: () => run(() => navigateInMainApp('Wishlist')),
    goVetPharmacy: () =>
      run(() => navigateInMainApp('StaticContent', { contentKey: 'vetPharmacy' })),
    goChangePassword: () =>
      run(() => Alert.alert('Coming soon', 'Change password will be available shortly.')),
    goTerms: () => run(() => navigateInMainApp('StaticContent', { contentKey: 'terms' })),
    goPrivacyPolicy: () =>
      run(() => navigateInMainApp('StaticContent', { contentKey: 'privacy' })),
    goContactUs: () => run(() => navigateInMainApp('Contact')),
  };
};
