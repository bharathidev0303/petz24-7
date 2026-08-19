import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import AppText from './AppText';

const ToastEventBus = {
  listeners: [],
  emit(data) {
    this.listeners.forEach(cb => cb(data));
  },
  subscribe(cb) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  },
};

const getDefaultLabel = type => {
  switch (type) {
    case 'success':
      return 'Success';
    case 'warning':
      return 'Warning';
    case 'error':
      return 'Error';
    default:
      return 'Info';
  }
};

const AppToast = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success');
  const [label, setLabel] = useState('');

  useEffect(() => {
    const unsubscribe = ToastEventBus.subscribe(({ message: msg, type: toastType, label: customLabel }) => {
      setMessage(msg);
      setType(toastType);
      setLabel(customLabel || getDefaultLabel(toastType));
      setVisible(true);
      setTimeout(() => setVisible(false), 3000);
    });
    return unsubscribe;
  }, []);

  if (!visible) return null;

  return (
    <View style={styles.root} pointerEvents="box-none">
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.container} pointerEvents="auto">
          <View
            style={[
              styles.toast,
              type === 'success' ? styles.success : type === 'warning' ? styles.warning : styles.error,
            ]}>
            <View style={styles.header}>
              <AppText style={styles.label}>{label}</AppText>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <AppText style={styles.ok}>OK</AppText>
              </TouchableOpacity>
            </View>
            <AppText style={styles.message}>{message}</AppText>
          </View>
        </View>
      </View>
    </View>
  );
};

export const AppToastService = {
  show(message, type = 'success', label) {
    ToastEventBus.emit({ message, type, label });
  },
};

const styles = StyleSheet.create({
  root: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 9999, elevation: 9999 },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  container: { marginBottom: 90, marginHorizontal: 20 },
  toast: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },
  success: { backgroundColor: '#38BA83' },
  warning: { backgroundColor: '#E2C051' },
  error: { backgroundColor: '#EF6B6B' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { color: '#E8F5E9', fontSize: 14, fontWeight: '500' },
  ok: { color: '#fff', fontSize: 14, fontWeight: '600' },
  message: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default AppToast;
