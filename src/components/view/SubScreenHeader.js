import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from './AppText';
import BackButton from './backButton';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';

const SubScreenHeader = ({ title, onBack, rightAction }) => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.side}>
        <BackButton onPress={onBack} />
      </View>

      <AppText style={styles.title} numberOfLines={1}>
        {title}
      </AppText>

      <View style={[styles.side, styles.sideRight]}>
        {rightAction ? (
          <TouchableOpacity
            onPress={rightAction.onPress}
            hitSlop={8}
            style={[
              styles.actionBtn,
              (rightAction.loading || rightAction.disabled) && styles.actionBtnDisabled,
            ]}
            disabled={rightAction.loading || rightAction.disabled}
            activeOpacity={0.85}>
            {rightAction.loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <AppText style={styles.actionText}>{rightAction.label}</AppText>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.sidePlaceholder} />
        )}
      </View>
    </View>
  );
};

const createStyles = colors => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  side: {
    minWidth: 72,
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  sidePlaceholder: {
    width: 40,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryText,
    textAlign: 'center',
  },
  actionBtn: {
    backgroundColor: colors.button,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});

export default SubScreenHeader;
