import React from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import AppText from '../AppText';
import { colors } from '../../styles/colors';
import Close from '../icons/Close';
import Search from '../icons/Search';

const DropdownModal = ({
  visible,
  onClose,
  title,
  data = [],
  selectedIds = [],
  onSelect,
  onMultiSelect,
  multiSelect = false,
  loading,
  searchValue,
  onSearchChange,
  enableSearch = false,
  emptyText = 'No items available',
  onApply,
}) => {
  const handleMultiToggle = key => {
    let updated;
    if (selectedIds.includes(key)) {
      updated = selectedIds.filter(id => id !== key);
    } else {
      updated = [...selectedIds, key];
    }
    onMultiSelect?.(updated);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <AppText style={styles.modalTitle}>{title}</AppText>
            <TouchableOpacity onPress={onClose}>
              <Close />
            </TouchableOpacity>
          </View>

          {enableSearch && (
            <View style={styles.searchContainer}>
              <Search />
              <TextInput
                placeholder="Search..."
                placeholderTextColor="#888"
                value={searchValue}
                onChangeText={onSearchChange}
                style={styles.searchInput}
              />
            </View>
          )}

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.modalLoader} />
          ) : (
            <FlatList
              data={data}
              keyExtractor={item => item.key.toString()}
              renderItem={({ item }) => {
                const isSelected = selectedIds.includes(item.key);
                return (
                  <TouchableOpacity
                    style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                    onPress={() => {
                      if (multiSelect) {
                        handleMultiToggle(item.key);
                      } else {
                        onSelect?.(item);
                        onClose?.();
                      }
                    }}>
                    <AppText style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}>
                      {item.label}
                    </AppText>
                    {multiSelect ? (
                      <AppText style={styles.checkbox}>{isSelected ? '☑' : '☐'}</AppText>
                    ) : (
                      isSelected && <AppText style={styles.check}>✓</AppText>
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={<AppText style={styles.emptyText}>{emptyText}</AppText>}
              style={styles.modalList}
            />
          )}

          {multiSelect && (
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                onClose?.();
                onApply?.();
              }}>
              <AppText style={styles.applyButtonText}>Apply</AppText>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: 10,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#333' },
  modalList: { paddingHorizontal: 16, marginBottom: 10 },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalItemSelected: { backgroundColor: '#FFF5ED' },
  modalItemText: { fontSize: 16, color: '#333', flex: 1 },
  modalItemTextSelected: { color: colors.primary, fontWeight: '500' },
  emptyText: { textAlign: 'center', paddingVertical: 40, fontSize: 16, color: '#999' },
  applyButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  applyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalLoader: { paddingVertical: 50 },
  checkbox: { fontSize: 18 },
  check: { color: colors.primary, fontSize: 18, fontWeight: '700' },
});

export default DropdownModal;
