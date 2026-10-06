import React from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import AppText from '../AppText';
import Close from '../icons/Close';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';

const PetCategoriesModal = ({ visible, pet, onClose, onCategoryPress }) => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const types = Array.isArray(pet?.types) ? pet.types : [];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={12} style={styles.closeButton}>
            <Close color={colors.primaryText} />
          </TouchableOpacity>
          <AppText style={styles.title}>{pet?.pet_name || 'Categories'}</AppText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.categoryPanel}>
            {types.map(type => {
              const categories = Array.isArray(type.categories) ? type.categories : [];
              if (!categories.length) return null;

              return (
                <View key={type.product_type_id || type.type} style={styles.typeSection}>
                  <AppText style={styles.typeTitle}>{type.type}</AppText>
                  <View style={styles.categoryRow}>
                    {categories.map(category => (
                      <TouchableOpacity
                        key={category.product_category_id || category.category}
                        activeOpacity={0.8}
                        style={styles.categoryChip}
                        onPress={() => onCategoryPress?.(pet, category)}>
                        <AppText style={styles.categoryText}>{category.category}</AppText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}
            {!types.some(type => type.categories?.length) ? (
              <AppText style={styles.emptyText}>No categories available.</AppText>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const createStyles = colors => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  closeButton: {
    width: 36,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryText,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  categoryPanel: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  typeSection: {
    marginBottom: 22,
  },
  typeTitle: {
    marginBottom: 12,
    fontSize: 17,
    fontWeight: '600',
    color: colors.primaryText,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: colors.homeBody,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primaryText,
  },
  emptyText: {
    paddingVertical: 24,
    textAlign: 'center',
    color: colors.secondaryText,
  },
});

export default PetCategoriesModal;