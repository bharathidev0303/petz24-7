import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AppHeader from './AppHeader';
import { useSidebar } from '../../context/SidebarContext';
import { useMenuSheet } from '../../context/MenuSheetContext';
import { useThemedStyles } from '../../theme/useThemedStyles';

const ScreenLayout = ({
  children,
  showSearch = true,
  searchPlaceholder,
  searchEditable = true,
  autoFocusSearch = false,
  onSearchSubmit,
  onSearchPress,
  onLogoPress,
  searchValue: controlledSearchValue,
  onSearchChange: controlledOnSearchChange,
  headerBackgroundColor,
  bodyBackgroundColor,
  searchBackgroundColor,
  title,
  showLogo = true,
  showFilter = false,
  onFilterPress,
  filterActive = false,
}) => {
  const styles = useThemedStyles(createStyles);
  const { openSidebar } = useSidebar();
  const { closeMenuSheet } = useMenuSheet();

  const handleLogoPress = () => {
    closeMenuSheet();
    openSidebar();
  };
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const searchQuery = controlledSearchValue ?? internalSearchQuery;
  const setSearchQuery = controlledOnSearchChange ?? setInternalSearchQuery;

  return (
    <View style={[styles.container, bodyBackgroundColor && { backgroundColor: bodyBackgroundColor }]}>
      <AppHeader
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={() => onSearchSubmit?.(searchQuery)}
        onSearchPress={onSearchPress}
        onLogoPress={onLogoPress ?? handleLogoPress}
        placeholder={searchPlaceholder}
        showSearch={showSearch}
        searchEditable={searchEditable}
        autoFocusSearch={autoFocusSearch}
        backgroundColor={headerBackgroundColor}
        searchBackgroundColor={searchBackgroundColor}
        title={title}
        showLogo={showLogo}
        showFilter={showFilter}
        onFilterPress={onFilterPress}
        filterActive={filterActive}
      />
      <View style={[styles.content, bodyBackgroundColor && { backgroundColor: bodyBackgroundColor }]}>
        {children}
      </View>
    </View>
  );
};

const createStyles = colors => ({
  container: {
    flex: 1,
    backgroundColor: colors.homeBody,
  },
  content: {
    flex: 1,
  },
});

export default ScreenLayout;
