import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import SubScreenHeader from '../../components/view/SubScreenHeader';
import RequestErrorState from '../../components/view/RequestErrorState';
import { chatAPI } from '../../api/chat';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';
import { openExternalLink } from '../../utils/openExternalLink';
import { openTawkChat } from '../../utils/tawkChat';

const INACTIVE_FEATURES = [
  {
    icon: '⚡',
    title: 'Instant Connection',
    description:
      'Start a conversation with our support team and veterinary experts without filling lengthy forms.',
  },
  {
    icon: '💬',
    title: 'Real-Time Chat Support',
    description:
      'Get answers to your pet care questions through our secure live chat system directly on the website.',
  },
  {
    icon: '🐾',
    title: 'Expert Veterinary Guidance',
    description:
      'Receive professional advice on pet health, nutrition, behavior, grooming, and general care.',
  },
];

const ACTIVE_SERVICES = [
  { icon: '🩺', label: 'Pet Health Consultation' },
  { icon: '🥗', label: 'Diet & Nutrition Guidance' },
  { icon: '🐶', label: 'Pet Behavior Support' },
  { icon: '📞', label: 'General Veterinary Advice' },
];

const DetailRow = ({ label, value, styles, valueStyle, isLast = false }) => (
  <View style={[styles.detailRow, isLast && styles.detailRowLast]}>
    <AppText style={styles.detailLabel}>{label}</AppText>
    {typeof value === 'string' || typeof value === 'number' ? (
      <AppText style={[styles.detailValue, valueStyle]}>{value}</AppText>
    ) : (
      value
    )}
  </View>
);

const PlanBadge = ({ planName, planImage, styles }) => {
  const label = `- ${String(planName || 'Standard').trim().toUpperCase()} -`;

  if (planImage) {
    return (
      <View style={styles.badgeWrap}>
        <Image source={{ uri: planImage }} style={styles.planBadgeAsset} resizeMode="contain" />
      </View>
    );
  }

  return (
    <View style={styles.badgeWrap}>
      <View style={styles.planBadgeShield}>
        <View style={styles.planBadgeInner}>
          <AppText style={styles.planBadgeCrown}>👑</AppText>
        </View>
        <View style={styles.planBadgeRibbon}>
          <AppText style={styles.planBadgeRibbonText}>{label}</AppText>
        </View>
      </View>
    </View>
  );
};

const ChatDoctorInactiveView = ({ onStartPress, styles }) => (
  <>
    <View style={styles.hero}>
      <AppText style={styles.heroTitle}>Chat with a Vet Instantly</AppText>
      <AppText style={styles.heroDescription}>
        Have a pet health concern or question? Connect with our experienced veterinarians
        directly through our live chat support and get expert guidance from the comfort of
        your home.
      </AppText>
      <Button
        onPress={onStartPress}
        backgroundColor="#00C853"
        style={styles.heroButton}
        textStyle={styles.heroButtonText}>
        Start Chat Now
      </Button>
    </View>

    <View style={styles.section}>
      <AppText style={styles.sectionTitle}>Why Choose Petz24 Live Vet Support?</AppText>
      <AppText style={styles.sectionSubtitle}>
        Fast, convenient and reliable veterinary guidance whenever you need it.
      </AppText>

      {INACTIVE_FEATURES.map(feature => (
        <View key={feature.title} style={styles.featureCard}>
          <AppText style={styles.featureIcon}>{feature.icon}</AppText>
          <AppText style={styles.featureTitle}>{feature.title}</AppText>
          <AppText style={styles.featureDescription}>{feature.description}</AppText>
        </View>
      ))}
    </View>

    <View style={styles.section}>
      <AppText style={styles.sectionTitle}>Need Help With Your Pet?</AppText>
      <AppText style={styles.sectionSubtitle}>
        Our veterinary support team is ready to assist you. Start a live chat now and get
        expert guidance for your pet's needs.
      </AppText>
      <Button
        onPress={onStartPress}
        backgroundColor="#00C853"
        style={styles.bottomButton}
        textStyle={styles.heroButtonText}>
        Start Chat Now
      </Button>
    </View>
  </>
);

