import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import AppText from '../AppText';
import { Fonts } from '../../utils/fontHelper';
import { useThemedStyles } from '../../theme/useThemedStyles';

const RadioOption = ({
  label,
  selected,
  onSelect,
  disabled,
  width = 14,
  height = 14,
  borderWidth = 1,
  borderRadius = 9,
  borderColor = '#909090',
}) => {
  const styles = useThemedStyles(createStyles);

  return (
    <TouchableOpacity
      disabled={disabled}
      style={[styles.radioOption, disabled && styles.disabled]}
      onPress={() => onSelect?.()}>
      <View
        style={[
          styles.radio,
          { width, height, borderWidth, borderRadius, borderColor },
          selected && styles.radioSelected,
        ]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <AppText style={[styles.radioText, selected && styles.radioSelectedText]}>{label}</AppText>
    </TouchableOpacity>
  );
};

const createStyles = colors => ({
  radioOption: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  disabled: { opacity: 0.4 },
  radio: { alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.primary },
  radioSelectedText: { fontFamily: Fonts.Bold, fontWeight: '600', color: colors.primaryText },
  radioInner: { width: 7, height: 7, borderRadius: 5, backgroundColor: colors.primary },
  radioText: { fontSize: 13, color: colors.secondaryText, fontFamily: Fonts.Regular },
});

export default RadioOption;
