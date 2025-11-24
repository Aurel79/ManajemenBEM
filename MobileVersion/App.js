import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import AdminDashboard from './src/screens/AdminDashboard';
import PresidenDashboard from './src/screens/PresidenDashboard';
import MenteriDashboard from './src/screens/MenteriDashboard';
import AnggotaDashboard from './src/screens/AnggotaDashboard';
import { authService } from './src/services/authService';

const Stack = createNativeStackNavigator();

// Component untuk handle navigation berdasarkan role
function AppNavigator() {
  const { user, loading, isAuthenticated, getPrimaryRole } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      // DEVELOPMENT MODE: Reset onboarding agar selalu muncul saat testing
      // COMMENT BARIS INI SAAT PRODUCTION/FINAL BUILD!
      await AsyncStorage.removeItem('hasSeenOnboarding');
      console.log('✅ Onboarding reset for development');
      
      // Force set to false untuk memastikan onboarding muncul
      const seenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      const hasSeen = seenOnboarding === 'true';
      
      // DEVELOPMENT: Force show onboarding
      setHasSeenOnboarding(false);
      
      // Debug log
      console.log('📱 Onboarding check:', { 
        seenOnboarding, 
        hasSeen, 
        willShow: true, // Always show in development
        platform: 'mobile'
      });
    } catch (error) {
      console.log('Onboarding check error:', error);
      setHasSeenOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Get dashboard screen berdasarkan role
  const getDashboardScreen = () => {
    if (!user || !user.roles || user.roles.length === 0) {
      return 'Welcome';
    }

    const primaryRole = getPrimaryRole();
    
    // Mapping role dari DatabaseSeeder ke Dashboard
    switch (primaryRole) {
      case 'Super Admin':
      case 'Admin':
      case 'Sekretaris':
      case 'Bendahara':
        return 'AdminDashboard';
      case 'Presiden BEM':
      case 'Presiden':
      case 'Wakil Presiden BEM':
        return 'PresidenDashboard';
      case 'Menteri':
        return 'MenteriDashboard';
      case 'Anggota':
        return 'AnggotaDashboard';
      default:
        return 'Welcome';
    }
  };

  if (isLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff0000" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={
          !hasSeenOnboarding
            ? 'Onboarding'
            : isAuthenticated
            ? getDashboardScreen()
            : 'Login'
        }
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="PresidenDashboard" component={PresidenDashboard} />
        <Stack.Screen name="MenteriDashboard" component={MenteriDashboard} />
        <Stack.Screen name="AnggotaDashboard" component={AnggotaDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