const ChatDoctorActiveView = ({ subscription, onStartPress, styles }) => (
  <>
    <View style={styles.successHero}>
      <AppText style={styles.successEmoji}>🎉</AppText>
      <AppText style={styles.successTitle}>Subscription Activated Successfully!</AppText>
      <AppText style={styles.successSubtitle}>
        Welcome to Petz24 Vet Support. Your subscription is active until{' '}
        {subscription.expiryDate}.
      </AppText>
    </View>

    <PlanBadge
      planName={subscription.planName}
      planImage={subscription.planImage}
      styles={styles}
    />

    <View style={styles.card}>
      <AppText style={styles.cardTitle}>📋 Subscription Details</AppText>
      <DetailRow label="Plan Name" value={subscription.planName || '-'} styles={styles} />
      <DetailRow label="Plan Price" value={subscription.planPrice || '-'} styles={styles} />
      <DetailRow label="Start Date" value={subscription.startDate || '-'} styles={styles} />
      <DetailRow label="Expiry Date" value={subscription.expiryDate || '-'} styles={styles} />
      <DetailRow label="Duration" value={subscription.duration || '-'} styles={styles} />
      <DetailRow
        label="Status"
        isLast
        styles={styles}
        value={
          <View style={styles.statusPill}>
            <AppText style={styles.statusPillText}>
              {subscription.statusLabel || 'Active Subscription'}
            </AppText>
          </View>
        }
      />
    </View>

    <View style={styles.infoCard}>
      <AppText style={styles.infoTitle}>💬 Connect With Our Veterinary Team</AppText>
      <AppText style={styles.infoBody}>
        Your subscription is active. You can now connect directly with our veterinary experts
        using the live chat support.
      </AppText>

      {ACTIVE_SERVICES.map(service => (
        <View key={service.label} style={styles.serviceRow}>
          <AppText style={styles.serviceIcon}>{service.icon}</AppText>
          <AppText style={styles.serviceLabel}>{service.label}</AppText>
        </View>
      ))}
    </View>

    <Button
      onPress={onStartPress}
      backgroundColor="#00C853"
      style={styles.bottomButton}
      textStyle={styles.heroButtonText}>
      💬 Start Chat Now
    </Button>
    <AppText style={styles.footerHint}>
      Tap Start Chat Now to open the live chat and connect with our veterinary support team.
    </AppText>
  </>
);

