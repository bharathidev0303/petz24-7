import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppText from '../../components/AppText';
import SubScreenHeader from '../../components/view/SubScreenHeader';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';
import { buildTawkEmbedHtml, isTawkConfigured } from '../../config/tawk';

const LOADER_TIMEOUT_MS = 15000;

const TawkChatScreen = () => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const visitor = route.params?.visitor;
  const [loading, setLoading] = useState(true);
  const canLoadChat = isTawkConfigured();

  const embedHtml = useMemo(
    () =>
      buildTawkEmbedHtml({
        visitor,
        backgroundColor: colors.homeBody,
      }),
    [visitor, colors.homeBody],
  );

  useEffect(() => {
    if (!loading) return undefined;

    const timer = setTimeout(() => {
      setLoading(false);
    }, LOADER_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [loading]);

  const handleChatReady = useCallback(() => {
    setLoading(false);
  }, []);

  const handleMessage = useCallback(
    event => {
      if (event.nativeEvent.data === 'tawk-ready') {
        handleChatReady();
      }
    },
    [handleChatReady],
  );

  return (
    <View style={styles.container}>
      <SubScreenHeader title="Live Chat" onBack={() => navigation.goBack()} />

      <View style={styles.webviewWrap}>
        {canLoadChat ? (
          <WebView
            source={{ html: embedHtml, baseUrl: 'https://embed.tawk.to' }}
            style={[styles.webview, loading && styles.webviewHidden]}
            javaScriptEnabled
            domStorageEnabled
            cacheEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            onMessage={handleMessage}
            onError={handleChatReady}
            onHttpError={handleChatReady}
          />
        ) : null}

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText style={styles.loaderText}>Connecting to chat...</AppText>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const createStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.homeBody,
    },
    webviewWrap: {
      flex: 1,
      backgroundColor: colors.homeBody,
    },
    webview: {
      flex: 1,
      backgroundColor: colors.homeBody,
    },
    webviewHidden: {
      opacity: 0,
    },
    loaderWrap: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.homeBody,
      gap: 12,
      zIndex: 2,
      elevation: 2,
    },
    loaderText: {
      fontSize: 14,
      color: colors.secondaryText,
    },
  });

export default TawkChatScreen;
