export const ACCENT_PRESETS = [
  {
    id: 'brand',
    label: 'Brand Red',
    primary: '#AB041F',
    primaryLight: '#C9354D',
    button: '#06294F',
  },
  {
    id: 'blue',
    label: 'Ocean Blue',
    primary: '#0984E3',
    primaryLight: '#74B9FF',
    button: '#0652DD',
  },
  {
    id: 'green',
    label: 'Forest Green',
    primary: '#00B894',
    primaryLight: '#55EFC4',
    button: '#006266',
  },
  {
    id: 'purple',
    label: 'Royal Purple',
    primary: '#6C5CE7',
    primaryLight: '#A29BFE',
    button: '#4834D4',
  },
  {
    id: 'orange',
    label: 'Warm Orange',
    primary: '#E17055',
    primaryLight: '#FAB1A0',
    button: '#D35400',
  },
  {
    id: 'teal',
    label: 'Teal',
    primary: '#00CEC9',
    primaryLight: '#81ECEC',
    button: '#00897B',
  },
];

export const DEFAULT_ACCENT_ID = 'brand';

export const getAccentPreset = accentId =>
  ACCENT_PRESETS.find(preset => preset.id === accentId) ?? ACCENT_PRESETS[0];

export const CUSTOM_ACCENT_ID = 'custom';

export const ACCENT_UI_PRESETS = [
  ...ACCENT_PRESETS,
  { id: CUSTOM_ACCENT_ID, label: 'Custom', primary: null, primaryLight: null, button: null },
];
