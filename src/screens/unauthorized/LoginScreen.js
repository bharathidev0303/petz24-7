import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import { colors } from '../../styles/colors';
import { login, clearError } from '../../redux/slices/authSlice';

const LoginScreen = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  const [email, setEmail] = useState('demo@petz247.com');
  const [password, setPassword] = useState('password123');

  const handleLogin = () => {
    dispatch(clearError());
    dispatch(login({ email, password }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <AppText style={styles.title}>petz24-7</AppText>
        <AppText style={styles.subtitle}>Sign in to continue</AppText>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.gray}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.gray}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <AppText style={styles.error}>{error}</AppText> : null}

        <Button onPress={handleLogin} loading={loading}>
          Login
        </Button>

        <AppText style={styles.hint}>
          Dummy login – any email/password works
        </AppText>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.secondaryText,
    marginBottom: 24,
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
  hint: {
    marginTop: 16,
    fontSize: 13,
    color: colors.secondaryText,
    textAlign: 'center',
  },
});

export default LoginScreen;
