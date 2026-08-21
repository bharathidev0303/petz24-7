import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import CustomInput from '../../components/view/CustomInput';
import { colors } from '../../styles/colors';
import { signup, clearError } from '../../redux/slices/authSlice';

const logoSource = require('../../assets/app-logo.png');

const SignupScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { loading, error } = useSelector(state => state.auth);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState(null);

  const validate = () => {
    if (!firstName.trim()) return 'First name is required';
    if (!lastName.trim()) return 'Last name is required';
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Enter a valid email';
    if (!/^\d{10}$/.test(mobile.trim())) return 'Enter a valid 10-digit mobile number';
    if (!password) return 'Password is required';
    if (password.length < 4) return 'Password must be at least 4 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSignup = () => {
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);
    dispatch(clearError());
    dispatch(
      signup({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email_id: email.trim(),
        mobile_number: mobile.trim(),
        password,
      }),
    );
  };

  const displayError = formError || error;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
          <AppText style={styles.subtitle}>Sign up to start shopping for your pets</AppText>

          <CustomInput
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            mandatory
          />

          <CustomInput
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            mandatory
          />

          <CustomInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            mandatory
          />

          <CustomInput
            placeholder="Mobile Number"
            value={mobile}
            onChangeText={text => setMobile(text.replace(/\D/g, '').slice(0, 10))}
            keyboardType="phone-pad"
            maxLength={10}
            mandatory
          />

          <CustomInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mandatory
          />

          <CustomInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            mandatory
          />

          {displayError ? <AppText style={styles.error}>{displayError}</AppText> : null}

          <Button onPress={handleSignup} loading={loading}>
            Register
          </Button>

          <Pressable onPress={() => navigation.navigate('Login')} style={styles.linkWrap}>
            <AppText style={styles.linkText}>
              Already have an account? <AppText style={styles.linkHighlight}>Sign in</AppText>
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
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

export default SignupScreen;
