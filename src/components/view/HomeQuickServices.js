import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import AppText from './AppText';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';

const HomeQuickServices = ({ onConsultationPress, onChatPress, onPharmacyPress }) => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  const quickServices = [
    {
      id: 'consultation',
      label: 'Doctor Consultation',
      backgroundColor: colors.quickService1,
    },
    {
      id: 'chat',
      label: 'Chat with Doctor',
      backgroundColor: colors.quickService2,
    },
    {
      id: 'pharmacy',
      label: 'Pharmacy',
      backgroundColor: colors.quickService3,
    },
  ];

  const handlers = {
    consultation: onConsultationPress,
    chat: onChatPress,
    pharmacy: onPharmacyPress,
  };

  return (
    <View style={styles.row}>
      {quickServices.map(service => (
        <TouchableOpacity
          key={service.id}
          activeOpacity={0.85}
          style={[styles.card, { backgroundColor: service.backgroundColor }]}
          onPress={handlers[service.id]}>
          <AppText style={styles.label} numberOfLines={3}>
            {service.label}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const createStyles = colors => ({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    minHeight: 80,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryText,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HomeQuickServices;
