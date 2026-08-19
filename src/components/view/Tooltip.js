import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN = Dimensions.get('window');
const SCREEN_WIDTH = SCREEN.width;
const SCREEN_HEIGHT = SCREEN.height;
const PADDING = 16;
const ARROW_SIZE = 8;

const Tooltip = ({
  children,
  content,
  placement = 'center',
  verticalOffset = 6,
  tooltipWidth = 220,
  style,
  backgroundColor = '#fff',
}) => {
  const triggerRef = useRef(null);
  const insets = useSafeAreaInsets();
  const [layout, setLayout] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showAbove, setShowAbove] = useState(false);
  const [tooltipHeight, setTooltipHeight] = useState(0);
  const [isMeasured, setIsMeasured] = useState(false);

  const resolvedWidth = useMemo(() => {
    if (typeof tooltipWidth === 'string' && tooltipWidth.endsWith('%')) {
      return (SCREEN_WIDTH * parseFloat(tooltipWidth)) / 100;
    }
    return tooltipWidth;
  }, [tooltipWidth]);

  const open = () => {
    setIsMeasured(false);
    setTooltipHeight(0);
    requestAnimationFrame(() => {
      triggerRef.current?.measureInWindow((x, y, w, h) => {
        const spaceBelow = SCREEN_HEIGHT - (y + h);
        setShowAbove(spaceBelow < 120);
        setLayout({ x, y, w, h });
        setVisible(true);
      });
    });
  };

  const close = () => setVisible(false);

  const tooltipLeft = useMemo(() => {
    if (!layout) return 0;
    let left =
      placement === 'left'
        ? layout.x
        : placement === 'right'
          ? layout.x + layout.w - resolvedWidth
          : layout.x + layout.w / 2 - resolvedWidth / 2;
    return Math.min(Math.max(left, PADDING), SCREEN_WIDTH - resolvedWidth - PADDING);
  }, [layout, placement, resolvedWidth]);

  const arrowLeft = useMemo(() => {
    if (!layout) return 0;
    const triggerCenterX = layout.x + layout.w / 2;
    const rawLeft = triggerCenterX - tooltipLeft - ARROW_SIZE;
    return Math.min(Math.max(rawLeft, ARROW_SIZE), resolvedWidth - ARROW_SIZE * 2);
  }, [layout, tooltipLeft, resolvedWidth]);

  const tooltipTop = useMemo(() => {
    if (!layout) return 0;
    const belowY = layout.y + layout.h + verticalOffset + ARROW_SIZE;
    const aboveY = layout.y - tooltipHeight - verticalOffset - ARROW_SIZE;
    let finalTop = showAbove ? aboveY : belowY;
    const minTop = insets.top + 8;
    const maxTop = SCREEN_HEIGHT - tooltipHeight - insets.bottom - 8;
    return Math.min(Math.max(finalTop, minTop), maxTop);
  }, [layout, showAbove, tooltipHeight, insets, verticalOffset]);

  if (!visible || !layout) {
    return (
      <TouchableOpacity ref={triggerRef} onPress={open} style={style}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <>
      <TouchableOpacity ref={triggerRef} onPress={open} style={style}>
        {children}
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={visible}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <View
          style={[
            styles.tooltipContainer,
            { top: tooltipTop, left: tooltipLeft, width: resolvedWidth, opacity: isMeasured ? 1 : 0 },
          ]}>
          <View
            style={[
              styles.arrow,
              showAbove ? styles.arrowDown : styles.arrowUp,
              {
                left: arrowLeft,
                borderBottomColor: !showAbove ? backgroundColor : 'transparent',
                borderTopColor: showAbove ? backgroundColor : 'transparent',
              },
            ]}
          />
          <View
            onLayout={e => {
              const h = e.nativeEvent.layout.height;
              if (!tooltipHeight) {
                setTooltipHeight(h);
                setIsMeasured(true);
              }
            }}
            style={[styles.card, { backgroundColor }]}>
            {content}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Tooltip;

const styles = StyleSheet.create({
  tooltipContainer: { position: 'absolute', zIndex: 9999 },
  card: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 6,
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: ARROW_SIZE,
    borderRightWidth: ARROW_SIZE,
  },
  arrowUp: {
    top: -ARROW_SIZE,
    borderBottomWidth: ARROW_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  arrowDown: {
    bottom: -ARROW_SIZE,
    borderTopWidth: ARROW_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
