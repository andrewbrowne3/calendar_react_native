/**
 * Calendar App - React Native with TypeScript
 * Clean, fast, and functional!
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { AppNavigator } from './src/navigation/AppNavigator';
import { store, persistor } from './src/store/store';
import { COLORS } from './src/constants/config';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <StatusBar 
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={COLORS.BACKGROUND.PRIMARY}
          />
          <AppNavigator />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
