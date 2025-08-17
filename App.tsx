/**
 * Calendar App - React Native with TypeScript
 * Clean, fast, and functional!
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigator } from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/config';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={COLORS.BACKGROUND.PRIMARY}
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