const ChatDoctorScreen = () => {
  const navigation = useNavigation();
  const { user } = useSelector(state => state.auth);
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubscription = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await chatAPI.getUserChatSubscription();
      setSubscription(result);
    } catch (err) {
      setError(err.message || 'Failed to load chat subscription');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const handleStartChat = () => {
    if (subscription?.isActive) {
      const opened = openTawkChat(navigation, {
        chatUrl: subscription.chatUrl,
        tawkPropertyId: subscription.tawkPropertyId,
        tawkWidgetId: subscription.tawkWidgetId,
        visitor: {
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.mobile || '',
        },
      });

      if (!opened && subscription.chatUrl) {
        openExternalLink(subscription.chatUrl);
      }
      return;
    }
    navigation.navigate('ChatDoctorBooking');
  };

  const renderContent = () => {
    if (loading && !subscription) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (error && !subscription) {
      return <RequestErrorState error={error} onRetry={() => fetchSubscription()} />;
    }

    if (!subscription) {
      return null;
    }

    if (subscription.isActive) {
      return (
        <ChatDoctorActiveView
          subscription={subscription}
          onStartPress={handleStartChat}
          styles={styles}
        />
      );
    }

    return (
      <ChatDoctorInactiveView onStartPress={handleStartChat} styles={styles} />
    );
  };

  return (
    <View style={styles.container}>
      <SubScreenHeader title="Chat with Doctor" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchSubscription(true)}
            colors={[colors.primary]}
          />
        }>
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const createStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingBottom: 32,
    },
    centered: {
      flex: 1,
      minHeight: 280,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hero: {
      backgroundColor: '#4CB8C4',
      paddingHorizontal: 20,
      paddingTop: 28,
      paddingBottom: 32,
      alignItems: 'center',
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: 14,
    },
    heroDescription: {
      fontSize: 15,
      lineHeight: 23,
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: 22,
    },
    heroButton: {
      minWidth: 180,
      borderRadius: 999,
    },
    heroButtonText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    section: {
      paddingHorizontal: 20,
      paddingTop: 28,
      paddingBottom: 8,
      backgroundColor: colors.card,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primaryText,
      textAlign: 'center',
      marginBottom: 10,
    },
    sectionSubtitle: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.secondaryText,
      textAlign: 'center',
      marginBottom: 18,
    },
    featureCard: {
      alignItems: 'center',
      marginBottom: 24,
      paddingHorizontal: 8,
    },
    featureIcon: {
      fontSize: 34,
      marginBottom: 10,
    },
    featureTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primaryText,
      textAlign: 'center',
      marginBottom: 8,
    },
    featureDescription: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.secondaryText,
      textAlign: 'center',
    },
    bottomButton: {
      alignSelf: 'center',
      minWidth: 200,
      borderRadius: 999,
      marginTop: 8,
    },
    successHero: {
      backgroundColor: '#00C853',
      paddingHorizontal: 20,
      paddingTop: 28,
      paddingBottom: 48,
      alignItems: 'center',
    },
    successEmoji: {
      fontSize: 42,
      marginBottom: 10,
    },
    successTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: 10,
    },
    successSubtitle: {
      fontSize: 15,
      lineHeight: 22,
      color: '#FFFFFF',
      textAlign: 'center',
    },
    badgeWrap: {
      alignItems: 'center',
      marginTop: -36,
      marginBottom: 22,
    },
    planBadgeAsset: {
      width: 132,
      height: 148,
    },
    planBadgeShield: {
      width: 118,
      height: 132,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    planBadgeInner: {
      position: 'absolute',
      top: 0,
      width: 118,
      height: 118,
      borderRadius: 59,
      backgroundColor: '#7B5CFA',
      borderWidth: 4,
      borderColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#4C3AA8',
      shadowOpacity: 0.25,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    planBadgeCrown: {
      fontSize: 34,
    },
    planBadgeRibbon: {
      width: '92%',
      backgroundColor: '#FFFFFF',
      borderRadius: 6,
      paddingVertical: 5,
      paddingHorizontal: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E8E8E8',
      zIndex: 2,
    },
    planBadgeRibbonText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#1A1A1A',
      letterSpacing: 0.4,
    },
    card: {
      marginHorizontal: 16,
      marginBottom: 16,
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 8,
      borderRadius: 14,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primaryText,
      marginBottom: 14,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    detailRowLast: {
      borderBottomWidth: 0,
      paddingBottom: 10,
    },
    detailLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: colors.primaryText,
    },
    detailValue: {
      flex: 1,
      fontSize: 14,
      fontWeight: '500',
      color: colors.secondaryText,
      textAlign: 'right',
    },
    statusPill: {
      backgroundColor: '#00C853',
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 5,
      alignSelf: 'flex-end',
    },
    statusPillText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    infoCard: {
      marginHorizontal: 16,
      marginBottom: 20,
      padding: 18,
      borderRadius: 14,
      backgroundColor: '#E8F4FD',
      borderWidth: 1,
      borderColor: '#B8DCF5',
    },
    infoTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primaryText,
      marginBottom: 10,
    },
    infoBody: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.secondaryText,
      marginBottom: 12,
    },
    serviceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    serviceIcon: {
      fontSize: 16,
      width: 28,
    },
    serviceLabel: {
      flex: 1,
      fontSize: 14,
      color: colors.primaryText,
    },
    footerHint: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.secondaryText,
      textAlign: 'center',
      paddingHorizontal: 24,
      marginTop: 10,
    },
  });

export default ChatDoctorScreen;
