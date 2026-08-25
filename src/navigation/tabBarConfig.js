export const TAB_BAR_HEIGHT = 68;
export const TAB_BAR_HEIGHT_COMPACT = 56;

export const TAB_LABEL_STYLE = {
  fontSize: 11,
  fontWeight: '600',
  marginBottom: 2,
};

export const getTabBarStyle = colors => ({
  borderTopColor: colors.border,
  backgroundColor: colors.tabBar,
  paddingTop: 8,
  paddingBottom: 8,
  height: TAB_BAR_HEIGHT,
  overflow: 'visible',
});

export const getTabBarStyleCompact = colors => ({
  borderTopColor: colors.border,
  backgroundColor: colors.tabBar,
  paddingTop: 6,
  paddingBottom: 6,
  height: TAB_BAR_HEIGHT_COMPACT,
  overflow: 'hidden',
});
