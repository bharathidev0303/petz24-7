import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppText from '../../components/AppText';
import SubScreenHeader from '../../components/view/SubScreenHeader';
import { colors } from '../../styles/colors';
import { VET_PHARMACY_PAGE } from '../../content/vetPharmacyTerms';
import { TERMS_PAGE } from '../../content/termsAndConditions';
import { PRIVACY_PAGE } from '../../content/privacyPolicy';

const CONTENT_MAP = {
  vetPharmacy: VET_PHARMACY_PAGE,
  terms: TERMS_PAGE,
  privacy: PRIVACY_PAGE,
};

const StaticContentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const contentKey = route.params?.contentKey || 'vetPharmacy';
  const page = CONTENT_MAP[contentKey] || VET_PHARMACY_PAGE;

  const handleQuickLink = target => {
    if (target === 'booking') {
      navigation.navigate('Booking');
      return;
    }
    if (target === 'chatDoctor') {
      Alert.alert('Coming soon', 'Chat with a doctor will be available shortly.');
      return;
    }
    if (target === 'terms') {
      navigation.navigate('StaticContent', { contentKey: 'terms' });
      return;
    }
    if (target === 'privacy') {
      navigation.navigate('StaticContent', { contentKey: 'privacy' });
    }
  };

  const renderBlockText = block => {
    if (block.paragraphs?.length) {
      return block.paragraphs.map(paragraph => (
        <AppText key={paragraph} style={[styles.bodyText, styles.paragraphSpacing]}>
          {paragraph}
        </AppText>
      ));
    }

    if (block.body) {
      return <AppText style={styles.bodyText}>{block.body}</AppText>;
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <SubScreenHeader title={page.title} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {page.sections.map(section => (
          <View key={section.heading} style={styles.section}>
            <AppText style={styles.sectionHeading}>{section.heading}</AppText>

            {section.blocks.map(block => (
              <View key={block.title} style={styles.block}>
                <AppText style={styles.blockTitle}>{block.title}</AppText>
                {renderBlockText(block)}
                {block.bullets?.map(item => (
                  <View key={item} style={styles.bulletRow}>
                    <AppText style={styles.bulletDot}>•</AppText>
                    <AppText style={styles.bulletText}>{item}</AppText>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}

        {page.footerText ? (
          <View style={styles.footerSection}>
            <AppText style={styles.bodyText}>{page.footerText}</AppText>
          </View>
        ) : null}

        {page.quickLinks?.length ? (
          <View style={styles.quickLinksSection}>
            <AppText style={styles.quickLinksTitle}>Quick Links</AppText>
            {page.quickLinks.map(link => (
              <TouchableOpacity
                key={link.label}
                activeOpacity={0.7}
                style={styles.quickLinkRow}
                onPress={() => handleQuickLink(link.target)}>
                <AppText style={styles.quickLinkText}>{link.label}</AppText>
                <AppText style={styles.quickLinkArrow}>›</AppText>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 16,
  },
  block: {
    marginBottom: 18,
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.primaryText,
  },
  paragraphSpacing: {
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  bulletDot: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.primary,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: colors.primaryText,
  },
  footerSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickLinksSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickLinksTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 12,
  },
  quickLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  quickLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  quickLinkArrow: {
    fontSize: 20,
    color: colors.secondaryText,
  },
});

export default StaticContentScreen;
