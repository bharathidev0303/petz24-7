import React, { useCallback, useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import AppText from '../AppText';
import Button from '../Button';
import { colors } from '../../styles/colors';

const ConfirmDialog = ({
  visible,
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
  destructive = false,
}) => {
  const handleClose = useCallback(() => {
    if (!loading) {
      onCancel?.();
    }
  }, [loading, onCancel]);

  useEffect(() => {
    if (!visible) return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });

    return () => subscription.remove();
  }, [visible, handleClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
    <View style={styles.overlay}>
      <View style={styles.dialog}>
        <AppText style={styles.title}>{title}</AppText>
        {message ? <AppText style={styles.message}>{message}</AppText> : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.cancelBtn, loading && styles.disabled]}
            onPress={onCancel}
            disabled={loading}
            activeOpacity={0.8}>
            <AppText style={styles.cancelText}>{cancelLabel}</AppText>
          </TouchableOpacity>
          <Button
            loading={loading}
            onPress={onConfirm}
            backgroundColor={destructive ? colors.error : colors.button}
            style={styles.confirmBtn}>
            {confirmLabel}
          </Button>
        </View>
      </View>
    </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryText,
  },
  confirmBtn: {
    flex: 1,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default ConfirmDialog;
