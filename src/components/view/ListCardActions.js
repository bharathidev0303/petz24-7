import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Edit, Trash } from '../icons';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';

const ICON_SIZE = 16;

const ListCardActions = ({ onEdit, onDelete, style }) => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  return (
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
};

const createStyles = () => ({
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
