import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { getAssetUrl } from '../../config/env';
import { useThemedStyles } from '../../theme/useThemedStyles';

const BANNER_WIDTH = Dimensions.get('window').width;
const BANNER_HEIGHT = Math.round(BANNER_WIDTH * 0.42);
const AUTO_ROTATE_MS = 4000;

const getBannerImageUrl = banner =>
  getAssetUrl(banner?.mobile_image || banner?.desktop_image || banner?.image);

const HomeBannerCarousel = ({ banners = [] }) => {
  const styles = useThemedStyles(createStyles);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);
  const activeIndexRef = useRef(0);
  const timerRef = useRef(null);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const slides = useMemo(
    () =>
      banners
        .map((banner, index) => ({
          id: String(banner.banner_id ?? index),
          uri: getBannerImageUrl(banner),
        }))
        .filter(item => item.uri),
    [banners],
  );

  const scrollToSlide = useCallback(
    index => {
      if (!slides.length) return;
      listRef.current?.scrollToOffset({
        offset: index * BANNER_WIDTH,
        animated: true,
      });
    },
    [slides.length],
  );

  const stopAutoRotate = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startAutoRotate = useCallback(() => {
    stopAutoRotate();
    if (slides.length <= 1) return;

    timerRef.current = setInterval(() => {
      const nextIndex = (activeIndexRef.current + 1) % slides.length;
      scrollToSlide(nextIndex);
    }, AUTO_ROTATE_MS);
  }, [scrollToSlide, slides.length, stopAutoRotate]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    startAutoRotate();
    return stopAutoRotate;
  }, [startAutoRotate, stopAutoRotate]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const nextIndex = viewableItems[0]?.index;
    if (typeof nextIndex === 'number') {
      setActiveIndex(nextIndex);
    }
  }).current;

  if (!slides.length) return null;

  if (slides.length === 1) {
    return (
      <View style={styles.wrap}>
        <Image source={{ uri: slides[0].uri }} style={styles.banner} resizeMode="cover" />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={BANNER_WIDTH}
        snapToAlignment="start"
        disableIntervalMomentum
        keyExtractor={item => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScrollBeginDrag={stopAutoRotate}
        onMomentumScrollEnd={startAutoRotate}
        getItemLayout={(_, index) => ({
          length: BANNER_WIDTH,
          offset: BANNER_WIDTH * index,
          index,
        })}
        renderItem={({ item }) => (
          <Image source={{ uri: item.uri }} style={styles.banner} resizeMode="cover" />
        )}
      />

      <View style={styles.dotsRow}>
        {slides.map((slide, index) => (
          <View
            key={slide.id}
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
  banner: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    backgroundColor: colors.lightGray,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.white,
  },
});

export default HomeBannerCarousel;
