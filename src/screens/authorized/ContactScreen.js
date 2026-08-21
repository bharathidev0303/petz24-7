import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppText from '../../components/AppText';
import SubScreenHeader from '../../components/view/SubScreenHeader';
import { ContactUs as ContactUsIcon, Phone, Mail } from '../../components/icons';
import { colors } from '../../styles/colors';
import { supportAPI } from '../../api/support';

const ContactRow = ({ icon: Icon, label, value, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    style={styles.contactRow}
    onPress={onPress}
    disabled={!onPress}>
    <View style={styles.iconWrap}>
      <Icon width={24} height={24} color={colors.primary} />
    </View>
    <View style={styles.contactInfo}>
      <AppText style={styles.contactLabel}>{label}</AppText>
      <AppText style={styles.contactValue}>{value}</AppText>
    </View>
  </TouchableOpacity>
);

const parseSupportDetails = response => ({
  phone: response?.support_contact || response?.data?.support_contact || '',
  email: response?.support_email || response?.data?.support_email || '',
});

const ContactScreen = () => {
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchSupportDetails = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await supportAPI.getSupportDetails();
      const details = parseSupportDetails(response);
      setPhone(details.phone);
      setEmail(details.email);
    } catch (err) {
      setError(err.message || 'Failed to load contact details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSupportDetails();
  }, [fetchSupportDetails]);

  const openPhone = () => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const openEmail = () => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`);
  };

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={() => fetchSupportDetails(true)}
      colors={[colors.primary]}
    />
  );

  return (
    <View style={styles.container}>
      <SubScreenHeader title="Contact Us" onBack={() => navigation.goBack()} />

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}>
          <View style={styles.heroCard}>
            <ContactUsIcon width={120} height={120} color={colors.primary} />
            <AppText style={styles.heroTitle}>Get in Touch</AppText>
            <AppText style={styles.heroText}>
              For any queries, suggestions, or support, feel free to contact us via the details
              below. Our team will get back to you as soon as possible!
            </AppText>
          </View>

          {error ? (
            <View style={styles.errorCard}>
              <AppText style={styles.errorText}>{error}</AppText>
            </View>
          ) : null}

          <View style={styles.detailsCard}>
            {phone ? (
              <ContactRow icon={Phone} label="Phone" value={phone} onPress={openPhone} />
            ) : null}
            {email ? (
              <ContactRow icon={Mail} label="Email" value={email} onPress={openEmail} />
            ) : null}
            {!phone && !email && !error ? (
              <View style={styles.emptyWrap}>
                <AppText style={styles.emptyText}>No contact details available.</AppText>
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.homeBody,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryText,
    marginTop: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  heroText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFD6D6',
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    fontSize: 14,
  },
  detailsCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFE4CC',
    marginRight: 14,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondaryText,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryText,
  },
  emptyWrap: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
  },
});

export default ContactScreen;
