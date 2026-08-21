import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import { colors } from '../../styles/colors';

const ICON_SIZE = 20;
const CIRCLE_SIZE = 46;
const COMPLETED_BG = '#052a50';

const BookingStepIndicator = ({ steps, currentStep }) => (
  <View style={styles.wrapper}>
    <View style={styles.row}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        const isFirst = index === 0;
        const isLast = index === steps.length - 1;
        const Icon = step.Icon;
        const iconColor = isActive || isCompleted ? colors.white : colors.secondaryText;
        const lineActive = isCompleted || isActive;

        return (
          <View key={step.id} style={styles.stepItem}>
            <View style={styles.trackRow}>
              <View
                style={[
                  styles.line,
                  isFirst && styles.lineHidden,
                  lineActive && !isFirst && styles.lineCompleted,
                ]}
              />

              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isActive && styles.circleActive,
                ]}>
                {Icon ? (
                  <Icon width={ICON_SIZE} height={ICON_SIZE} color={iconColor} />
                ) : (
                  <AppText
                    style={[
                      styles.fallbackText,
                      isActive && styles.fallbackTextActive,
                      isCompleted && styles.fallbackTextCompleted,
                    ]}>
                    {stepNumber}
                  </AppText>
                )}
              </View>

              <View
                style={[
                  styles.line,
                  isLast && styles.lineHidden,
                  isCompleted && !isLast && styles.lineCompleted,
                ]}
              />
            </View>

            <AppText
              style={[styles.label, isActive && styles.labelActive, isCompleted && styles.labelCompleted]}
              numberOfLines={2}>
              {step.label}
            </AppText>
          </View>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 8,
    paddingTop: 14,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  trackRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  line: {
    flex: 1,
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  lineHidden: {
    backgroundColor: 'transparent',
  },
  lineCompleted: {
    backgroundColor: COMPLETED_BG,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  circleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  circleCompleted: {
    borderColor: COMPLETED_BG,
    backgroundColor: COMPLETED_BG,
  },
  fallbackText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondaryText,
  },
  fallbackTextActive: {
    color: colors.white,
  },
  fallbackTextCompleted: {
    color: colors.white,
  },
  label: {
    width: '100%',
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
    color: colors.secondaryText,
    paddingHorizontal: 2,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  labelCompleted: {
    color: colors.primaryText,
    fontWeight: '600',
  },
});

export default BookingStepIndicator;
