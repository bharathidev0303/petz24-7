import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { useThemedStyles } from '../../theme/useThemedStyles';

const HORIZONTAL_PADDING = 32;
const carouselWidth = Dimensions.get('window').width - HORIZONTAL_PADDING;

const ProductImageCarousel = ({ images = [] }) => {
  const styles = useThemedStyles(createStyles);
  const [activeIndex, setActiveIndex] = useState(0);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const nextIndex = viewableItems[0]?.index;
    if (typeof nextIndex === 'number') {
      setActiveIndex(nextIndex);
    }
  }).current;

  if (!images.length) {
    return <View style={[styles.image, styles.imagePlaceholder, styles.carouselItem]} />;
  }

  if (images.length === 1) {
    return (
      <Image
        source={{ uri: images[0] }}
        style={[styles.image, styles.carouselItem]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={styles.wrap}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={carouselWidth}
        snapToAlignment="start"
        disableIntervalMomentum
        keyExtractor={(item, index) => `${item}-${index}`}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: carouselWidth,
          offset: carouselWidth * index,
          index,
        })}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={[styles.image, styles.carouselItem]}
            resizeMode="cover"
          />
        )}
      />

      <View style={styles.dotsRow}>
        {images.map((_, index) => (
          <View
            key={`dot-${index}`}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
};

const createStyles = colors => ({
  wrap: {
    marginBottom: 16,
  },
  image: {
    height: 280,
    borderRadius: 16,
    backgroundColor: colors.lightGray,
  },
  carouselItem: {
    width: carouselWidth,
  },
  imagePlaceholder: {
    backgroundColor: '#e8e8e8',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
});

export default ProductImageCarousel;
