import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import { colors } from '../../styles/colors';
import { login, clearError } from '../../redux/slices/authSlice';

const logoSource = require('../../assets/app-logo.png');

const LoginScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { loading, error } = useSelector(state => state.auth);
  const [email, setEmail] = useState('testdata@gmail.com');
  const [password, setPassword] = useState('1234');

  const handleLogin = () => {
    dispatch(clearError());
    dispatch(login({ email, password }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Image source={logoSource} style={styles.logo} resizeMode="contain" />
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

        <Pressable onPress={() => navigation.navigate('Signup')} style={styles.linkWrap}>
          <AppText style={styles.linkText}>
            New user? <AppText style={styles.linkHighlight}>Create an account</AppText>
          </AppText>
        </Pressable>
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
  logo: {
    width: '100%',
    height: 56,
    marginBottom: 8,
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
  linkWrap: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  linkHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default LoginScreen;
