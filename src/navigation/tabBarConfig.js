import { colors } from '../styles/colors';

export const TAB_BAR_HEIGHT = 68;
export const TAB_BAR_HEIGHT_COMPACT = 56;

export const TAB_BAR_STYLE = {
  borderTopColor: colors.border,
  backgroundColor: colors.white,
  paddingTop: 8,
  paddingBottom: 8,
  height: TAB_BAR_HEIGHT,
  overflow: 'visible',
};

export const TAB_BAR_STYLE_COMPACT = {
  borderTopColor: colors.border,
  backgroundColor: colors.white,
  paddingTop: 6,
  paddingBottom: 6,
  height: TAB_BAR_HEIGHT_COMPACT,
  overflow: 'hidden',
};

export const TAB_LABEL_STYLE = {
  fontSize: 11,
  fontWeight: '600',
  marginBottom: 2,
};
