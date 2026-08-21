import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

export const mainStackRef = createNavigationContainerRef();

export const navigateFromSidebar = item => {
  if (!mainStackRef.isReady() || !item) return;

  if (item.tab) {
    mainStackRef.dispatch(
      CommonActions.navigate('MainApp', {
        screen: 'Tabs',
        params: { screen: item.tab },
      }),
    );
    return;
  }

  if (item.screen) {
    mainStackRef.dispatch(
      CommonActions.navigate('MainApp', {
        screen: item.screen,
      }),
    );
  }
};

export const navigateInMainApp = (screen, params) => {
  if (!mainStackRef.isReady()) return;

  mainStackRef.dispatch(
    CommonActions.navigate('MainApp', {
      screen,
      params,
    }),
  );
};

export const navigateToTab = tabName => {
  if (!mainStackRef.isReady()) return;

  mainStackRef.dispatch(
    CommonActions.navigate('MainApp', {
      screen: 'Tabs',
      params: { screen: tabName },
    }),
  );
};
