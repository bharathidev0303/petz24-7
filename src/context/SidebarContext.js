import React, { createContext, useContext, useState, useMemo } from 'react';

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);

  const value = useMemo(
    () => ({
      visible,
      openSidebar: () => setVisible(true),
      closeSidebar: () => setVisible(false),
      toggleSidebar: () => setVisible(prev => !prev),
    }),
    [visible],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};
