import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const MenteriDashboard = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Yakin ingin logout?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const menuItems = [
    { id: 1, title: 'Proposal Saya', icon: 'document-text', screen: 'MyProposals' },
    { id: 2, title: 'Buat Proposal', icon: 'add-circle', screen: 'CreateProposal' },
    { id: 3, title: 'Program Kerja', icon: 'calendar', screen: 'ProgramKerja' },
    { id: 4, title: 'Anggota Kementerian', icon: 'people', screen: 'AnggotaKementerian' },
  ];

  return (
    <LinearGradient
      colors={['#9A0020', '#000']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Dashboard Menteri</Text>
          <Text style={styles.userName}>{user?.name}</Text>
          {user?.ministry_id && (
            <Text style={styles.ministryInfo}>Kementerian ID: {user.ministry_id}</Text>
          )}
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.menuGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name={item.icon} size={32} color="#FFFFFF" />
                <Text style={styles.menuText}>{item.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  ministryInfo: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  menuContainer: {
    marginBottom: 20,
  },
  menuItem: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  menuText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 15,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MenteriDashboard;

