import React from 'react';
import { View, StyleSheet } from 'react-native';

export const SkeletonLoader = ({ height = 20, width: customWidth = '100%', borderRadius = 4, style = {} }) => (
  <View style={[styles.skeleton, { height, width: customWidth, borderRadius }, style]} />
);

export const SkeletonText = ({ lines = 1, style = {}, height = 16 }) => (
  <View style={[styles.textContainer, style]}>
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonLoader
        key={index}
        height={height}
        width={index === lines - 1 ? '70%' : '100%'}
        style={{ marginBottom: index < lines - 1 ? 8 : 0 }}
      />
    ))}
  </View>
);

export const SkeletonListItem = () => (
  <View style={styles.listItemSkeleton}>
    <View style={styles.headerRow}>
      <SkeletonLoader height={20} width="60%" borderRadius={4} />
      <SkeletonLoader height={24} width={24} borderRadius={4} />
    </View>
    <View style={styles.infoRow}>
      <SkeletonLoader height={14} width="25%" borderRadius={3} />
      <SkeletonLoader height={14} width="20%" borderRadius={3} />
      <SkeletonLoader height={14} width="20%" borderRadius={3} />
    </View>
  </View>
);

export const SkeletonList = ({ items = 5 }) => (
  <View style={styles.listContainer}>
    {Array.from({ length: items }).map((_, index) => (
      <View key={index} style={{ marginBottom: 12 }}>
        <SkeletonListItem />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeleton: { backgroundColor: '#E8E8E8', overflow: 'hidden' },
  textContainer: { width: '100%' },
  listItemSkeleton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  listContainer: { paddingVertical: 8 },
});

export default SkeletonLoader;
