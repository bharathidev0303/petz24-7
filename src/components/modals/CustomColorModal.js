import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AppText from '../AppText';
import Button from '../Button';
import Close from '../icons/Close';
import ColorPicker from '../view/ColorPicker';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';
import { normalizeHexColor } from '../../utils/colorUtils';

const CustomColorModal = ({
  visible,
  onClose,
  title = 'Custom color',
  description,
  value,
  onPreviewChange,
  onApply,
}) => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [draftColor, setDraftColor] = useState(value);

  useEffect(() => {
    if (!visible) return;

    const normalized = normalizeHexColor(value);
    if (normalized) {
      setDraftColor(normalized);
      onPreviewChange?.(normalized);
    }
  }, [visible, value, onPreviewChange]);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!visible) return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });

    return () => subscription.remove();
  }, [visible, handleClose]);

  const handlePreviewChange = hex => {
    setDraftColor(hex);
    onPreviewChange?.(hex);
  };

  const handleApply = () => {
    const normalized = normalizeHexColor(draftColor);
    if (normalized) {
      onApply?.(normalized);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <AppText style={styles.title}>{title}</AppText>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Close">
              <Close />
            </TouchableOpacity>
          </View>

          {description ? <AppText style={styles.description}>{description}</AppText> : null}

          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}>
            <ColorPicker
              value={value}
              deferChanges
              showApplyButton={false}
              embedded
              onPreviewChange={handlePreviewChange}
            />
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleClose}
              style={styles.cancelButton}>
              <AppText style={styles.cancelText}>Cancel</AppText>
            </TouchableOpacity>
            <Button onPress={handleApply} backgroundColor={colors.button} style={styles.applyButton}>
              Apply
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = colors =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdrop: {
      flex: 1,
    },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '88%',
      paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    title: {
      flex: 1,
      fontSize: 18,
      fontWeight: '700',
      color: colors.primaryText,
      marginRight: 12,
    },
    description: {
      fontSize: 14,
      color: colors.secondaryText,
      lineHeight: 20,
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    cancelButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: colors.buttonRadius,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.inputBackground,
    },
    cancelText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.primaryText,
    },
    applyButton: {
      flex: 1,
    },
  });

export default CustomColorModal;
