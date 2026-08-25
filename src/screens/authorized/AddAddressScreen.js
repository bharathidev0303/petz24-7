import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AppText from '../../components/AppText';
import AppInput from '../../components/AppInput';
import SubScreenHeader from '../../components/view/SubScreenHeader';
import { AppToastService } from '../../components/view/AppToast';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';
import { addressAPI } from '../../api/address';
import { getUserErrorMessage } from '../../utils/apiError';

const Field = ({ label, value, onChangeText, ...props }) => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  return (
  <View style={styles.field}>
    <AppText style={styles.label}>{label}</AppText>
    <AppInput
      value={value}
      onChangeText={onChangeText}
      placeholder={label}
      placeholderTextColor={colors.secondaryText}
      style={styles.input}
      {...props}
    />
  </View>
  );
};

const buildInitialForm = (user, address) => ({
  fname: address?.fname || user?.firstName || '',
  lname: address?.lname || user?.lastName || '',
  mobile_number: address?.mobile_number || user?.mobile || '',
  address_line: address?.address_line || '',
  address_line_two: address?.address_line_two || '',
  city: address?.city || '',
  state: address?.state || '',
  postal_code: address?.postal_code || '',
});

const AddAddressScreen = () => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useSelector(state => state.auth);
  const editingAddress = route.params?.address;
  const isEditing = Boolean(editingAddress?.address_id);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => buildInitialForm(user, editingAddress));

  const screenTitle = useMemo(
    () => (isEditing ? 'Edit Address' : 'Add Address'),
    [isEditing],
  );

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!user?.id) {
      AppToastService.show('Please sign in to save an address', 'warning');
      return;
    }

    const required = [
      'fname',
      'lname',
      'mobile_number',
      'address_line',
      'city',
      'state',
      'postal_code',
    ];
    const missing = required.find(key => !String(form[key] || '').trim());
    if (missing) {
      AppToastService.show('Please fill all required fields', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        ...form,
      };

      if (isEditing) {
        await addressAPI.updateUserAddress({
          ...payload,
          address_id: editingAddress.address_id,
        });
        AppToastService.show('Address updated successfully', 'success');
      } else {
        await addressAPI.addUserAddress(payload);
        AppToastService.show('Address added successfully', 'success');
      }

      navigation.goBack();
    } catch (err) {
      AppToastService.show(getUserErrorMessage(err, 'Could not save address'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <SubScreenHeader
        title={screenTitle}
        onBack={() => navigation.goBack()}
        rightAction={{
          label: isEditing ? 'Update' : 'Save',
          onPress: handleSave,
          loading: saving,
        }}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Field label="First name *" value={form.fname} onChangeText={v => updateField('fname', v)} />
          <Field label="Last name *" value={form.lname} onChangeText={v => updateField('lname', v)} />
          <Field
            label="Mobile number *"
            value={form.mobile_number}
            onChangeText={v => updateField('mobile_number', v)}
            keyboardType="phone-pad"
          />
          <Field
            label="Address line 1 *"
            value={form.address_line}
            onChangeText={v => updateField('address_line', v)}
          />
          <Field
            label="Address line 2"
            value={form.address_line_two}
            onChangeText={v => updateField('address_line_two', v)}
          />
          <Field label="City *" value={form.city} onChangeText={v => updateField('city', v)} />
          <Field label="State *" value={form.state} onChangeText={v => updateField('state', v)} />
          <Field
            label="Postal code *"
            value={form.postal_code}
            onChangeText={v => updateField('postal_code', v)}
            keyboardType="number-pad"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const createStyles = colors => ({
  container: {
    flex: 1,
    backgroundColor: colors.homeBody,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.primaryText,
  },
});

export default AddAddressScreen;
