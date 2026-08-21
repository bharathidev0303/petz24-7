import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Edit, Trash } from '../icons';
import { colors } from '../../styles/colors';

const ICON_SIZE = 16;

const ListCardActions = ({ onEdit, onDelete, style }) => (
  <View style={[styles.actions, style]}>
    {onEdit ? (
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={onEdit}
        activeOpacity={0.75}
        accessibilityLabel="Edit"
        accessibilityRole="button">
        <Edit width={ICON_SIZE} height={ICON_SIZE} color={colors.button} />
      </TouchableOpacity>
    ) : null}
    {onDelete ? (
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={onDelete}
        activeOpacity={0.75}
        accessibilityLabel="Delete"
        accessibilityRole="button">
        <Trash width={ICON_SIZE} height={ICON_SIZE} color={colors.error} />
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ListCardActions;
