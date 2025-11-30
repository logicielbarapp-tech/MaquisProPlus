/**
 * MaquisPro+ - Navigation Principale
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Colors } from '../utils/theme';

// Écrans d'authentification
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Écrans par rôle
import OwnerDashboardScreen from '../screens/owner/OwnerDashboardScreen';
import CashierDashboardScreen from '../screens/cashier/CashierDashboardScreen';
import WaiterDashboardScreen from '../screens/waiter/WaiterDashboardScreen';

const Stack = createStackNavigator();

export const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!user ? (
          // Écrans non authentifiés
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Écrans authentifiés basés sur le rôle
          <>
            {user.role === 'owner' && (
              <Stack.Screen name="OwnerDashboard" component={OwnerDashboardScreen} />
            )}
            {user.role === 'cashier' && (
              <Stack.Screen name="CashierDashboard" component={CashierDashboardScreen} />
            )}
            {user.role === 'waiter' && (
              <Stack.Screen name="WaiterDashboard" component={WaiterDashboardScreen} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

export default AppNavigator;
