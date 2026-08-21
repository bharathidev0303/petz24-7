import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AppText from './AppText';
import ListCardActions from './ListCardActions';
import { colors } from '../../styles/colors';
import { formatAddressLines, formatAddressName } from '../../utils/address';

const AddressCard = ({
  address,
  selected = false,
  onPress,
  onEdit,
  onDelete,
  showActions = false,
}) => {
  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress
    ? { activeOpacity: 0.85, onPress, style: [styles.card, selected && styles.cardSelected] }
    : { style: [styles.card, selected && styles.cardSelected] };

  return (
    <Wrapper {...wrapperProps}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <AppText style={styles.name}>{formatAddressName(address)}</AppText>
          {selected ? <AppText style={styles.selectedBadge}>Selected</AppText> : null}
        </View>
        {showActions ? <ListCardActions onEdit={onEdit} onDelete={onDelete} /> : null}
      </View>
      <AppText style={styles.mobile}>{address.mobile_number}</AppText>
      <AppText style={styles.lines}>{formatAddressLines(address)}</AppText>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF9F4',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  titleWrap: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primaryText,
  },
  selectedBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    alignSelf: 'flex-start',
  },
  mobile: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 6,
  },
  lines: {
    fontSize: 14,
    color: colors.primaryText,
    lineHeight: 20,
  },
});

export default AddressCard;
