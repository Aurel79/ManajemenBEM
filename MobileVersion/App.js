import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Set Notification Handler (foreground behavior)
// Notification Handler moved inside component

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import AdminDashboard from './src/screens/AdminDashboard';
import PresidenDashboard from './src/screens/PresidenDashboard';
import MenteriDashboard from './src/screens/MenteriDashboard';
import AnggotaDashboard from './src/screens/AnggotaDashboard';
import SuperAdminDashboard from './src/screens/SuperAdminDashboard';
import ActivityLogScreen from './src/screens/ActivityLogScreen';
import RolesScreen from './src/screens/RolesScreen';
import UserAccountScreen from './src/screens/UserAccountScreen';
import ManajemenProposalScreen from './src/screens/ManajemenProposalScreen';
import KementerianScreen from './src/screens/KementerianScreen';
import LaporanScreen from './src/screens/LaporanScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import { authService } from './src/services/authService';

const Stack = createNativeStackNavigator();

// Component untuk handle navigation berdasarkan role
function AppNavigator() {
  const { user, loading, isAuthenticated, getPrimaryRole } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false); // Start with false
  const [isLoading, setIsLoading] = useState(true);

  // Push Notification Registration Logic
  useEffect(() => {
    checkOnboarding();

    // Setup Notification Handler safely
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    } catch (error) {
      console.log('Failed to set notification handler:', error);
    }

    if (isAuthenticated && user) {
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          console.log('Device Token:', token);
          authService.saveDeviceToken(token, Platform.OS);
        }
      });
    }
  }, [isAuthenticated, user]);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('announcements', {
        name: 'Announcements',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      } catch (e) {
        token = (await Notifications.getExpoPushTokenAsync()).data;
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  const checkOnboarding = async () => {
    try {
      // DEVELOPMENT MODE: Reset onboarding agar selalu muncul saat testing
      // COMMENT BARIS INI SAAT PRODUCTION/FINAL BUILD!
      await AsyncStorage.removeItem('hasSeenOnboarding');

      // Force set ke false untuk memastikan onboarding selalu muncul di development
      setHasSeenOnboarding(false);

      console.log('✅ [DEV] Onboarding reset - will always show');
    } catch (error) {
      console.log('Onboarding check error:', error);
      // Jika error, tetap set false agar onboarding muncul
      setHasSeenOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Get dashboard screen berdasarkan role
  // All roles now use SuperAdminDashboard with role-based menus
  const getDashboardScreen = () => {
    if (!user || !user.roles || user.roles.length === 0) {
      return 'Welcome';
    }

    // All roles use the unified dashboard with role-based access
    return 'SuperAdminDashboard';
  };

  if (isLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff0000" />
      </View>
    );
  }

  // Determine initial route
  const getInitialRoute = () => {
    // DEVELOPMENT: Always show onboarding (hasSeenOnboarding is always false)
    if (!hasSeenOnboarding) {
      return 'Onboarding';
    }

    // Production logic (jika hasSeenOnboarding = true)
    if (isAuthenticated) {
      return getDashboardScreen();
    }

    return 'Login';
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
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
        <Stack.Screen name="SuperAdminDashboard" component={SuperAdminDashboard} />
        <Stack.Screen name="ActivityLog" component={ActivityLogScreen} />
        <Stack.Screen name="Roles" component={RolesScreen} />
        <Stack.Screen name="UserManagement" component={UserAccountScreen} />
        <Stack.Screen name="ProposalManagement" component={ManajemenProposalScreen} />
        <Stack.Screen name="ProgramKerjaManagement" component={ManajemenProposalScreen} />
        <Stack.Screen name="MinistryManagement" component={KementerianScreen} />
        <Stack.Screen name="Reports" component={LaporanScreen} />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
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
