import React from 'react';
import { TouchableOpacity, StyleSheet, Alert, View, ActivityIndicator } from 'react-native';
import AppText from '../AppText';
import AppView from '../AppView';
import Upload from '../icons/Upload';
import EyeOpen from '../icons/EyeOpen';
import ModalClose from '../icons/modalClose';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';

const FileUpload = ({
  placeholder = 'Upload file',
  accept = ['pdf', 'jpg', 'jpeg', 'png'],
  maxSize = 15 * 1024 * 1024,
  disabled = false,
  isRequired = false,
  onSelectFile,
  style,
  uploadedFile,
  handleDelete,
  isLoading = false,
  error,
  onPreview,
}) => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const openFilePicker = () => {
    if (disabled) return;

    // Dummy file picker – replace with @react-native-documents/picker when needed
    Alert.alert('File Upload', 'Select a file type', [
      {
        text: 'PDF',
        onPress: () =>
          onSelectFile?.({
            uri: 'file://dummy/document.pdf',
            name: 'document.pdf',
            type: 'application/pdf',
            size: 1024,
          }),
      },
      {
        text: 'Image',
        onPress: () =>
          onSelectFile?.({
            uri: 'file://dummy/photo.jpg',
            name: 'photo.jpg',
            type: 'image/jpeg',
            size: 2048,
          }),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <AppView marginVertical={10}>
      {uploadedFile != null ? (
        <View style={[styles.container, styles.uploadedContainer]}>
          <AppText style={[styles.text, { maxWidth: '75%' }]} numberOfLines={1} ellipsizeMode="tail">
            {uploadedFile?.name}
          </AppText>
          <View style={styles.actions}>
            {uploadedFile?.view !== false && (
              <TouchableOpacity onPress={() => onPreview?.(uploadedFile)}>
                <EyeOpen color={colors.primary} />
              </TouchableOpacity>
            )}
            {uploadedFile?.remove !== false && (
              <TouchableOpacity onPress={() => handleDelete?.()}>
                <ModalClose width={20} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : isLoading ? (
        <AppView style={[styles.container, styles.loadingRow, style]} gap={10} alignItems="center" flexDirection="row">
          <AppText>Uploading...</AppText>
          <ActivityIndicator size="small" color={colors.primary} />
        </AppView>
      ) : (
        <TouchableOpacity
          style={[styles.container, error && styles.errorContainer, style, disabled && styles.disabled]}
          onPress={openFilePicker}
          activeOpacity={0.7}>
          <AppText fontFamily="Regular" style={styles.text}>
            {placeholder}
            {isRequired && <AppText style={styles.asterisk}> *</AppText>}
          </AppText>
          <Upload color={colors.primary} />
        </TouchableOpacity>
      )}

      {error && (
        <AppText fontFamily="Regular" style={styles.errorText} color="red">
          {error}
        </AppText>
      )}
    </AppView>
  );
};

const createStyles = colors => ({
  container: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFF5ED',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  uploadedContainer: { borderWidth: 0, backgroundColor: '#F7941E0D' },
  loadingRow: { justifyContent: 'center' },
  text: { fontSize: 14, color: colors.text, flex: 1 },
  asterisk: { color: 'red' },
  disabled: { opacity: 0.6 },
  errorContainer: { borderColor: 'red', borderWidth: 1.5 },
  errorText: { marginTop: 5, paddingLeft: 15, fontSize: 13 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 15 },
});

export default FileUpload;
