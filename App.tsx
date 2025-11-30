/**
 * MaquisPro+ - Application Principale
 * Version 1.0.1
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { BarProvider } from './src/contexts/BarContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <BarProvider>
          <AppNavigator />
          <StatusBar style="light" />
        </BarProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
