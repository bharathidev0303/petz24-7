import React, { useEffect, useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Button from '../Button';
import AppView from '../AppView';
import AppText from '../AppText';
import { colors } from '../../styles/colors';

const PRESET_RANGES = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

const DateRangePicker = ({ visible, onClose, handleChange, value }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    if (visible && value?.startDate && value?.endDate) {
      setStartDate(value.startDate.slice(0, 10));
      setEndDate(value.endDate.slice(0, 10));
    }
  }, [visible, value]);

  const toISOStringUTC = dateString => `${dateString}T00:00:00Z`;

  const applyPreset = days => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    setStartDate(startStr);
    setEndDate(endStr);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <AppText style={styles.title}>Select Date Range</AppText>

          <ScrollView>
            {PRESET_RANGES.map(range => (
              <TouchableOpacity key={range.days} style={styles.presetItem} onPress={() => applyPreset(range.days)}>
                <AppText>{range.label}</AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {startDate && endDate && (
            <AppText style={styles.selectedRange}>
              {startDate} → {endDate}
            </AppText>
          )}

          <AppView flexDirection="row" justifyContent="space-between" marginTop={20}>
            <Button
              backgroundColor="white"
              onPress={() => {
                handleChange?.({ startDate: null, endDate: null });
                setStartDate(null);
                setEndDate(null);
                onClose?.();
              }}
              style={{ borderWidth: 0.5, flex: 1, marginRight: 8 }}
              textStyle={{ color: colors.primaryText }}>
              Clear
            </Button>

            <Button
              disabled={!startDate || !endDate}
              onPress={() => {
                handleChange?.({
                  startDate: toISOStringUTC(startDate),
                  endDate: toISOStringUTC(endDate),
                });
                onClose?.();
              }}
              style={{ flex: 1 }}>
              Apply
            </Button>
          </AppView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  content: { backgroundColor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  presetItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedRange: { marginTop: 12, color: colors.primary, fontWeight: '600' },
});

export default DateRangePicker;
