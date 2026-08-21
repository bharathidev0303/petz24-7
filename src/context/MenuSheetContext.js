import React, { createContext, useContext, useMemo, useState } from 'react';

const MenuSheetContext = createContext(null);

export const MenuSheetProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);

  const value = useMemo(
    () => ({
      visible,
      openMenuSheet: () => setVisible(true),
      closeMenuSheet: () => setVisible(false),
      toggleMenuSheet: () => setVisible(prev => !prev),
    }),
    [visible],
  );

  return <MenuSheetContext.Provider value={value}>{children}</MenuSheetContext.Provider>;
};

export const useMenuSheet = () => {
  const context = useContext(MenuSheetContext);
  if (!context) {
    throw new Error('useMenuSheet must be used within MenuSheetProvider');
  }
  return context;
};
