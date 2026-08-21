import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  StyleSheet,
  BackHandler,
} from 'react-native';
import AppText from '../AppText';
import Button from '../Button';
import Close from '../icons/Close';
import { colors } from '../../styles/colors';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const pad = value => String(value).padStart(2, '0');

export const formatCalendarDate = (year, monthIndex, day) =>
  `${year}-${pad(monthIndex + 1)}-${pad(day)}`;

export const parseCalendarDate = value => {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, monthIndex, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== monthIndex ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const startOfDay = date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const CalendarModal = ({
  visible,
  onClose,
  title = 'Select Date',
  value,
  onSelect,
  maximumDate = new Date(),
}) => {
  const parsedValue = parseCalendarDate(value);
  const maxDay = startOfDay(maximumDate);

  const [viewYear, setViewYear] = useState(maxDay.getFullYear());
  const [viewMonth, setViewMonth] = useState(maxDay.getMonth());
  const [selectedDate, setSelectedDate] = useState(parsedValue);

  useEffect(() => {
    if (!visible) return;

    const parsed = parseCalendarDate(value);
    const initial = parsed || startOfDay(maximumDate);
    setViewYear(initial.getFullYear());
    setViewMonth(initial.getMonth());
    setSelectedDate(parsed);
  }, [visible, value, maximumDate]);

  useEffect(() => {
    if (!visible) return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose?.();
      return true;
    });

    return () => subscription.remove();
  }, [visible, onClose]);

  const weeks = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const startOffset = firstDay.getDay();
    const cells = [];

    for (let i = 0; i < startOffset; i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(day);
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    const rows = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }

    return rows;
  }, [viewYear, viewMonth]);

  const goToPreviousMonth = () => {
    if (viewMonth === 0) {
      setViewYear(prev => prev - 1);
      setViewMonth(11);
      return;
    }
    setViewMonth(prev => prev - 1);
  };

  const goToNextMonth = () => {
    const nextMonthStart = new Date(viewYear, viewMonth + 1, 1);
    if (nextMonthStart > maxDay) return;

    if (viewMonth === 11) {
      setViewYear(prev => prev + 1);
      setViewMonth(0);
      return;
    }
    setViewMonth(prev => prev + 1);
  };

  const canGoNext =
    new Date(viewYear, viewMonth + 1, 1) <=
    new Date(maxDay.getFullYear(), maxDay.getMonth(), 1);

  const handleDayPress = day => {
    const date = new Date(viewYear, viewMonth, day);
    if (date > maxDay) return;
    setSelectedDate(date);
  };

  const handleApply = () => {
    if (!selectedDate) return;
    onSelect?.(
      formatCalendarDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()),
    );
    onClose?.();
  };

  const isSelected = day => {
    if (!selectedDate || day == null) return false;
    return (
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === day
    );
  };

  const isDisabled = day => {
    if (day == null) return true;
    return new Date(viewYear, viewMonth, day) > maxDay;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <AppText style={styles.modalTitle}>{title}</AppText>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Close />
            </TouchableOpacity>
          </View>

          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={goToPreviousMonth} style={styles.navBtn} hitSlop={12}>
              <AppText style={styles.navBtnText}>‹</AppText>
            </TouchableOpacity>
            <AppText style={styles.monthTitle}>
              {MONTHS[viewMonth]} {viewYear}
            </AppText>
            <TouchableOpacity
              onPress={goToNextMonth}
              style={[styles.navBtn, !canGoNext && styles.navBtnDisabled]}
              disabled={!canGoNext}
              hitSlop={12}>
              <AppText style={[styles.navBtnText, !canGoNext && styles.navBtnTextDisabled]}>›</AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAYS.map(day => (
              <AppText key={day} style={styles.weekday}>
                {day}
              </AppText>
            ))}
          </View>

          <View style={styles.grid}>
            {weeks.map((week, weekIndex) => (
              <View key={`week-${weekIndex}`} style={styles.weekRow}>
                {week.map((day, dayIndex) => {
                  const disabled = isDisabled(day);
                  const selected = isSelected(day);

                  return (
                    <TouchableOpacity
                      key={`day-${weekIndex}-${dayIndex}`}
                      style={[
                        styles.dayCell,
                        selected && styles.dayCellSelected,
                        disabled && styles.dayCellDisabled,
                      ]}
                      disabled={disabled || day == null}
                      onPress={() => handleDayPress(day)}
                      activeOpacity={0.85}>
                      <AppText
                        style={[
                          styles.dayText,
                          selected && styles.dayTextSelected,
                          disabled && styles.dayTextDisabled,
                        ]}>
                        {day || ''}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          <Button onPress={handleApply} disabled={!selectedDate} style={styles.applyBtn}>
            Apply
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primaryText,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 12,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontSize: 24,
    lineHeight: 28,
    color: colors.primaryText,
    fontWeight: '600',
  },
  navBtnTextDisabled: {
    color: colors.secondaryText,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primaryText,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  grid: {
    marginBottom: 16,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    marginHorizontal: 2,
  },
  dayCellSelected: {
    backgroundColor: colors.button,
  },
  dayCellDisabled: {
    opacity: 0.35,
  },
  dayText: {
    fontSize: 15,
    color: colors.primaryText,
    fontWeight: '500',
  },
  dayTextSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  dayTextDisabled: {
    color: colors.secondaryText,
  },
  applyBtn: {
    marginTop: 4,
  },
});

export default CalendarModal;
