import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const DROPDOWN_HEIGHT = 260;

const CustomDropdown = ({
  data = [],
  value,
  onChange,
  children,
  multiple = false,
  dref,
  disabled,
  dropdownWidth,
  minWidth = 180,
  topOffset = 2,
}) => {
  const inputRef = dref ?? useRef(null);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ openUp: false, top: 0, bottom: 0, left: 0, width: 0 });

  const isSelected = item => {
    if (multiple) return Array.isArray(value) && value.includes(item.value);
    return value === item.value;
  };

  const openDropdown = () => {
    if (!inputRef.current || disabled) return;

    inputRef.current.measureInWindow((x, y, w, height) => {
      const spaceBelow = SCREEN_HEIGHT - (y + height);
      const openUp = spaceBelow < DROPDOWN_HEIGHT;
      const finalWidth = dropdownWidth ?? Math.max(w, minWidth);

      let adjustedLeft = x;
      if (x + finalWidth > SCREEN_WIDTH) adjustedLeft = SCREEN_WIDTH - finalWidth - 10;
      if (adjustedLeft < 10) adjustedLeft = 10;

      setPosition({
        openUp,
        top: y + height + topOffset,
        bottom: SCREEN_HEIGHT - y + 6,
        left: adjustedLeft,
        width: finalWidth,
      });
      setVisible(true);
    });
  };

  const handleSelect = item => {
    if (multiple) {
      let updated = Array.isArray(value) ? [...value] : [];
      updated = updated.includes(item.value)
        ? updated.filter(v => v !== item.value)
        : [...updated, item.value];
      onChange(updated);
    } else {
      onChange(item.value);
      setVisible(false);
    }
  };

  return (
    <>
      <TouchableOpacity ref={inputRef} onPress={openDropdown} activeOpacity={0.8} disabled={disabled}>
        {children}
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View
            style={[
              styles.dropdown,
              { left: position.left, width: position.width },
              position.openUp ? { bottom: position.bottom } : { top: position.top },
            ]}>
            <FlatList
              data={data}
              keyExtractor={item => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.item, isSelected(item) && styles.selectedItem]}
                  onPress={() => handleSelect(item)}>
                  <Text style={styles.itemText}>{item.label}</Text>
                  {multiple ? (
                    <Text style={styles.checkbox}>{isSelected(item) ? '☑' : '☐'}</Text>
                  ) : (
                    isSelected(item) && <Text style={styles.checkbox}>✔</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.05)' },
  dropdown: {
    position: 'absolute',
    maxHeight: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedItem: { backgroundColor: '#F6F6F6' },
  itemText: { fontSize: 14, color: '#333' },
  checkbox: { fontSize: 16 },
});
