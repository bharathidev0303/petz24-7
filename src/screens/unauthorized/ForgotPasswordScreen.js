import React, { useState } from 'react';
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';
import { authAPI } from '../../api/auth';
import { getUserErrorMessage } from '../../utils/apiError';

const logoSource = require('../../assets/app-logo.png');

const ForgotPasswordScreen = () => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validate = () => {
    const trimmed = email.trim();
    if (!trimmed) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email address';
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await authAPI.sendResetLink(email.trim());
      setSuccessMessage(
        response?.msg ||
          response?.message ||
          'If an account exists for this email, a password reset link has been sent.',
      );
    } catch (err) {
      setError(getUserErrorMessage(err, 'Could not send reset link. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backWrap}>
          <AppText style={styles.backText}>← Back to Login</AppText>
        </Pressable>

        <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        <AppText style={styles.title}>Forgot Password</AppText>
        <AppText style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </AppText>

        {successMessage ? (
          <View style={styles.successWrap}>
            <AppText style={styles.successText}>{successMessage}</AppText>
            <Button onPress={() => navigation.navigate('Login')} style={styles.submitBtn}>
              Back to Login
            </Button>
          </View>
        ) : (
          <>
            <AppText style={styles.label}>Email Address</AppText>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={colors.gray}
              value={email}
              onChangeText={value => {
                setEmail(value);
                if (error) setError('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />

            {error ? <AppText style={styles.error}>{error}</AppText> : null}

            <Button onPress={handleSubmit} loading={loading} style={styles.submitBtn}>
              Send Reset Link
            </Button>
          </>
        )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = colors => ({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
  },
  backWrap: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  logo: {
    width: '100%',
    height: 56,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.secondaryText,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.loginInputBorderColor,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
    color: colors.primaryText,
  },
  error: {
    color: colors.error,
    marginBottom: 12,
  },
  submitBtn: {
    marginTop: 4,
  },
  successWrap: {
    gap: 16,
  },
  successText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.primaryText,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 14,
  },
});

export default ForgotPasswordScreen;
